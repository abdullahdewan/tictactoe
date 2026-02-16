import { authUser } from '@/lib/utils'
import { Request, Response, NextFunction } from 'express'

export default async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const { token } = req.cookies
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const user = await authUser(token)
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  req.user = user
  next()
}


// make a generic function for auth which can be used in both http and socket
