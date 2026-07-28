require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const connectDB = require('./config/db')
const profileRoutes = require('./routes/profileRoutes')
const eventRoutes = require('./routes/eventRoutes')
const { errorHandler, notFound } = require('./middleware/errorMiddleware')

connectDB()

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}))
app.use(express.json())
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/profiles', profileRoutes)
app.use('/api/events', eventRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
