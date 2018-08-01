module.exports = (SocketsUtils) => {
  const express = require('express')
  const ListsController = require('../controllers/lists')(SocketsUtils)
  const router = new express.Router()
  router.post('/api/lists', ListsController.createList)
  router.get('/api/lists/:id', ListsController.getList)
  router.post('/api/lists/:id/join', ListsController.joinList)
  router.post('/api/lists/:id/items', ListsController.addItem)
  router.patch('/api/lists/:listId/items/:itemId', ListsController.updateItem)
  router.delete('/api/lists/:listId/items/:itemId', ListsController.removeItem)
  return router
}
