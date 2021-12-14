const { Schema, ObjectId, model } = require('mongoose')

const characterSchema = new Schema({
  post_id: {
    type: ObjectId,
    required: true,
    immutable: true
  },
  character_type: {
    type: String,
    required: true,
    immutable: true
  },
  character_value: {
    type: String,
    required: true,
    immutable: true
  }
})

module.exports = model('characters', characterSchema)
