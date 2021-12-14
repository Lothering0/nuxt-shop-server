const express = require('express')
const authMiddleware = require('../middleware/auth_middleware')
const {
  authenticateUser,
  getUserById,
  getAllUsers,
  loginUser,
  logoutUser,
  createUser,
  updateUser
} = require('../controllers/auth_controller')
const router = express.Router()
const { body } = require('express-validator')

router
  .get('/user', authMiddleware, authenticateUser)
  .get('/user/:id', getUserById)
  .get('/users', getAllUsers)
  .post('/login', loginUser)
  .post('/logout', logoutUser)
  .post('/register',
    body('name')
      .isLength({
        min: 2,
        max: 26
      }),
    body('email')
      .isEmail()
      .isLength({
        min: 3,
        max: 320
      }),
    body('password')
      .isLength({
        min: 3,
        max: 15
      }),
    createUser
  )
  .patch('/update',
    authMiddleware,
    body('name')
      .isLength({
        min: 2,
        max: 26
      }),
    body('email')
      .isEmail()
      .isLength({
        min: 3,
        max: 320
      }),
    updateUser
  )

module.exports = router
