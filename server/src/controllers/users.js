const User = require('../models/user')
const errors = require('../constants/errors')

const UsersController = {}

UsersController.findById = async (id, build = false) => {
  return new Promise((resolve, reject) => {
    User.findById(id, (err, user) => {
      if (err) reject(errors.databaseAccess(err))
      else if (user == null) reject(errors.ressourceNotFound({ type: 'user', id }))
      else if (build) resolve(UsersController.userBuilder(user))
      else resolve(user)
    })
  })
}

UsersController.userBuilder = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email
  }
}

UsersController.save = async (user, build = false) => {
  return new Promise((resolve, reject) => {
    user.save((err, user) => {
      if (err) reject(errors.databaseAccess(err))
      else if (build) resolve(UsersController.userBuilder(user))
      else resolve(user)
    })
  })
}

module.exports = UsersController
