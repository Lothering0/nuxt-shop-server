const express = require('express')
const authMiddleware = require('../middleware/auth_middleware')
const {
  fetch,
  fetchById,
  setMark,
  deleteData
} = require('../controllers/dislikes_controller')
const router = express.Router()

router
  .get('/', fetch)
  .get('/:id', fetchById)
  .post('/:id', authMiddleware, setMark)
  .delete('/:id', authMiddleware, deleteData)

module.exports = router
