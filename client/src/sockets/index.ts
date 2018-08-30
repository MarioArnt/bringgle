import io from 'socket.io-client'
import config from '@/config.json'
import Logger from 'js-logger'
import store from '@/store'
import User from '@/models/user'
import Item from '@/models/item'
import Action from '@/models/action'
import Message from '@/models/message'
import Tabs from '@/constants/tabs';
import HistoryController from '@/controllers/history';

export default class SocketsUtils {
  private static socket: io.Socket;
  public static createSocket = (): void => {
    SocketsUtils.socket = io(`${config.server.host}:${config.server.port}`, {
      query: {
        userId: store.state.currentUser.id,
        listId: store.state.currentList.id
      }
    })
    SocketsUtils.socket.on('user connected', connected => SocketsUtils.userConnectedOrDisconnected(connected))
    SocketsUtils.socket.on('user disconnected', connected => SocketsUtils.userConnectedOrDisconnected(connected))
    SocketsUtils.socket.on('user joined', user => SocketsUtils.userJoined(user))
    SocketsUtils.socket.on('item added', item => SocketsUtils.itemAdded(item))
    SocketsUtils.socket.on('item updated', item => SocketsUtils.itemUpdated(item))
    SocketsUtils.socket.on('item removed', item => SocketsUtils.itemRemoved( item))
    SocketsUtils.socket.on('action happened', action => SocketsUtils.actionHappened(action))
    SocketsUtils.socket.on('new message', message => SocketsUtils.newMessage(message))
    SocketsUtils.socket.on('user typing changed', usersTyping => SocketsUtils.usersTypingChanged(usersTyping));
    Logger.info('Socket created', SocketsUtils.socket)
  }

  public static destroySocket = (): void => {
    SocketsUtils.socket.close();
  }
  
  private static userConnectedOrDisconnected = (connected: string[]) => {
    Logger.info('Connected: ', connected)
    store.commit('changeConnectedUsers', connected)
  }
  
  private static userJoined = (user: User): void => {
    Logger.info('New user joined list', user)
    store.commit('addAttendee', user)
  }
  
  private static itemAdded = (item: Item): void => {
    Logger.info('New item added to list', item)
    store.commit('addItem', item)
  }
  
  private static itemUpdated = (item: Item): void => {
    Logger.info('Item updated', item)
    store.commit('updateItem', item)
  }
  
  private static itemRemoved = (itemId: string): void => {
    Logger.info('Item remove', itemId)
    store.commit('removeItem', itemId)
  }

  private static actionHappened = (action: Action): void => {
    Logger.info('New history entry', action)
    store.commit('addAction', action);
    if (store.state.currentTab === Tabs.HISTORY) {
      HistoryController.markEventAsSeen(action.id);
    }
  }

  private static newMessage = (message: Message): void => {
    Logger.info('New message', message)
    store.commit('addMessage', message)
  }

  public static startTyping = () => {
    Logger.info('sending start typing socket event')
    SocketsUtils.socket.emit('start typing');
  }
  public static stopTyping = () => {
    Logger.info('sending stop typing socket event')
    SocketsUtils.socket.emit('stop typing');
  }

  private static usersTypingChanged = (usersTyping: string[]) => {
    Logger.info('Users typing in chat', usersTyping);
    store.commit('uersTypingChanged', usersTyping);
  }
}
