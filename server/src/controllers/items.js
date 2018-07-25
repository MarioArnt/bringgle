const ListItem = require('../models/listItem')

const ItemController = {}

ItemController.itemBuilder = (item) => {
  return {
    id: item._id,
    name: item.name,
    quantity: item.quantity,
    author: item.author,
    responsible: item.responsible,
    created: item.created
  }
}

ItemController.fetchAndBuildItem = (itemId, res) => {
  return new Promise(resolve => {
    ListItem.findById(itemId, (err, item) => {
      if (err) res.status(404).send(err)
      else {
        resolve(ItemController.itemBuilder(item))
      }
    })
  })
}

module.exports = ItemController
