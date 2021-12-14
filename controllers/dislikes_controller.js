const Likes = require('../models/likes_schema')
const Dislikes = require('../models/dislikes_schema')
const Comments = require('../models/comment_schema')
const ApiError = require('../exceptions/api_error')

class DislikesData {
  static async fetch(req, res, next) {
    try {
      const dislikes = await Dislikes.find()

      res.status(200).json(dislikes)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  static async fetchById(req, res, next) {
    try {
      const { id } = req.params

      const { _id } = await Comments.findById(id)
      const dislikes = await Dislikes.find({
        comment_id: _id
      })

      res.status(200).json(dislikes.length)
    } catch (e) {
      next(ApiError.notFound(e.message))
    }
  }

  static async setMark(req, res, next) {
    try {
      const user_id = req.id

      const { id } = req.params

      const comment = await Comments.findById(id)
      const data = {
        comment_id: comment._id,
        user_id
      }
      const like = await Likes.find(data)
      const dislike = await Dislikes.find(data)
      const likeResult = !like.length
      const dislikeResult = !dislike.length

      if (likeResult && dislikeResult) {
        await Dislikes.create(data)
      } else if (!likeResult && dislikeResult) {
        await Likes.deleteOne(data)
        await Dislikes.create(data)
      } else {
        await Dislikes.deleteOne(data)
      }

      res.status(200).json('success')
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  static async deleteData(req, res, next) {
    try {
      const _id = req.id

      const { id } = req.params
      const comment = await Comments.findById(id)
      const dislike = await Dislikes.findOne({ comment_id: comment._id })

      if (_id != dislike.user_id) {
        res.status(404).json('Error')
      }

      await Dislikes.findOneAndDelete({ user_id: dislike.user_id })

      res.status(200).json('success')
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }
}

module.exports = DislikesData
