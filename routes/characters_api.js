const express = require('express')
const { fetchById } = require('../controllers/characters_controller')
const router = express.Router()

router
  .get('/:id', fetchById)

module.exports = router

