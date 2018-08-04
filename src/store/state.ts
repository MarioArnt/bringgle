import User from '@/models/user'
import List from '@/models/list'

export default interface RootState {
  currentUser: User,
  currentList: List,
  listStatus: {
    loaded: boolean,
    error: boolean
  }
}