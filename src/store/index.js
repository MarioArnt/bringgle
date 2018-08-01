import Vue from 'vue'
import Vuex from 'vuex'
import Logger from 'js-logger'

Vue.use(Vuex)

const setProperty = (oldState, newState, prop) => {
  if (newState[prop]) Vue.set(oldState, prop, newState[prop])
  else Vue.delete(oldState, prop)
}

const store = new Vuex.Store({
  state: {
    currentUser: {},
    currentList: {
      id: '',
      title: '',
      owner: {},
      attendees: [],
      connected: [],
      items: []
    }
  },
  mutations: {
    changeCurrentUser (state, user) {
      Logger.debug('Changing current user')
      Logger.debug('Old value: ', state.currentUser)
      Logger.debug('New value', user)
      setProperty(state.currentUser, user, 'id')
      setProperty(state.currentUser, user, 'name')
      setProperty(state.currentUser, user, 'email')
    },
    changeCurrentList (state, list) {
      Logger.debug('Changing current list')
      Logger.debug('Old value: ', state.currentList)
      Logger.debug('New value', list)
      setProperty(state.currentList, list, 'id')
      setProperty(state.currentList, list, 'title')
      setProperty(state.currentList, list, 'owner')
      setProperty(state.currentList, list, 'attendees')
      setProperty(state.currentList, list, 'items')
    },
    changeConnectedUsers (state, connected) {
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
    addAttendee (state, attendee) {
      if (state.currentList.attendees.some(att => att.id === attendee.id)) {
        Logger.warn('Ignoring existing attendee', attendee)
        return
      }
      state.currentList.attendees.push(attendee)
    },
    addItem (state, item) {
      if (state.currentList.items.some(it => it.id === item.id)) {
        Logger.warn('Ignoring existing item', item)
        return
      }
      state.currentList.items.push(item)
    },
    updateItem (state, item) {
      const toUpdate = state.currentList.items.find(it => it.id === item.id)
      Logger.debug('To Update', item.id)
      Logger.debug('In', state.currentList.items)
      if (!toUpdate) {
        Logger.error('Item to update not found')
        return
      }
      setProperty(toUpdate, item, 'name')
      setProperty(toUpdate, item, 'author')
      setProperty(toUpdate, item, 'quantity')
      setProperty(toUpdate, item, 'responsible')
      Logger.debug(state)
    },
    removeItem (state, itemId) {
      const toRemove = state.currentList.items.find(it => it.id === itemId)
      if (!toRemove) {
        Logger.error('Item to delete not found')
        return
      }
      const index = state.currentList.items.indexOf(toRemove)
      if (index > -1) {
        state.currentList.items.splice(index, 1)
      }
    }
  }
})

export default store
