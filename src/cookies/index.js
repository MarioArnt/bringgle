import Cookies from 'js-cookie'
import Logger from 'js-logger'
import store from '@/store'

const cookiesUtils = {}

cookiesUtils.setUser = (user) => {
  Cookies.set('user_id', user.id)
  Cookies.set('user_name', user.name)
  Cookies.set('user_email', user.email)
  store.commit('changeCurrentUser', cookiesUtils.getUser())
  Logger.info('User saved in cookies', Cookies.get())
}

cookiesUtils.getUser = () => {
  const user = {}
  const cookies = Cookies.get()
  if (cookies.user_id) user.id = cookies.user_id
  if (cookies.user_name) user.name = cookies.user_name
  if (cookies.user_email) user.email = cookies.user_email
  Logger.info('Reading current user from cookies', user)
  return user
}

cookiesUtils.removeUser = () => {
  Cookies.remove('user_id')
  Cookies.remove('user_name')
  Cookies.remove('user_email')
  store.commit('changeCurrentUser', {})
  Logger.info('User removed from cookies')
}

export default cookiesUtils
