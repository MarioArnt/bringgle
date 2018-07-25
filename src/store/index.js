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
      state.currentList.attendees.push(attendee)
    }
  }
})

export default store
