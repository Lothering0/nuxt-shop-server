const { Schema, model, ObjectId } = require('mongoose')

const likesSchema = new Schema({
  comment_id: {
    type: ObjectId,
    required: [true, 'This field is required']
  },
  user_id: {
    type: ObjectId,
    required: [true, 'This field is required']
  },
})

module.exports = model('likes', likesSchema)
