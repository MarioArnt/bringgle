const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const List = require('./models/list')
const User = require('./models/user')

const app = express()

mongoose.connect('mongodb://localhost:27017/bringgle');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log('Connection Succeeded')
})

app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

app.post('/api/lists', (req, res) => {
  const owner = new User()
  owner.name = req.body.displayName
  owner.email = req.body.email
  owner.save((err) => {
    if (err) res.send(err)
    else {
      const list = new List()
      list.title = req.body.listName
      list.owner = owner
      list.save((err) => {
        if (err) res.send(err, list)
        else res.json({id: list._id})
      })
    }
  })
})

app.listen(process.env.PORT || 8081)
console.log('Magic happens on port 8081');
