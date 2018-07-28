const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./user')

const ListItemSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    validate: function (v) {
      return (v === 1 && !this.quantity.isNaN && Number.isInteger(this.quantity) && this.quantity > 0)
    }
  },
  author: {
    type: Schema.ObjectId,
    required: true,
    ref: 'User'
  },
  responsible: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  created: Date
})

const Item = mongoose.model('item', ListItemSchema)
module.exports = Item
