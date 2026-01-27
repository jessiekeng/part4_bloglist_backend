const config = require('./utils/config')
const express = require('express')
const app = express() 
const cors = require('cors') 

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

// Import Swagger utilities
const { swaggerUi, specs } = require('./utils/swagger')

const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

// --- Swagger Documentation Route ---
// Recruiter tip: Place this before your API routes so it's easily accessible
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// 1. tokenExtractor must be global so it runs for all routes
app.use(middleware.tokenExtractor)

// 2. Register the routes
app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)

// 3. Apply userExtractor only to blog routes as per Exercise 4.22
app.use('/api/blogs', middleware.userExtractor, blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app