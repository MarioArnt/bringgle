import io from 'socket.io-client'
import config from '@/config.json'
import Logger from 'js-logger'
import store from '@/store'
import User from '@/models/user'
import Item from '@/models/item'

export default class SocketsUtils {
  private static socket: io.Socket;
  public static createSocket = (): void => {
    SocketsUtils.socket = io(`${config.server.host}:${config.server.port}`, {
      query: {
        userId: store.state.currentUser.id,
        listId: store.state.currentList.id
      }
    })
    SocketsUtils.socket.on('user connected', connected => SocketsUtils.userConnectedOrDisconnected(store, connected))
    SocketsUtils.socket.on('user disconnected', connected => SocketsUtils.userConnectedOrDisconnected(store, connected))
    SocketsUtils.socket.on('user joined', user => SocketsUtils.userJoined(store, user))
    SocketsUtils.socket.on('item added', item => SocketsUtils.itemAdded(store, item))
    SocketsUtils.socket.on('item updated', item => SocketsUtils.itemUpdated(store, item))
    SocketsUtils.socket.on('item removed', item => SocketsUtils.itemRemoved(store, item))
    Logger.info('Socket created', SocketsUtils.socket)
  }

  public static destroySocket = (): void => {
    SocketsUtils.socket.close();
  }
  
  private static userConnectedOrDisconnected = (store, connected: string[]) => {
    Logger.info('Connected: ', connected)
    store.commit('changeConnectedUsers', connected)
  }
  
  private static userJoined = (store, user: User): void => {
    Logger.info('New user joined list', user)
    store.commit('addAttendee', user)
  }
  
  private static itemAdded = (store, item: Item): void => {
    Logger.info('New item added to list', item)
    store.commit('addItem', item)
  }
  
  private static itemUpdated = (store, item: Item): void => {
    Logger.info('Item updated', item)
    store.commit('updateItem', item)
  }
  
  private static itemRemoved = (store, itemId: string): void => {
    Logger.info('Item remove', itemId)
    store.commit('removeItem', itemId)
  }
}
