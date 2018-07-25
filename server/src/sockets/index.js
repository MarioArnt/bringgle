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
    console.log(`User ${user} joined list ${list}`)
    console.log('Connected: ')
    console.log(SocketsUtils.connections.get(list))
    socket.to(list).emit('user connected', [...SocketsUtils.connections.get(list).keys()])
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
    socket.to(list).emit('user disconnected', [...SocketsUtils.connections.get(list).keys()])
    socket.leave(list)
    console.log(`User ${user} left list ${list}`)
    console.log('Connected: ')
    console.log(SocketsUtils.connections.get(list))
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
  return SocketsUtils
}
