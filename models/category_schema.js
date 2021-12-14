const { Schema, ObjectId, model } = require('mongoose')

const CategorySchema = new Schema({
  post_id: {
    type: ObjectId,
    required: true,
    immutable: true
  },
  name: {
    type: String,
    required: true,
    immutable: true
  }
})

module.exports = model('categories', CategorySchema)
