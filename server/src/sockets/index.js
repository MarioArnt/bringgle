module.exports = (io) => {
  const SocketsUtils = {}

  SocketsUtils.socket = {}
  SocketsUtils.initialize = () => {
    io.on('connection', (socket) => {
      const list = socket.handshake.query.listId
      const user = socket.handshake.query.userId
      socket.join(list)
      console.log(`User ${user} joined list ${list}`)
      socket.on('disconnect', () => {
        socket.leave(list)
        console.log(`User ${user} left list ${list}`)
      })
    })
  }
  return SocketsUtils
}
