import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))

const port = process.env.PORT || 5174
app.listen(port, () => console.log(`API server on http://localhost:${port}`))
