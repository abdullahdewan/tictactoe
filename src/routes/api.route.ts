import { Router } from 'express'
import { GoogleLogin, GoogleCallback } from '@/controllers/google'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { cookieConfig } from '@/config'

// middlewares
import isAuthenticated from '@/middlewares/isAuthenticated'

// controllers
import { getMeUser, logoutUser, getRecentGames } from '@/controllers/user'

const router = Router()

router.get('/google/login', GoogleLogin)
router.get('/google/callback', GoogleCallback)
router.get('/user/me', isAuthenticated, getMeUser)
router.get('/user/games', isAuthenticated, getRecentGames)
router.post('/logout', isAuthenticated, logoutUser)

export default router
