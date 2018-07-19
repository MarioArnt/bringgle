import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    currentUser: {}
  },
  mutations: {
    changeCurrentUser (state, user) {
      if (user.id) Vue.set(state.currentUser, 'id', user.id)
      else Vue.delete(state.currentUser, 'id')
      if (user.name) Vue.set(state.currentUser, 'name', user.name)
      else Vue.delete(state.currentUser, 'name')
      if (user.email) Vue.set(state.currentUser, 'email', user.email)
      else Vue.delete(state.currentUser, 'email')
    }
  }
})

export default store
