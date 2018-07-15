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
  owner.email = req.body.userEmail
  owner.save((err, owner) => {
    if (err) res.status(500).send(err)
    else {
      const list = new List()
      list.title = req.body.listName
      list.owner = owner
      list.attendees = []
      list.attendees.push(owner)
      list.save((err) => {
        if (err) res.status(500).send(err)
        else {
          res.status(201).send({
            id: list._id,
            owner: {
              id: owner._id,
              name: owner.name,
              email: owner.email
            }
          })
        }
      })
    }
  })
})

app.get('/api/lists/:id', (req, res) => {
  List.findById(req.params.id, (err, list) => {
    if (err) res.status(404).send(err)
    else {
      const data = {}
      User.findById(list.owner, (err, owner) => {
        if (err) res.status(404).send(err)
        else {
          const attendees = []
          for (let i = 0; i < list.attendees.length; ++i) {
            User.findById(list.attendees[i], (err, attendee) => {
              if (err) res.status(404).send(err)
              else attendee.push(userBuilder(attendee))
            })
          }
          data.id = list._id
          data.title = list.title
          data.owner = userBuilder(owner)
          data.attendees = attendees
          res.json(data)
        }
      })
    }
  })
})

function userBuilder (user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email
  }
}

app.listen(process.env.PORT || 8081)
console.log('Magic happens on port 8081');
