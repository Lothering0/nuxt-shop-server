const Likes = require('../models/likes_schema')
const Dislikes = require('../models/dislikes_schema')
const Comments = require('../models/comment_schema')
const ApiError = require('../exceptions/api_error')

class LikesData {
  static async fetch(req, res, next) {
    try {
      const likes = await Likes.find()

      res.status(200).json(likes)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  static async fetchById(req, res, next) {
    try {
      const id = req.params.id

      const comment = await Comments.findById(id)
      const likes = await Likes.find({
        comment_id: comment._id
      })

      res.status(200).json(likes.length)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  static async setMark(req, res, next) {
    try {
      const user_id = req.id

      const id = req.params.id

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
        await Likes.create(data)
      } else if (likeResult && !dislikeResult) {
        await Dislikes.deleteOne(data)
        await Likes.create(data)
      } else {
        await Likes.deleteOne(data)
      }

      res.status(200).json('success')
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  static async deleteData(req, res, next) {
    try {
      const _id = req.id

      const id = req.params.id
      const comment = await Comments.findById(id)
      const like = await Likes.findOne({ comment_id: comment._id })

      if (_id != like.user_id) {
        res.status(400).json('Error')
      }

      await Likes.findOneAndDelete({ user_id: like.user_id })

      res.status(200).json('success')
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }
}

module.exports = LikesData
