import cors from 'cors'
import cookieParser from 'cookie-parser'
import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import apiRouter from '@/routes/api.route'

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

// API routes
app.use('/api', apiRouter)

// Static files (Vue dist folder)
const vueDistPath =
  process.env.FRONTEND_PATH ||
  path.join(path.dirname(''), '../../frontend/dist')
app.use(express.static(vueDistPath))

// Catch-all route: send index.html for SPA routes
app.use((req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(vueDistPath, 'index.html'))
  } else {
    res.status(404).json({ message: 'Not found' })
  }
})

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({
    success: false,
    message: 'Something broke!',
  })
})

export default app
