const express = require('express')
const authMiddleware = require('../middleware/auth_middleware')
const {
  fetchDataById,
  createData,
  updateData,
  deleteData
} = require('../controllers/comments_controller')
const router = express.Router()

router
  .get('/:id', fetchDataById)
  .post('/:id', authMiddleware, createData)
  .patch('/:id', authMiddleware, updateData)
  .delete('/:id', authMiddleware, deleteData)

module.exports = router
