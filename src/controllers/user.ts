import { Request, Response } from 'express'
import Game from '@/models/Game'

export const getRecentGames = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id

    const games = await Game.find({
      'players.user_id': userId,
      status: 'completed',
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('players.user_id', 'id name avatar')
      .lean()

    const gamesWithResult = games.map(game => {
      const me = game.players.find(
        p => p.user_id._id.toString() === userId.toString(),
      )
      let result: 'win' | 'loss' | 'draw'
      if (game.winner === 'draw') {
        result = 'draw'
      } else if (game.winner === me?.symbol) {
        result = 'win'
      } else {
        result = 'loss'
      }
      game.players = game.players.map(p => ({
        user_id: {
          id: p.user_id._id,
          name: p.user_id.name,
          avatar: p.user_id.avatar,
        },
        isMe: p.user_id._id.toString() === userId.toString(),
      }))
      return { ...game, result }
    })

    res.json(gamesWithResult)
  } catch (error) {
    console.error('Error fetching recent games:', error)
    res.status(500).json({ message: 'Error fetching recent games' })
  }
}

export const getMeUser = (req: Request, res: Response) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
  })
}

export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out successfully' })
}
