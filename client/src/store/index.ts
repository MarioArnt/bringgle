import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import RootState from '@/store/state'
import Mutations from '@/store/mutations';
import User from '@/models/user';
import List from '@/models/list';
import moment from 'moment'
import Tabs from '@/constants/tabs';

Vue.use(Vuex)

const store: StoreOptions<RootState> = {
  state: {
    currentUser: new User(),
    currentList: new List(),
    currentTab: null,
    listStatus: {
      loaded: false,
      error: null
    },
    usersTyping: []
  },
  mutations: Mutations,
  getters: {
    orderedHistory: state => {
      return state.currentList.history.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());
    },
    orderedMessages: state => {
      return state.currentList.messages.sort((a, b) => moment(a.sent).valueOf() - moment(b.sent).valueOf());
    },
    unreadMessages: state => {
      return state.currentList.messages.filter(msg => !msg.seen.some(see => see.by.id === state.currentUser.id));
    },
    unreadHistory: state => {
      return state.currentList.history.filter(act => !act.seen.some(see => see.by.id === state.currentUser.id));
    },
    whoIsTyping: state => {
      return state.usersTyping.filter(typing => typing.id !== state.currentUser.id);
    }
  }
};

export default new Vuex.Store<RootState>(store);
