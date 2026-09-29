import cors from 'cors'
import express from 'express'
import resumeRouter from './routes/resume.js'

const app = express()
const allowedOrigins = (process.env.FRONTEND_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.disable('x-powered-by')
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(null, false)
  },
}))
app.use(express.json({ limit: '32kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok' })
})

app.use('/api/resume', resumeRouter)

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'The requested API endpoint was not found.' },
  })
})

app.use((error, _req, res, _next) => {
  if (error?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: { code: 'FILE_TOO_LARGE', message: 'The PDF must be 5 MB or smaller.' },
    })
  }

  if (error?.code?.startsWith('LIMIT_')) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_UPLOAD', message: 'Upload one PDF file using the "resume" form field.' },
    })
  }

  if (error?.status === 400 || error?.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'The request body could not be read.' },
    })
  }

  if (error?.status && error?.code) {
    return res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message },
    })
  }

  console.error('Unhandled API error:', error)
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'The server could not process the request.' },
  })
})

export default app
