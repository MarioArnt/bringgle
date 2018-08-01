const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ListItemSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    validate: function (v) {
      return (!Number.isNaN(v) && Number.isInteger(v) && v > 0 && v < 100)
    }
  },
  author: {
    type: Schema.ObjectId,
    required: true,
    ref: 'user'
  },
  responsible: {
    type: Map,
    of: {
      type: Schema.ObjectId,
      ref: 'user'
    }
  },
  created: Date
})

const Item = mongoose.model('item', ListItemSchema)
module.exports = Item
