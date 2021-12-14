const Likes = require('../models/likes_schema')
const Dislikes = require('../models/dislikes_schema')
const User = require('../models/user_schema')
const Comment = require('../models/comment_schema')
const ApiError = require('../exceptions/api_error')
const jwt = require('jsonwebtoken')

class CommentData {
  static async fetchDataById(req, res, next) {
    try {
      const post_id = req.params.id
      const comments = await Comment.find({ post_id })

      const commentsWithExtendData = []

      for (const comment of comments) {
        const { name } = await User.findById(comment.user_id)
        comment._doc.user_name = name
        const likes = await Likes.find({ comment_id: comment._id })
        const dislikes = await Dislikes.find({ comment_id: comment._id })
        comment._doc.likes = likes.length
        comment._doc.dislikes = dislikes.length

        const jwt_access = req.cookies['jwt_access']

        if (jwt_access) {
          const token = jwt.verify(jwt_access, process.env.JWT_ACCESS_SECRET)

          const data = {
            comment_id: comment._id,
            user_id: token._id
          }
          const hasLike = await Likes.find(data)
          const hasDislike = await Dislikes.find(data)

          comment._doc.has_like = !!hasLike.length
          comment._doc.has_dislike = !!hasDislike.length
        }

        commentsWithExtendData.push({ ...comment._doc })
      }

      res.status(200).json(commentsWithExtendData)
    } catch (e) {
      next(ApiError.notFound(e.message))
    }
  }

  static async createData(req, res, next) {
    try {
      const user_id = req.id

      const post_id = req.params.id
      const message = req.body

      const newComment = await Comment.create({
        post_id,
        user_id,
        ...message,
      })

      res.status(201).json(newComment)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  static async updateData(req, res, next) {
    try {
      const _id = req.id

      const { id } = req.params
      const body = req.body

      const comment = await Comment.findById(id)

      if (_id != comment.user_id) {
        return res.status(400).json({ message: 'Error' })
      }

      await Comment.findByIdAndUpdate(id, body)
      const updatedComment = await Comment.findById(id)

      res.status(200).json(updatedComment)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  static async deleteData(req, res, next) {
    try {
      const _id = req.id

      const { id } = req.params

      const comment = await Comment.findById(id)

      if (_id != comment.user_id) {
        res.status(400).json({ message: 'Error' })
      }

      await Comment.findByIdAndDelete(id)
      await Likes.deleteMany({ comment_id: id })
      await Dislikes.deleteMany({ comment_id: id })

      res.status(200).json({ message: 'Success' })
    } catch (e) {
      next(ApiError.notFound(e.message))
    }
  }
}

module.exports = CommentData
