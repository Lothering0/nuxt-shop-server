const Post = require('../models/post_schema')
const User = require('../models/user_schema')
const Basket = require('../models/basket_schema')

const Category = require('../models/category_schema')
const Character = require('../models/character_schema')

const Comment = require('../models/comment_schema')

const Likes = require('../models/likes_schema')
const Dislikes = require('../models/dislikes_schema')

const jwt = require('jsonwebtoken')
const fs = require('fs')
const ApiError = require('../exceptions/api_error')

class PostData {
  static async addExtendData(posts, jwt_access) {
    const postsWithExtendData = []

    for (const post of posts) {
      const { name } = await User.findById(post.user_id)
      post._doc.user_name = name
      post._doc.categories = await Category.find({ post_id: post._id })
      post._doc.characters = await Character.find({ post_id: post._id })

      if (jwt_access) {
        const token = jwt.verify(jwt_access, process.env.JWT_ACCESS_SECRET)

        const result = await Basket.findOne({ user_id: token._id, post_id: post._id })
        post._doc.in_basket = !!result
        postsWithExtendData.push({ ...post._doc })
      } else {
        postsWithExtendData.push({ ...post._doc })
      }
    }

    return postsWithExtendData
  }

  static async fetchAllData(req, res, next) {
    try {
      const limit = +req.query.limit
      const skip = (+req.query.page - 1) * limit
      const posts = await Post.find(
        null,
        null,
        { limit, skip }
      )

      res.status(200).json(await PostData.addExtendData(posts, req.cookies['jwt_access']))
    } catch (e) {
      next(ApiError.notFound(e.message))
    }
  }

  static async fetchDataById(req, res, next) {
    try {
      const { id } = req.params
      const post = await Post.findById(id)
      const response = await PostData.addExtendData([post], req.cookies['jwt_access'])

      res.status(200).json(response[0])
    } catch (e) {
      next(ApiError.notFound(e.message))
    }
  }

  static async fetchBasketPosts(req, res, next) {
    try {
      const limit = +req.query.limit
      const skip = (+req.query.page - 1) * limit
      const user_id = req.id
      const basket = await Basket.find(
        { user_id },
        null,
        { limit, skip }
      )

      const posts = []
      for (const { post_id } of basket) {
        posts.push(await Post.findById(post_id))
      }

      res.status(200).json(await PostData.addExtendData(posts, req.cookies['jwt_access']))
    } catch (e) {
      next(ApiError.unauthorizedError(e.message))
    }
  }

  static async fetchDataByUserId(req, res, next) {
    try {
      const limit = +req.query.limit
      const skip = (+req.query.page - 1) * limit
      const user_id = req.params.id
      const posts = await Post.find({ user_id }, null, { limit, skip })

      res.status(200).json(await PostData.addExtendData(posts, req.cookies['jwt_access']))
    } catch (e) {
      next(ApiError.unauthorizedError(e.message))
    }
  }

  static async fetchDataByCategoryId(req, res, next) {
    try {
      const limit = +req.query.limit
      const skip = (+req.query.page - 1) * limit
      const { name } = req.params
      const categories = await Category.find(
        { name: name.replace('_', ' ') },
        null,
        { limit, skip }
      )
      const posts = []

      for (const { post_id } of categories) {
        const response = await Post.findById(post_id)

        posts.push(response)
      }

      res.status(200).json(await PostData.addExtendData(posts, req.cookies['jwt_access']))
    } catch (e) {
      next(ApiError.notFound(e.message))
    }
  }

  static async createData(req, res, next) {
    try {
      const user_id = req.id

      const { newCategories, newCharacters, ...post } = req.body
      const imagename = req.file.filename
      const category = JSON.parse(newCategories)
      const character = JSON.parse(newCharacters)
      post.image = imagename

      const newPost = await Post.create({
        ...post,
        user_id
      })

      const sortedCategories = []

      category.forEach(({ name }) => {
        if (sortedCategories.indexOf(name) === -1)
          sortedCategories.push(name)
      })

      sortedCategories.forEach(async name => {
        await Category.create({
          name,
          post_id: newPost._id
        })
      })

      const sortedCharacters = []
      const arrOfCharacterTypes = []

      character.forEach(({ character_type, character_value }) => {
        if (arrOfCharacterTypes.indexOf(character_type) === -1) {
          sortedCharacters.push({
            character_type,
            character_value
          })
        }
      })

      sortedCharacters.forEach(async character => {
        await Character.create({
          ...character,
          post_id: newPost._id
        })
      })

      res.status(201).json(newPost)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  static async updateData(req, res, next) {
    try {
      const { id } = req.params
      const post = await Post.findById(id)

      const _id = req.id

      if (_id != post.user_id)
        throw ApiError.badRequest('Error')

      let updatedImage = ''

      if (req.file) {
        updatedImage = req.file.filename

        try {
          fs.unlinkSync(`./uploads/${req.body.image}`)
        } catch (e) {
          console.log(e)
        }
      } else updatedImage = req.body.image

      const newPost = req.body
      newPost.newCategories = JSON.parse(newPost.newCategories)
      newPost.categoriesToDelete = JSON.parse(newPost.categoriesToDelete)
      newPost.newCharacters = JSON.parse(newPost.newCharacters)
      newPost.charactersToDelete = JSON.parse(newPost.charactersToDelete)
      newPost.image = updatedImage

      await Post.findByIdAndUpdate(id, newPost)
      const updatedPost = await Post.findById(id)

      newPost.categoriesToDelete
        .forEach(async ({ name, post_id }) => await Category.deleteOne({
          post_id,
          name
        }))
      newPost.newCategories
        .forEach(async ({ name, post_id }) => {
          const isExist = await Category.find({ post_id, name })
          if (!isExist.length) {
            await Category.create({
              post_id,
              name
            })
          }
        })

      newPost.charactersToDelete
        .forEach(async ({ character_type, post_id }) => await Character.deleteOne({
          post_id,
          character_type
        }))
      newPost.newCharacters
        .forEach(async ({ character_type, character_value, post_id }) => {
          const isExist = await Character.find({ post_id, character_type })

          if (!isExist.length) {
            await Character.create({
              post_id,
              character_type,
              character_value
            })
          }
        })

      res.status(200).json(updatedPost)
    } catch (e) {
      next(ApiError.notFound(e.message))
    }
  }

  static async deleteData(req, res, next) {
    try {
      const _id = req.id

      const post_id = req.params.id
      const post = await Post.findById(post_id)

      if (_id != post.user_id)
        throw ApiError.badRequest('Error')

      await Post.findByIdAndDelete(post_id)
      await Category.deleteMany({ post_id })
      await Character.deleteMany({ post_id })
      const comment = await Comment.find({ post_id })
      await Comment.deleteMany({ post_id })
      comment.forEach(async comment => {
        await Likes.deleteMany({
          comment_id: comment._id
        })
        await Dislikes.deleteMany({
          comment_id: comment._id
        })
      })

      if (post.image != '') {
        try {
          fs.unlinkSync(`./uploads/${post.image}`)
        } catch (e) {
          console.log(e)
        }
      }

      res.status(200).json(comment)
    } catch (e) {
      next(ApiError.notFound(e.message))
    }
  }
}

module.exports = PostData
