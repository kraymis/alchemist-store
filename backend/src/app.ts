import express from 'express'
import cors from 'cors'
import path from 'path'
import api from './routes/api.js'

export const app = express()

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  ...(process.env.FRONTEND_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean),
])

app.use(cors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin || allowedOrigins.has(requestOrigin)) {
      callback(null, true)
      return
    }
    callback(new Error(`Origin not allowed by CORS: ${requestOrigin}`))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '20mb' }))
app.use('/uploads', express.static(path.resolve('uploads')))
app.use('/api', api)
app.use((_err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(500).json({ message: 'Server error' }))
