const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./user')

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
  created: Date
})

const List = mongoose.model('list', ListSchema)
module.exports = List
