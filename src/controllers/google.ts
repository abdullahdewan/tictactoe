import * as arctic from 'arctic'
import { Request, Response } from 'express'
import { cookieConfig, googleConfig } from '@/config'
import User from '@/models/User'
import { flashCookie } from '@/lib/utils'

const google = new arctic.Google(
  googleConfig.clientId,
  googleConfig.clientSecret,
  googleConfig.redirectURI,
)

export const GoogleLogin = (req: Request, res: Response) => {
  if (req.user) return res.redirect('/')

  const state = arctic.generateState()
  const codeVerifier = arctic.generateCodeVerifier()
  const scopes = ['openid', 'profile', 'email']
  const url = google.createAuthorizationURL(state, codeVerifier, scopes)

  const cookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as 'lax',
    maxAge: 1000 * 60 * 15, // 15 minutes
  }

  res.cookie('google_auth_state', state, cookieConfig)
  res.cookie('google_auth_code_verifier', codeVerifier, cookieConfig)

  res.redirect(url.href)
}

export const GoogleCallback = async (req: Request, res: Response) => {
  if (req.user) return res.redirect('/')

  const { code, state } = req.query
  const {
    google_auth_state: storedState,
    google_auth_code_verifier: codeVerifier,
  } = req.cookies

  if (
    !code ||
    !state ||
    !codeVerifier ||
    !storedState ||
    state !== storedState
  ) {
    console.error('State mismatch!')
    flashCookie(res, 'Authentication failed')

    return res.redirect('/')
  }

  let tokens

  try {
    tokens = await google.validateAuthorizationCode(
      code as string,
      codeVerifier,
    )
  } catch (error) {
    console.error(error)
    flashCookie(res, 'Authentication failed')

    return res.redirect('/')
  }

  const claims: Partial<{
    sub: string
    email: string
    given_name: string
    picture: string
  }> = arctic.decodeIdToken(tokens.idToken())
  const { sub, email, given_name, picture } = claims
  if (!sub || !email || !given_name || !picture) {
    console.error('Invalid ID Token claims')
    flashCookie(res, 'Authentication failed')

    return res.redirect('/')
  }

  let user = await User.findOne({ email })
  if (!user) {
    user = new User({
      email,
      name: given_name,
      avatar: picture,
      authId: sub,
      authProvider: 'google',
    })
    await user.save()
  }

  const token = user.generateToken()

  res.cookie('token', token, cookieConfig)
  res.redirect('/lobby')
}
