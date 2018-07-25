module.exports = (SocketsUtils) => {
  const express = require('express')
  const ListsController = require('../controllers/lists')(SocketsUtils)
  const router = new express.Router()
  router.post('/api/lists', ListsController.createList)
  router.get('/api/lists/:id', ListsController.getList)
  router.post('/api/lists/:id/join', ListsController.joinList)
  return router
}
