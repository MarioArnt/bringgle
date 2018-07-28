const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./user')
const ListItem = require('./item')

const ListSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  items: [{
    type: Schema.ObjectId,
    ref: 'ListItem'
  }],
  created: Date
})

const List = mongoose.model('list', ListSchema)
module.exports = List
