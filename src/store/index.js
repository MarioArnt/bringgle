import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    currentUser: {}
  },
  mutations: {
    changeCurrentUser (state, user) {
      Vue.set(state.currentUser, 'id', user.id)
      Vue.set(state.currentUser, 'name', user.name)
      Vue.set(state.currentUser, 'email', user.email)
    }
  }
})

export default store
