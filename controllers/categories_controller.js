const Category = require('../models/category_schema')
const ApiError = require('../exceptions/api_error')

class CategoriesData {
  static async fetchById(req, res, next) {
    try {
      const post_id = req.params.id
      const categories = await Category.find({ post_id })

      res.status(200).json(categories)
    } catch (e) {
      next(ApiError.notFound(e.message))
    }
  }
}

module.exports = CategoriesData
