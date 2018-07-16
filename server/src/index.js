const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const List = require('./models/list')
const User = require('./models/user')

const app = express()

mongoose.connect('mongodb://localhost:27017/bringgle')
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
  console.log('Connection Succeeded')
})

app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

app.post('/api/lists', (req, res) => {
  if (!req.body.userId) {
    createUserAndList(req, res)
    return
  }
  User.findById(req.body.userId, (err, user) => {
    if (err) {
      createUserAndList(req, res)
    } else {
      createList(req, res, user)
    }
  })
})

function createUserAndList (req, res) {
  const owner = new User()
  owner.name = req.body.displayName
  owner.email = req.body.userEmail
  owner.save((err, user) => {
    if (err) res.status(500).send(err)
    else {
      createList(req, res, user)
    }
  })
}

function createList (req, res, owner) {
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

const fetchAndBuildUser = (userId, res) => {
  return new Promise(resolve => {
    User.findById(userId, (err, attendee) => {
      if (err) res.status(404).send(err)
      else {
        console.log('attendee found')
        console.log(attendee)
        console.log('Reformating')
        console.log(userBuilder(attendee))
        resolve(userBuilder(attendee))
      }
    })
  })
}

const buildAttendeesList = async (list) => {
  return new Promise(resolve => {
    console.log('Building attendees list')
    const attendeesPromise = []
    for (let i = 0; i < list.attendees.length; ++i) {
      console.log('Find attendee with ID: ' + list.attendees[i])
      attendeesPromise.push(fetchAndBuildUser(list.attendees[i]))
    }
    Promise.all(attendeesPromise).then((attendees) => {
      console.log(attendees)
      resolve(attendees)
    })
  })
}

const getList = async (req, res) => {
  List.findById(req.params.id, (err, list) => {
    if (err) res.status(404).send(err)
    else {
      const data = {}
      User.findById(list.owner, (err, owner) => {
        if (err) res.status(404).send(err)
        else {
          buildAttendeesList(list).then((attendees) => {
            data.id = list._id
            data.title = list.title
            data.owner = userBuilder(owner)
            data.attendees = attendees
            res.json(data)
          })
        }
      })
    }
  })
}

app.get('/api/lists/:id', getList)

app.post('/api/lists/:id/join', (req, res) => {
  if (!req.body.userId) {
    createUserAndJoinList(req, res)
    return
  }
  User.findById(req.body.userId, (err, user) => {
    if (err) {
      createUserAndJoinList(req, res)
    } else {
      addAttendeeToList(req.params.id, user, res)
    }
  })
})

function createUserAndJoinList (req, res) {
  const attendee = new User()
  attendee.name = req.body.displayName
  attendee.email = req.body.userEmail
  attendee.save((err, user) => {
    if (err) res.status(500).send(err)
    else {
      addAttendeeToList(req.params.id, user, res)
    }
  })
}

function addAttendeeToList (listId, user, res) {
  List.findById(listId, (err, list) => {
    if (err) res.status(404).send(err)
    else if (list.attendees.some((att) => att.id === user.id)) {
      res.status(400).send('User already attend this list')
    } else {
      list.attendees.push(user)
      list.save((err, user) => {
        if (err) res.status(500).send(err)
        else {
          res.json({
            listId,
            attendee: user
          })
        }
      })
    }
  })
}

function userBuilder (user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email
  }
}

app.listen(process.env.PORT || 8081)
console.log('Magic happens on port 8081')
