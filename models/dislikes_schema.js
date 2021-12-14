const { Schema, model, ObjectId } = require('mongoose')

const dislikesSchema = new Schema({
  comment_id: {
    type: ObjectId,
    required: [true, 'This field is required']
  },
  user_id: {
    type: ObjectId,
    required: [true, 'This field is required']
  },
})

module.exports = model('dislikes', dislikesSchema)
