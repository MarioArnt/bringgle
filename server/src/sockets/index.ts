import logger from '../logger'
import { UserDTO } from '../models/user';
import { ItemDTO } from '../models/item';

export default class SocketsUtils {
  io: SocketIO.Server;
  connections: Map<string, Map<string, number>>
  constructor (io: SocketIO.Server) {
    this.io = io;
    this.connections = new Map<string, Map<string, number>>()
  }
  private userConnected = (socket: any) => {
    const list: string = socket.handshake.query.listId
    const user: string = socket.handshake.query.userId
    if (!this.connections.has(list)) {
      this.connections.set(list, new Map())
    }
    const users: Map<string, number> = this.connections.get(list)
    let tabCount: number = 1
    if (users.has(user)) {
      tabCount = users.get(user) + 1
    }
    users.set(user, tabCount)
    socket.join(list)
    logger.debug(`User ${user} joined list ${list}`)
    logger.debug(`Now ${this.connections.get(list).size} users are connected to list ${list}`)
    this.io.sockets.to(list).emit('user connected', [...this.connections.get(list).keys()])
  }
  private userDisconnected = (socket: any) => {
    const list: string = socket.handshake.query.listId
    const user: string = socket.handshake.query.userId
    const users: Map<string, number> = this.connections.get(list)
    const tabCount = users.get(user)
    if (tabCount > 1) {
      users.set(user, tabCount - 1)
    } else {
      users.delete(user)
    }
    this.io.sockets.to(list).emit('user disconnected', [...this.connections.get(list).keys()])
    socket.leave(list)
    logger.debug(`User ${user} left list ${list}`)
    logger.debug(`Now ${this.connections.get(list).size} users are connected to list ${list}`)
  }

  public initialize = () => {
    this.io.on('connection', (socket) => {
      this.userConnected(socket)
      socket.on('disconnect', () => this.userDisconnected(socket))
    })
  }

  public joinList = (listId: string, user: UserDTO) => {
    this.io.sockets.to(listId).emit('user joined', user)
  }
  public itemAdded = (listId: string, item: ItemDTO) => {
    this.io.sockets.to(listId).emit('item added', item)
  }
  public itemUpdated = (listId: string, item: ItemDTO) => {
    this.io.sockets.to(listId).emit('item updated', item)
  }
  public itemRemoved = (listId: string, itemId: string) => {
    this.io.sockets.to(listId).emit('item removed', itemId)
  }
}
