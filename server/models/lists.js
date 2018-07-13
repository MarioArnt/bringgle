const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ListSchema = new Schema({
  title: String,
  ownerEmail: String
})

const Post = mongoose.model('Post', ListSchema)
module.exports = Post
