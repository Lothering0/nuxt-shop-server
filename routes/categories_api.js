const express = require('express')
const { fetchById } = require('../controllers/categories_controller')
const router = express.Router()

router
  .get('/:id', fetchById)

module.exports = router
