import { Request, Response } from 'express'

export const getMeUser = (req: Request, res: Response) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar
  })
}


export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out successfully' })
}