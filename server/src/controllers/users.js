const User = require('../models/user')

const UsersController = {}

UsersController.userBuilder = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email
  }
}

UsersController.fetchAndBuildUser = (userId, res) => {
  return new Promise(resolve => {
    User.findById(userId, (err, attendee) => {
      if (err) res.status(404).send(err)
      else {
        console.log('attendee found')
        console.log(attendee)
        console.log('Reformating')
        console.log(UsersController.userBuilder(attendee))
        resolve(UsersController.userBuilder(attendee))
      }
    })
  })
}

module.exports = UsersController
