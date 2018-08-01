import io from 'socket.io-client'
import config from '@/config.json'
import Logger from 'js-logger'
import store from '@/store'

const socketsUtils = {}

socketsUtils.createSocket = () => {
  const socket = io(`${config.server.host}:${config.server.port}`, {
    query: {
      userId: store.state.currentUser.id,
      listId: store.state.currentList.id
    }
  })
  socket.on('user connected', connected => userConnectedOrDisconnected(store, connected))
  socket.on('user disconnected', connected => userConnectedOrDisconnected(store, connected))
  socket.on('user joined', user => userJoined(store, user))
  socket.on('item added', item => itemAdded(store, item))
  socket.on('item updated', item => itemUpdated(store, item))
  socket.on('item removed', item => itemRemoved(store, item))
  Logger.info('Socket created', socket)
}

const userConnectedOrDisconnected = (store, connected) => {
  Logger.info('Connected: ', connected)
  store.commit('changeConnectedUsers', connected)
}

const userJoined = (store, user) => {
  Logger.info('New user joined list', user)
  store.commit('addAttendee', user)
}

const itemAdded = (store, item) => {
  Logger.info('New item added to list', item)
  store.commit('addItem', item)
}

const itemUpdated = (store, item) => {
  Logger.info('Item updated', item)
  store.commit('updateItem', item)
}

const itemRemoved = (store, itemId) => {
  Logger.info('Item remove', itemId)
  store.commit('removeItem', itemId)
}

export default socketsUtils
