const _ = require('lodash')

module.exports = (io) => {
  const SocketsUtils = {}

  SocketsUtils.connections = new Map()
  SocketsUtils.initialize = () => {
    io.on('connection', (socket) => {
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
      socket.on('disconnect', () => {
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
      })
    })
  }
  return SocketsUtils
}
