import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useNotificationStore } from './notificationStore'
import axios from '@/composables/axios'
import { useRouter } from 'vue-router'
import { useSocket } from '@/composables/useSocket'

export type GameState = 'idle' | 'waiting' | 'playing' | 'completed'
export type Player = 'X' | 'O' | null
export type Board = Player[]

export interface GameResult {
  winner: Player | 'draw'
  winningLine?: number[]
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
}

export const useGameStore = defineStore(
  'game',
  () => {
    const socket = useSocket()
    const router = useRouter()
    const notificationStore = useNotificationStore()

    // State
    const currentUser = ref<User | null>(null)
    const opponent = ref<User | null>(null)
    const gameState = ref<GameState>('idle')
    const board = ref<Board>(Array(9).fill(null))
    const currentPlayer = ref<Player>('X')
    const roomCode = ref<string>('')
    const gameResult = ref<GameResult | null>(null)
    const isHost = ref<boolean>(false)
    const mySymbol = ref<Player>(null)
    const isJoiningGame = ref<boolean>(false)

    // Watchers
    watch(currentUser, newUser => {
      if (newUser) {
        if (router.currentRoute.value.name === 'login') {
          router.push('/lobby')
        }
      } else {
        router.push('/')
      }
    })

    // Computed
    const isMyTurn = computed(() => {
      if (!currentUser.value || gameState.value !== 'playing') return false
      return currentPlayer.value === mySymbol.value
    })

    const opponentSymbol = computed(() => (mySymbol.value === 'X' ? 'O' : 'X'))

    // Actions
    const loginUser = (user: User) => {
      currentUser.value = user
      gameState.value = 'idle'

      router.push('/lobby')
    }

    const logout = () => {
      if (!currentUser.value) return
      notificationStore.showSuccess(`Goodbye, ${currentUser.value?.name}!`)

      currentUser.value = null
      opponent.value = null
      gameState.value = 'idle'
      resetGame()

      axios.post('/api/logout').catch(err => {
        console.error('Error logging out:', err)
      })
    }

    const createGame = () => {
      socket.emit('createGame')
    }

    const joinGame = (code: string) => {
      socket.emit('joinGame', code)
      resetBoard()
    }

    const opponentJoined = (opponentUser: User) => {
      opponent.value = opponentUser
      gameState.value = 'playing'
    }

    const makeMove = (index: number): boolean => {
      if (
        board.value[index] ||
        !isMyTurn.value ||
        gameState.value !== 'playing'
      ) {
        return false
      }

      socket.emit('makeMove', { index, roomId: roomCode.value })

      return true
    }

    const resetGame = () => {
      resetBoard()
      gameResult.value = null
      currentPlayer.value = 'X'
    }

    const resetBoard = () => {
      board.value = Array(9).fill(null)
    }

    const backToLobby = () => {
      gameState.value = 'idle'
      opponent.value = null
      roomCode.value = ''
      isHost.value = false
      gameResult.value = null
      resetGame()

      router.push('/')
    }

    const playAgain = () => {
      notificationStore.showSuccess('Play Again feature will come soon!')
      return false
      resetGame()
      gameState.value = 'waiting'

      socket.emit('playAgain', roomCode.value)
    }

    const leaveGame = () => {
      socket.emit('leaveGame', roomCode.value)
    }

    const checkGameStatus = () => {
      socket.emit('getState', roomCode.value)
    }

    // socket events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      notificationStore.showSuccess('Socket connected')
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      notificationStore.showError('Socket disconnected')
    })

    socket.on('error', error => {
      console.error('Socket error:', error)

      switch (error.status) {
        case 'game_not_found':
          notificationStore.showError('Room not found')
          isJoiningGame.value = false
          break

        default:
          notificationStore.showError(error.message || 'Socket error')
          break
      }
    })

    socket.on('message', message => {
      console.log('Socket message:', message)
      notificationStore.showInfo(message)
    })

    socket.on(
      'gameCreated',
      (game: {
        roomId: string
        status: GameState
        board: Board
        players: any[]
      }) => {
        console.log('Game created:', game)
        roomCode.value = game.roomId
        gameState.value = game.status
        board.value = game.board
        mySymbol.value = game.players[0].symbol
        isHost.value = game.players[0].id === currentUser.value?.id

        notificationStore.showSuccess(
          'Game created! Share the room code with your opponent.',
        )
      },
    )
    socket.on('updateGame', game => {
      console.log('Game updated:', game)

      gameState.value = game.status
      board.value = game.board
      currentPlayer.value = game.turn
    })

    socket.on('startGame', game => {
      console.log('Game started:', game)
      const me = game.players.find(
        (player: any) => player.id === currentUser.value?.id,
      )
      roomCode.value = game.roomId
      gameState.value = game.status
      board.value = game.board
      mySymbol.value = me.symbol
      isHost.value = me.id === currentUser.value?.id
      opponent.value = game.opponent
      currentPlayer.value = game.turn
      gameResult.value = null

      notificationStore.showSuccess('You joined the game!')
      isJoiningGame.value = false
      router.push('/game')
    })

    socket.on('gameStarted', () => {
      console.log('Re-joining game:', roomCode.value)
      socket.emit('getState')
    })

    socket.on('gameEnd', data => {
      console.log('Game ended:', data)
      gameResult.value = data.result
      gameState.value = 'completed'
      board.value = data.board
    })

    socket.on('leftGame', () => {
      backToLobby()
      console.log('Left game:', roomCode.value)
    })

    socket.on('roomState', state => {
      console.log('Room state updated:', state)
      roomCode.value = state.roomId
      gameState.value = 'waiting'
      gameResult.value = null

      router.push('/')
    })

    socket.on('gameState', state => {
      console.log('Game state updated:', state)
      roomCode.value = state.roomId
      gameState.value = state.status
      board.value = state.board
      currentPlayer.value = state.turn
      opponent.value = state.opponent || null

      router.push('/game')
    })

    socket.on('inGame', () => {
      console.log('In-game state updated')
      socket.emit('getState')
    })

    socket.on('noActiveGame', () => {
      console.log('No active game found')
      backToLobby()
    })

    return {
      // State
      currentUser,
      opponent,
      gameState,
      board,
      currentPlayer,
      roomCode,
      gameResult,
      isHost,
      isJoiningGame,

      // Computed
      isMyTurn,
      mySymbol,
      opponentSymbol,

      // Actions
      loginUser,
      logout,
      createGame,
      joinGame,
      opponentJoined,
      makeMove,
      resetGame,
      backToLobby,
      playAgain,
      leaveGame,
      checkGameStatus,
    }
  },
  {
    persist: true,
  },
)
