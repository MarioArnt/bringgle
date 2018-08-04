import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import RootState from '@/store/state'
import Mutations from '@/store/mutations';
import User from '@/models/user';
import List from '@/models/list';

Vue.use(Vuex)

const store: StoreOptions<RootState> = {
  state: {
    currentUser: new User(),
    currentList: new List(),
    listStatus: {
      loaded: false,
      error: false
    }
  },
  mutations: Mutations
};

export default new Vuex.Store<RootState>(store);
