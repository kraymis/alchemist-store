import express from 'express'
import cors from 'cors'
import path from 'path'
import api from './routes/api.js'

export const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5175',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '20mb' }))
app.use('/uploads', express.static(path.resolve('uploads')))
app.use('/api', api)
app.use((_err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(500).json({ message: 'Server error' }))
