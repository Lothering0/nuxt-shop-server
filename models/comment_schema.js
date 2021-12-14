const { Schema, model, ObjectId } = require('mongoose')

const commentSchema = new Schema({
  message: {
    type: String,
    required: [true, 'Message field is required']
  },
  user_id: {
    type: ObjectId,
    required: [true, 'User id is required'],
    immutable: true
  },
  post_id: {
    type: ObjectId,
    required: [true, 'Post id is required'],
    immutable: true
  }
}, { timestamps: true })

module.exports = model('comment', commentSchema)
