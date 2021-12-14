const Character = require('../models/character_schema')
const ApiError = require('../exceptions/api_error')

class CategoriesData {
  static async fetchById(req, res, next) {
    try {
      const post_id = req.params.id
      const characters = await Character.find({ post_id })

      res.status(200).json(characters)
    } catch (e) {
      next(ApiError.notFound(e.message))
    }
  }
}

module.exports = CategoriesData
