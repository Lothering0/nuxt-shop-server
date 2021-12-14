const express = require('express')
const authMiddleware = require('../middleware/auth_middleware')
const { fetch, setData } = require('../controllers/basktets_controller')
const router = express.Router()

router
  .get('/', authMiddleware, fetch)
  .post('/', authMiddleware, setData)

module.exports = router
