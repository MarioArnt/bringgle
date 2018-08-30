import User from '@/models/user';
import List from '@/models/list';
import Tabs from '@/constants/tabs';

export default interface RootState {
  currentUser: User,
  currentList: List,
  currentTab: Tabs,
  listStatus: {
    loaded: boolean,
    error: number
  },
  usersTyping: User[]
};
