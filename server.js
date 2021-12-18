// Importing required modules
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middleware/error_middleware')

// parse env variables
require('dotenv').config()

require("./helpers/db/mongodb.js")()

// Configuring port
const port = process.env.PORT || 9000
const app = express()

// Configure middlewares
app.use(cookieParser())
app.use(cors({
  credentials: true,
  origin: [process.env.FRONTEND_ADDRESS || 'http://localhost:3000']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'html')

// Static folder
// app.use(express.static(__dirname + '/uploads/'))
app.use(express.static('uploads'))

app.get('/', (req, res) => {
  res.send('<h3>This is back-end server of nuxt-shop project. <a href="https://nuxt-shop0.herokuapp.com">Click to go to the main page</a>.</h3>')
})

// Defining route middleware
app.use('/api/posts', require('./routes/posts_api'))
app.use('/api/basket', require('./routes/baskets_api'))
app.use('/api/categories', require('./routes/categories_api'))
app.use('/api/characters', require('./routes/characters_api'))
app.use('/api/comments', require('./routes/comments_api'))
app.use('/api/auth', require('./routes/auth_api'))
app.use('/api/likes', require('./routes/likes_api'))
app.use('/api/dislikes', require('./routes/dislikes_api'))
app.use(errorMiddleware)

// Listening to port
app.listen(port)
console.log(`Listening On http://localhost:${port}/api/`)

module.exports = app
