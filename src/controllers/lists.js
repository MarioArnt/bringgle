import axios from '@/api'
import Logger from 'js-logger'
import store from '@/store'
import socketsUtils from '@/sockets'
import router from '@/router'
import errors from '@/constants/errors'

const ListsController = {}

ListsController.fetchList = (id) => {
  Logger.debug('Fetching list', id)
  getList(id).then((list) => {
    store.commit('listLoaded')
    socketsUtils.createSocket()
  }, (err) => {
    if (err.data.code === errors.code.NOT_AUTHORIZED) {
      Logger.info('Current user is not an attendee, redirecting...', store.state.currentUser)
      router.push('/list/' + id + '/join')
    }
    Logger.error('Error happened while loading the list', err)
    store.commit('errorLoadingList')
  })
}

const getList = async (id) => {
  if (!store.state.currentUser.id) {
    const err = {code: errors.code.NOT_AUTHORIZED}
    return Promise.reject(err)
  }
  const res = await axios.get('lists/' + id, {
    params: {
      userId: store.state.currentUser.id
    }
  }).catch((err) => {
    return Promise.reject(err.response)
  })
  Logger.debug('List loaded', store.state.currentList)
  store.commit('changeCurrentList', res.data)
  return res.data
}

export default ListsController
