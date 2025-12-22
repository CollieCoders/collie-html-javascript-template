import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const publicDir = path.join(__dirname, 'public')

app.use(express.static(publicDir))

// Optional: always serve index.html (handy if later you add history routing)
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'))
})

const port = process.env.PORT ?? 5173
app.listen(port, () => {
  console.log(`Collie HTML+JS template running at http://localhost:${port}`)
})
