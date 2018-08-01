const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ListSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'user',
    required: true
  },
  attendees: [{
    type: Schema.ObjectId,
    ref: 'user'
  }],
  items: [{
    type: Schema.ObjectId,
    ref: 'item'
  }],
  created: Date
})

const List = mongoose.model('list', ListSchema)
module.exports = List
