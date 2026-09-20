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
app.use('/uploads/products', express.static(path.resolve('uploads/products'), { index: false }))
app.get('/uploads/customizations/:filename', (req, res) => {
  if (!/^[a-f0-9-]+\.(png|jpe?g|webp|gif|svg)$/i.test(req.params.filename)) {
    res.status(404).end()
    return
  }
  res.sendFile(req.params.filename, { root: path.resolve('uploads/customizations'), dotfiles: 'deny' }, (error) => {
    if (error && !res.headersSent) res.status((error as NodeJS.ErrnoException & { statusCode?: number }).statusCode || 404).end()
  })
})
app.use('/api', api)
app.use((_err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(500).json({ message: 'Server error' }))
