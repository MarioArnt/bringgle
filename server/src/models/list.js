const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./user')
const ListItem = require('./listItem')

const ListSchema = new Schema({
  title: String,
  owner: {
    type: Schema.ObjectId,
    ref: 'User'
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
