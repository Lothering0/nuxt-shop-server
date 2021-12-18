const ApiError = require('../exceptions/api_error')
const jwt = require('jsonwebtoken')

module.exports = function(req, res, next) {
  try {
    const jwt_access = req.cookies['jwt_access']
    const jwt_refresh = req.cookies['jwt_refresh']

    if (!jwt_access && !jwt_refresh) {
      return next(ApiError.unauthorizedError())
    }

    if (jwt_refresh) {
      const refreshToken = jwt.verify(jwt_refresh, process.env.JWT_REFRESH_SECRET)

      const newAccessToken = jwt.sign(
        { _id: refreshToken._id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '1d' }
      )
      const newRefreshToken = jwt.sign(
        { _id: refreshToken._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '60d' }
      )

      res
        .cookie('jwt_access', newAccessToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: 'lax'
        })
        .cookie('jwt_refresh', newRefreshToken, {
          httpOnly: true,
          maxAge: 60 * 24 * 60 * 60 * 1000,
          sameSite: 'lax'
        })

      const accessToken = jwt.verify(newAccessToken, process.env.JWT_ACCESS_SECRET)

      req.id = accessToken._id
      return next()
    }

    const accessToken = jwt.verify(jwt_access, process.env.JWT_ACCESS_SECRET)

    req.id = accessToken._id

    return next()
  } catch (e) {
    console.log('Error', e.message)
    return next(ApiError.unauthorizedError())
  }
}
