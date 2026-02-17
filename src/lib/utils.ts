import User from '@/models/User'
import { Response } from 'express'
import jwt from 'jsonwebtoken'
import { systemConfig } from '@/config'


export const flashCookie = (res: Response, message: string) => {
  res.cookie('flash', message, { maxAge: 1000 * 60 * 5 }) // 5 minutes
}

export async function authUser(token: string): Promise<InstanceType<typeof User> | null> {
  try {
    const decoded: any = jwt.verify(token, systemConfig.jwtSecret)
    const user = await User.findById(decoded.id)
    return user
  } catch (error) {
    console.error('Error authenticating user:', error)
    return null
  }
}

export { generateRoomCode } from './roomCode'
