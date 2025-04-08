const express = require('express')
const churchill = require('churchill')
const path = require('path')
const app = express()
const port = 3000

// Create a logger with multiple transports
const logger = churchill.create({
  transports: [
    new churchill.transports.Console(),
    new churchill.transports.File({
      filename: path.join(__dirname, 'logs', 'app.log'),
    }),
  ]
})

// Add middleware to parse JSON bodies
app.use(express.json())

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Create a specific endpoint for logs
app.post('/logs', (req, res) => {
  const success = logger.processLog(req.body)
  res.status(success ? 200 : 400).json({
    status: success ? 'ok' : 'error'
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`Open http://localhost:${port} in your browser to test the logger`)
})