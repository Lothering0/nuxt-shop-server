const Basket = require('../models/basket_schema')
const ApiError = require('../exceptions/api_error')

class BasketData {
  static async fetch(req, res, next) {
    try {
      const user_id = req.id
      const baskets = await Basket.find({ user_id })

      res.status(200).json(baskets)
    } catch (e) {
      next(ApiError.unauthorizedError(e.message))
    }
  }

  static async setData(req, res, next) {
    try {
      const user_id = req.id
      const { post_id } = req.body
      const data = { user_id, post_id }

      const isExist = await Basket.findOne(data)


      if (!isExist) {
        const basket = await Basket.create(data)

        return res.status(200).json(basket)
      }

      await Basket.deleteOne(data)
      return res.status(200).send('Post deleted from basket successfully')
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }
}

module.exports = BasketData
