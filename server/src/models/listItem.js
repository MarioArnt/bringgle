const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./user')

const ListItemSchema = new Schema({
  name: String,
  quantity: Number,
  author: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  responsible: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  created: Date
})

const ListItem = mongoose.model('item', ListItemSchema)
module.exports = ListItem
