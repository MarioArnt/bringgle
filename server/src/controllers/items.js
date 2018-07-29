const ListItem = require('../models/item')
const errors = require('../constants/errors')

const ItemsController = {}

ItemsController.itemBuilder = (item) => {
  const build = {
    id: item._id,
    name: item.name,
    quantity: item.quantity,
    author: item.author,
    responsible: item.responsible,
    created: item.created
  }
  Object.keys(build).forEach(key => build[key] === undefined && delete build[key])
  return build
}

ItemsController.findById = async (id, build = false) => {
  return new Promise((resolve, reject) => {
    ListItem.findById(id, (err, item) => {
      if (err) reject(errors.databaseAccess(err))
      else if (item == null) reject(errors.ressourceNotFound({ type: 'item', id }))
      else if (build) resolve(ItemsController.itemBuilder(item))
      else resolve(item)
    })
  })
}

ItemsController.save = async (item, build = false) => {
  return new Promise((resolve, reject) => {
    item.save((err, item) => {
      if (err) reject(errors.databaseAccess(err))
      else if (build) resolve(ItemsController.itemBuilder(item))
      else resolve(item)
    })
  })
}

ItemsController.delete = async (itemId) => {
  return new Promise((resolve, reject) => {
    ListItem.findByIdAndRemove(itemId, (err, item) => {
      if (err) reject(errors.databaseAccess(err))
      else resolve(item)
    })
  })
}

module.exports = ItemsController
