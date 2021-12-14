const { Schema, model, ObjectId } = require('mongoose')
// const commentSchema = require('./comment_schema')
const characterSchema = require('./character_schema')

const postSchema = new Schema({
  title: {
    type: String,
    required: [true, 'title field is required']
  },
  user_id: {
    type: ObjectId,
    required: [true, 'title field is required']
  },
  price: {
    type: Number,
    required: [true, 'price field is required']
  },
  description: {
    type: String,
    required: [true, 'description field is required']
  },
  image: {
    type: String,
    required: [true, 'image field is required']
  },
  // characters: [characterSchema],
  // categories: [String],
}, { timestamps: true })

module.exports = model('post', postSchema)
