import * as cookie from 'cookie'
import User from '@/models/User'
import Game from '@/models/Game'
import { Server, Socket } from 'socket.io'
import { checkWinner } from '@/lib/gameLogic'
import { authUser, generateRoomCode } from '@/lib/utils'

// Track which socket is in which room
const socketIdToRoomId = new Map<string, string>()

export default (io: Server) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = getToken(socket)
      if (!token) return next(new Error('Authentication failed.'))
      const user = await authUser(token)
      if (!user) return next(new Error('Authentication failed.'))
      socket.data.user = user
      next()
    } catch (err) {
      console.error('Error during authentication:', err)
      next(new Error('Authentication failed.'))
    }
  })

  io.on('connection', (socket: Socket) => {
    console.log('✅ New client connected', socket.id)

    // Log all incoming events for debugging
    socket.onAny((event, ...args) => {
      console.log(`🔊 Event received: ${event}`, args)
    })

    // Create a new game room
    socket.on('createGame', async () => {
      try {
        if (await isUserInActiveGame(socket)) return

        const { roomId, newGame } = await createNewGame(socket)
        socket.join(roomId)
        socketIdToRoomId.set(socket.id, roomId)

        socket.emit('gameCreated', formatGameCreated(newGame, roomId))
        console.log(
          `✨ Game created with ID ${roomId} by ${socket.data.user.name}`,
        )
      } catch (err) {
        handleError(socket, 'Could not create game, please try again.', err)
      }
    })

    // Join an existing game room
    socket.on('joinGame', async (roomId: string) => {
      try {
        if (await isUserInActiveGame(socket)) return

        const game = await Game.findOne({ roomId })
        if (!game)
          return emitGameError(socket, 'Game not found.', 'game_not_found')
        if (game.status !== 'waiting')
          return emitGameError(
            socket,
            'Game is not available to join.',
            'game_not_available',
          )
        if (game.players.length >= 2)
          return emitGameError(socket, 'Room is full.', 'room_full')
        if (game.players[0].user_id.equals(socket.data.user._id))
          return emitGameError(
            socket,
            'You cannot join your own game.',
            'own_game',
          )

        // Add new player to the game
        game.players.push({
          user_id: socket.data.user._id,
          symbol: 'O',
          isHost: false,
        })
        game.status = 'playing'
        game.turn = 'X'
        await game.save()

        socket.join(roomId)
        socketIdToRoomId.set(socket.id, roomId)

        // Send updated game state to both players
        const populatedGame = await Game.findById(game._id).populate(
          'players.user_id',
        )
        const opponent = await getOpponent(populatedGame, socket.data.user._id)
        socket.emit('startGame', formatStartGame(populatedGame, opponent))
        io.to(roomId).emit('gameStarted')
        console.log(`🤝 ${socket.data.user.name} joined game ${roomId}`)
      } catch (err) {
        handleError(socket, 'Could not join game.', err)
      }
    })

    // Handle player move
    socket.on(
      'makeMove',
      async ({ roomId, index }: { roomId: string; index: number }) => {
        try {
          const game = await Game.findOne({ roomId })
          if (!game || game.status !== 'playing')
            return emitGameError(socket, 'Game is not currently active.')

          const player = game.players.find((p: any) =>
            p.user_id.equals(socket.data.user._id),
          )
          if (!player || player.symbol !== game.turn)
            return emitGameError(socket, "It's not your turn.")
          if (game.board[index] !== null)
            return emitGameError(socket, 'This cell is already taken.')

          // Update board and check for winner
          game.board[index] = player.symbol
          game.markModified('board')

          // Record the move
          game.moves.push({ symbol: player.symbol, position: index })

          const gameResult = checkWinner(game.board)

          if (gameResult) {
            game.status = 'completed'
            game.winner = gameResult.winner
            if (gameResult.winner !== 'draw') {
              game.winningLine = gameResult.line
            }
            await game.save()
            io.to(roomId).emit('gameEnd', {
              result: { winner: game.winner, winningLine: gameResult.line },
            })
            console.log(`🏆 Game ${roomId} ended. Winner: ${game.winner}`)
          } else {
            game.turn = game.turn === 'X' ? 'O' : 'X'
            await game.save()
            const populatedGame = await Game.findById(game._id).populate(
              'players.user_id',
            )
            io.to(roomId).emit('updateGame', populatedGame)
          }
        } catch (err) {
          handleError(socket, 'An error occurred during your move.', err)
        }
      },
    )

    // Play again
    socket.on('playAgain', async ({ roomId }: { roomId: string }) => {
      try {
        const oldGame = await Game.findOne({ roomId }).populate(
          'players.user_id',
        )
        if (!oldGame) {
          return emitGameError(socket, 'Original game not found.')
        }

        // Determine the new host (the player who was not the host before)
        const newHost = oldGame.players.find((p: any) => !p.isHost)
        const newGuest = oldGame.players.find((p: any) => p.isHost)

        if (!newHost || !newGuest) {
          return emitGameError(
            socket,
            'Could not determine players for a rematch.',
          )
        }

        const newRoomId = generateRoomCode()
        const newGame = new Game({
          roomId: newRoomId,
          players: [
            { user_id: newHost.user_id._id, symbol: 'X', isHost: true },
            { user_id: newGuest.user_id._id, symbol: 'O', isHost: false },
          ],
          status: 'playing',
          turn: 'X',
        })
        await newGame.save()

        // Update sockets to join the new room
        const socketsInRoom = await io.in(roomId).fetchSockets()
        socketsInRoom.forEach(s => {
          s.leave(roomId)
          s.join(newRoomId)
          socketIdToRoomId.set(s.id, newRoomId)
        })

        const populatedGame = await Game.findById(newGame._id).populate(
          'players.user_id',
        )

        // Notify each player with their specific opponent
        const newSocketsInRoom = await io.in(newRoomId).fetchSockets()
        for (const s of newSocketsInRoom) {
          const user = s.data.user
          const opponentPlayer = populatedGame.players.find(
            (p: any) => !p.user_id.equals(user._id),
          )
          const opponent = opponentPlayer ? opponentPlayer.user_id : null
          s.emit('rematchStarted', formatStartGame(populatedGame, opponent))
        }

        console.log(
          `🔄 Rematch started for room ${roomId}. New room is ${newRoomId}`,
        )
      } catch (err) {
        handleError(socket, 'Could not start a rematch.', err)
      }
    })

    // Leave the game room
    socket.on('leaveGame', async (roomId: string) => {
      try {
        const game = await Game.findOne({ roomId })
        if (!game) return emitGameError(socket, 'Game not found.')

        // Remove player from game
        game.players = game.players.filter(
          (p: any) => !p.user_id.equals(socket.data.user._id),
        )
        if (game.players.length === 0) {
          await game.deleteOne()
        } else {
          await game.save()
        }

        socket.leave(roomId)
        socketIdToRoomId.delete(socket.id)
        socket.emit('leftGame')
        io.to(roomId).emit('playerLeft', { userId: socket.data.user._id })
      } catch (err) {
        handleError(socket, 'Could not leave game.', err)
      }
    })

    // Get current game state for reconnects or refreshes
    socket.on('getState', async () => {
      const roomId = socketIdToRoomId.get(socket.id)
      if (!roomId) return socket.emit('noActiveGame')

      const game = await Game.findOne({
        roomId,
        status: { $in: ['waiting', 'playing'] },
      })
      if (!game) return socket.emit('noActiveGame')

      if (game.status === 'waiting') {
        socket.join(roomId)
        socketIdToRoomId.set(socket.id, roomId)
        socket.emit('roomState', { roomId })
      } else if (game.status === 'playing') {
        const opponent = await getOpponent(game, socket.data.user._id)
        socket.join(roomId)
        socketIdToRoomId.set(socket.id, roomId)
        socket.emit('gameState', {
          roomId: game.roomId,
          turn: game.turn,
          board: game.board,
          status: game.status,
          opponent: opponent
            ? { id: opponent._id, name: opponent.name, avatar: opponent.avatar }
            : null,
        })
      } else {
        socket.emit('noActiveGame')
      }
    })

    // Handle disconnects and declare winner if needed
    socket.on('disconnect', () => {
      console.log('🔥 Client disconnected:', socket.id)
      const roomId = socketIdToRoomId.get(socket.id)
      const disconnectedUserId = socket.data.user._id
      const socketId = socket.id

      setTimeout(async () => {
        if (roomId && disconnectedUserId) {
          try {
            const game = await Game.findOne({ roomId })
            if (game && game.status === 'playing') {
              const remainingPlayer = game.players.find(
                (p: any) => !p.user_id.equals(disconnectedUserId),
              )
              if (remainingPlayer) {
                game.status = 'completed'
                game.winner = remainingPlayer.symbol
                await game.save()
                io.to(roomId).emit('opponentLeft')
                console.log(
                  `👋 Player left game ${roomId}. Winner: ${remainingPlayer.symbol}`,
                )
              }
            }
          } catch (err) {
            console.error('Error handling disconnect:', err)
          }
          socketIdToRoomId.delete(socketId)
        }
      }, 10000)
    })

    // Initialize game state for reconnects
    initializeGame(socket)
  })

  // --- Helper Functions ---

  // Extract token from socket handshake
  function getToken(socket: Socket): string | null {
    const token = cookie.parse(socket.handshake.headers.cookie || '').token
    return token || null
  }

  // Check if user is already in an active game
  async function isUserInActiveGame(socket: Socket): Promise<boolean> {
    const roomId = socketIdToRoomId.get(socket.id)
    if (roomId) {
      const game = await Game.findOne({
        roomId,
        'players.user_id': socket.data.user._id,
        status: { $in: ['waiting', 'playing'] },
      })
      if (game) return true
    }
    const existingGame = await Game.findOne({
      'players.user_id': socket.data.user._id,
      status: { $in: ['waiting', 'playing'] },
    })
    if (existingGame) socketIdToRoomId.set(socket.id, existingGame.roomId)
    return !!existingGame
  }

  // Create a new game instance
  async function createNewGame(socket: Socket) {
    const roomId = generateRoomCode()
    const newGame = new Game({
      roomId,
      players: [
        {
          user_id: socket.data.user._id,
          symbol: 'X',
          isHost: true,
        },
      ],
      status: 'waiting',
    })
    await newGame.save()
    return { roomId, newGame }
  }

  // Initialize game state for reconnects
  async function initializeGame(socket: Socket) {
    if (!(await isUserInActiveGame(socket))) return
    const roomId = socketIdToRoomId.get(socket.id)
    if (!roomId) return
    const game = await Game.findOne({ roomId })
    if (!game || game.status === 'completed') return
    socket.emit('inGame')
  }

  // Format gameCreated event payload
  function formatGameCreated(game: any, roomId: string) {
    return {
      roomId,
      board: game.board,
      status: game.status,
      players: game.players.map((p: any) => ({
        id: p.user_id,
        isHost: p.isHost,
        symbol: p.symbol,
      })),
    }
  }

  // Format startGame event payload
  function formatStartGame(game: any, opponent: any) {
    return {
      roomId: game.roomId,
      opponent: opponent
        ? {
            id: opponent._id,
            name: opponent.name,
            avatar: opponent.avatar,
          }
        : null,
      board: game.board,
      status: game.status,
      players: game.players.map((p: any) => ({
        id: p.user_id._id,
        name: p.user_id.name,
        avatar: p.user_id.avatar,
        isHost: p.isHost,
        symbol: p.symbol,
      })),
      turn: game.turn,
    }
  }

  // Get opponent user info
  async function getOpponent(game: any, userId: any) {
    const opponentPlayer = game.players.find(
      (p: any) => !p.user_id.equals(userId),
    )
    return opponentPlayer
      ? await User.findById(opponentPlayer.user_id).select('_id name avatar')
      : null
  }

  // Emit standardized error event
  function emitGameError(socket: Socket, message: string, status?: string) {
    socket.emit('error', { message, status })
  }

  // Handle errors and log them
  function handleError(socket: Socket, message: string, err: any) {
    socket.emit('error', message)
    console.error(message, err)
  }
}
