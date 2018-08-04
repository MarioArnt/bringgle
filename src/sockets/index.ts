import io from 'socket.io-client'
import config from '@/config.json'
import Logger from 'js-logger'
import store from '@/store'
import User from '@/models/user'
import Item from '@/models/item'

export default class SocketsUtils {
  public createSocket = (): void => {
    const socket = io(`${config.server.host}:${config.server.port}`, {
      query: {
        userId: store.state.currentUser.id,
        listId: store.state.currentList.id
      }
    })
    socket.on('user connected', connected => this.userConnectedOrDisconnected(store, connected))
    socket.on('user disconnected', connected => this.userConnectedOrDisconnected(store, connected))
    socket.on('user joined', user => this.userJoined(store, user))
    socket.on('item added', item => this.itemAdded(store, item))
    socket.on('item updated', item => this.itemUpdated(store, item))
    socket.on('item removed', item => this.itemRemoved(store, item))
    Logger.info('Socket created', socket)
  }
  
  private userConnectedOrDisconnected = (store, connected: string[]) => {
    Logger.info('Connected: ', connected)
    store.commit('changeConnectedUsers', connected)
  }
  
  private userJoined = (store, user: User): void => {
    Logger.info('New user joined list', user)
    store.commit('addAttendee', user)
  }
  
  private itemAdded = (store, item: Item): void => {
    Logger.info('New item added to list', item)
    store.commit('addItem', item)
  }
  
  private itemUpdated = (store, item: Item): void => {
    Logger.info('Item updated', item)
    store.commit('updateItem', item)
  }
  
  private itemRemoved = (store, itemId: string): void => {
    Logger.info('Item remove', itemId)
    store.commit('removeItem', itemId)
  }
}
