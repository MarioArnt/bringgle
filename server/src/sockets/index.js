const logger = require('../logger')

module.exports = (io) => {
  const SocketsUtils = {}
  const userConnected = (socket) => {
    const list = socket.handshake.query.listId
    const user = socket.handshake.query.userId
    if (!SocketsUtils.connections.has(list)) {
      SocketsUtils.connections.set(list, new Map())
    }
    const users = SocketsUtils.connections.get(list)
    let tabCount = 1
    if (users.has(user)) {
      tabCount = users.get(user) + 1
    }
    users.set(user, tabCount)
    socket.join(list)
    logger.debug(`User ${user} joined list ${list}`)
    logger.debug(`Now ${SocketsUtils.connections.get(list).size} users are connected to list ${list}`)
    io.sockets.to(list).emit('user connected', [...SocketsUtils.connections.get(list).keys()])
  }
  const userDisconnected = (socket) => {
    const list = socket.handshake.query.listId
    const user = socket.handshake.query.userId
    const users = SocketsUtils.connections.get(list)
    const tabCount = users.get(user)
    if (tabCount > 1) {
      users.set(user, tabCount - 1)
    } else {
      users.delete(user)
    }
    io.sockets.to(list).emit('user disconnected', [...SocketsUtils.connections.get(list).keys()])
    socket.leave(list)
    logger.debug(`User ${user} left list ${list}`)
    logger.debug(`Now ${SocketsUtils.connections.get(list).size} users are connected to list ${list}`)
  }
  SocketsUtils.connections = new Map()
  SocketsUtils.initialize = () => {
    io.on('connection', (socket) => {
      userConnected(socket)
      socket.on('disconnect', () => userDisconnected(socket))
    })
  }
  SocketsUtils.joinList = (listId, user) => {
    io.sockets.to(listId).emit('user joined', user)
  }
  SocketsUtils.itemAdded = (listId, item) => {
    io.sockets.to(listId).emit('item added', item)
  }
  SocketsUtils.itemUpdated = (listId, item) => {
    io.sockets.to(listId).emit('item updated', item)
  }
  SocketsUtils.itemRemoved = (listId, itemId) => {
    io.sockets.to(listId).emit('item removed', itemId)
  }
  return SocketsUtils
}
