const User = require('../models/user_schema')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ApiError = require('../exceptions/api_error')
const { validationResult } = require('express-validator')

class AuthData {
  static generateTokens(req, res, _id) {
    const accessToken = jwt.sign(
      { _id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1d' }
    )
    const refreshToken = jwt.sign(
      { _id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '60d' }
    )

    return res
      .cookie('jwt_access', accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'none'
      })
      .cookie('jwt_refresh', refreshToken, {
        httpOnly: true,
        maxAge: 60 * 24 * 60 * 60 * 1000,
        sameSite: 'none'
      })
  }

  static async authenticateUser(req, res, next) {
    try {
      const _id = req.id

      const user = await User.findOne({ _id })
      const { password, ...data } = await user.toJSON()

      res.status(200).json(data)
    } catch (e) {
      next(ApiError.unauthorizedError('Unauthorized'))
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const users = await User.find()

      res.status(200).json(users)
    } catch (e) {
      next(ApiError.unauthorizedError('Unauthorized'))
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { id } = req.params

      const { name } = await User.findById(id)

      res.status(200).json(name)
    } catch (e) {
      next(ApiError.notFound(e.message))
    }
  }

  static async loginUser(req, res, next) {
    try {
      const user = await User.findOne({ email: req.body.email })

      if (!user)
        throw ApiError.notFound('User not found')

      const comparedPassword = await bcrypt.compare(req.body.password, user.password)

      if (!comparedPassword) {
        throw ApiError.badRequest('Invalid credentials')
      }

      AuthData.generateTokens(req, res, user._id)

      res.send({ message: 'Success' })
    } catch (e) {
      next(ApiError.notFound(e.message))
    }
  }

  static async logoutUser(req, res, next) {
    try {
      res
        .cookie('jwt_access', '', { maxAge: 0 })
        .cookie('jwt_refresh', '', { maxAge: 0 })
        .send({ message: 'Success' })
    } catch (e) {
      next(e.message)
    }
  }

  static async createUser(req, res, next) {
    try {
      const errors = validationResult(req)
      const body = req.body

      if (!errors.isEmpty())
        return next(ApiError.badRequest('Validation error'))

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(req.body.password, salt)
      req.body.password = hashedPassword

      const user = await User.findOne({ email: body.email })

      if (user) {
        throw ApiError.badRequest('User is now exist')
      }

      const newUser = await User.create(body)

      res.status(201).json({
        message: 'User created successfully',
        user: newUser
      })
    } catch (e) {
      next(e.message)
    }
  }

  static async updateUser(req, res, next) {
    try {
      const _id = req.id
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return next(ApiError.badRequest('Validation error'))
      }

      const newInfo = req.body

      await User.findByIdAndUpdate(_id, newInfo)
      const updatedUser = await User.findById(_id)
      const { password, ...data } = updatedUser.toJSON()

      res.status(200).json(data)
    } catch (e) {
      next(e.message)
    }
  }
}

module.exports = AuthData
