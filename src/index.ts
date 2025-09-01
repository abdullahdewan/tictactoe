import 'dotenv/config'
import http from 'http'
import app from '@/app'
import mongoose from 'mongoose'
import { systemConfig } from '@/config'
import { Server } from 'socket.io'
import sockets from '@/sockets'

const PORT = process.env.PORT || 5000

const server = http.createServer(app)
const io = new Server(server)

sockets(io)

mongoose
  .connect(systemConfig.mongoURI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`server is running at http://localhost:${PORT}`)
    })
  })
  .catch(err => {
    console.error('Database connection error:', err)
  })
