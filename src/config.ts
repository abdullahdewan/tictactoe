import { StringValue } from 'ms'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export const systemConfig: {
  mongoURI: string
  jwtSecret: string
  jwtExpire: StringValue
} = {
  mongoURI: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/tictactoe',
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpire: (process.env.JWT_EXPIRE as StringValue) || ('1d' as StringValue),
}

export const googleConfig: {
  clientId: string
  clientSecret: string
  redirectURI: string
} = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectURI: process.env.GOOGLE_REDIRECT_URI!,
}

export const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as 'lax',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
}