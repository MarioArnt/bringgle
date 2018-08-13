import {MutationTree} from 'vuex';
import RootState from '@/store/state'
import User from '@/models/user'
import List from '@/models/list'
import Item from '@/models/item'
import Action from '@/models/action'
import Message from '@/models/message'
import Vue from 'vue'
import Logger from 'js-logger'

const setProperty = (oldState: any, newState: any, prop: string): void => {
  if (newState[prop]) Vue.set(oldState, prop, newState[prop])
  else Vue.delete(oldState, prop)
}

const mutations: MutationTree<RootState> = {
  changeCurrentUser (state: RootState, user: User): void {
    Logger.debug('Changing current user')
    Logger.debug('Old value: ', state.currentUser)
    Logger.debug('New value', user)
    setProperty(state.currentUser, user, 'id')
    setProperty(state.currentUser, user, 'name')
    setProperty(state.currentUser, user, 'email')
  },
  changeCurrentList (state: RootState, list: List): void {
    Logger.debug('Changing current list')
    Logger.debug('Old value: ', state.currentList)
    Logger.debug('New value', list)
    setProperty(state.currentList, list, 'id')
    setProperty(state.currentList, list, 'title')
    setProperty(state.currentList, list, 'owner')
    setProperty(state.currentList, list, 'attendees')
    setProperty(state.currentList, list, 'items')
    setProperty(state.currentList, list, 'history')
    setProperty(state.currentList, list, 'messages')
  },
  changeConnectedUsers (state: RootState, connected: string[]): void {
    state.currentList.attendees.forEach((att) => Vue.set(att, 'connected', false))
    if (connected) {
      Vue.set(state.currentList, 'connected', connected)
      connected.forEach(uid => {
        const attendee = state.currentList.attendees.find(att => att.id === uid)
        if (attendee) {
          Vue.set(attendee, 'connected', true)
        }
      })
    } else {
      Vue.delete(state.currentList, 'connected')
    }
    Logger.debug('New value', state.currentList)
  },
  addAttendee (state: RootState, attendee: User): void {
    if (state.currentList.attendees.some(att => att.id === attendee.id)) {
      Logger.warn('Ignoring existing attendee', attendee)
      return
    }
    state.currentList.attendees.push(attendee)
  },
  addItem (state: RootState, item: Item): void {
    if (state.currentList.items.some(it => it.id === item.id)) {
      Logger.warn('Ignoring existing item', item)
      return
    }
    state.currentList.items.push(item)
  },
  updateItem (state: RootState, item: Item): void {
    const toUpdate = state.currentList.items.find(it => it.id === item.id)
    if (!toUpdate) {
      Logger.error('Item to update not found')
      return
    }
    setProperty(toUpdate, item, 'name')
    setProperty(toUpdate, item, 'author')
    setProperty(toUpdate, item, 'quantity')
    setProperty(toUpdate, item, 'responsible')
    Vue.set(toUpdate, 'edit', false)
    Logger.debug(state)
  },
  disableEditionState (state: RootState, id: string): void {
    const item = state.currentList.items.find(it => it.id === id)
    if (!item) {
      Logger.error('Item not found')
      return
    }
    Vue.set(item, 'edit', false)
  },
  removeItem (state: RootState, itemId: string): void {
    const toRemove = state.currentList.items.find(it => it.id === itemId)
    if (!toRemove) {
      Logger.error('Item to delete not found')
      return
    }
    const index = state.currentList.items.indexOf(toRemove)
    if (index > -1) {
      state.currentList.items.splice(index, 1)
    }
  },
  listLoaded (state: RootState): void {
    Vue.set(state.listStatus, 'loaded', true)
    Vue.set(state.listStatus, 'error', null)
  },
  errorLoadingList (state: RootState, status: number): void {
    Vue.set(state.listStatus, 'loaded', false)
    Vue.set(state.listStatus, 'error', status)
  },
  clearListStatus (state: RootState): void {
    Vue.set(state.listStatus, 'loaded', false)
    Vue.set(state.listStatus, 'error', null)
  },
  addAction (state: RootState, action: Action) {
    state.currentList.history.push(action);
  },
  addMessage (state: RootState, message: Message) {
    state.currentList.messages.push(message);
  }
};

export default mutations
