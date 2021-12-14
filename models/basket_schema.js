const { Schema, ObjectId, model } = require('mongoose')

const BasketSchema = new Schema({
  user_id: {
    type: ObjectId,
    required: true,
    immutable: true
  },
  post_id: {
    type: ObjectId,
    required: true,
    immutable: true
  }
})

module.exports = model('baskets', BasketSchema)
