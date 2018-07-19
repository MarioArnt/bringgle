import User from '../models/user'
import List from '../models/list'
import UsersController from './users'

const ListsController = {}

ListsController.createList = (req, res) => {
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
}

ListsController.joinList = (req, res) => {
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
}

ListsController.getList = async (req, res) => {
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
            data.owner = UsersController.userBuilder(owner)
            data.attendees = attendees
            res.json(data)
          })
        }
      })
    }
  })
}

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

const buildAttendeesList = async (list) => {
  return new Promise(resolve => {
    console.log('Building attendees list')
    const attendeesPromise = []
    for (let i = 0; i < list.attendees.length; ++i) {
      console.log('Find attendee with ID: ' + list.attendees[i])
      attendeesPromise.push(UsersController.fetchAndBuildUser(list.attendees[i]))
    }
    Promise.all(attendeesPromise).then((attendees) => {
      console.log(attendees)
      resolve(attendees)
    })
  })
}

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
      list.save((err, list) => {
        if (err) res.status(500).send(err)
        else {
          res.json({
            listId: list._id,
            attendee: UsersController.userBuilder(user)
          })
        }
      })
    }
  })
}

module.exports = ListsController
