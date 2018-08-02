import axios from '@/api'
import Logger from 'js-logger'
import store from '@/store'
import socketsUtils from '@/sockets'
import cookiesUtils from '@/cookies'
import router from '@/router'
import errors from '@/constants/errors'

const ListsController = {}

ListsController.fetchList = (id) => {
  Logger.debug('Fetching list', id)
  getList(id).then((list) => {
    store.commit('listLoaded')
    socketsUtils.createSocket()
  }, (err) => {
    if (err.code === errors.code.NOT_AUTHORIZED) {
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

ListsController.joinList = async (listId, displayName, userEmail) => {
  const postAsCurrentUser = (displayName === store.state.currentUser.name) && (userEmail === store.state.currentUser.email)
  const payload = {
    displayName: displayName,
    userEmail: userEmail
  }
  if (postAsCurrentUser) {
    Logger.debug('Joining list as user', store.state.currentUser)
    payload.userId = store.state.currentUser.id
  } else Logger.debug('Joining list as new user')
  return new Promise((resolve, reject) => {
    joinRequest(listId, payload).then((data) => {
      Logger.info('User joined the list', data.attendee)
      cookiesUtils.setUser(data.attendee)
      store.commit('changeCurrentUser', cookiesUtils.getUser())
      router.push('/list/' + data.listId)
      resolve()
    }, (err) => {
      Logger.error('Error happened')
      if (!err.response) reject(err)
      switch (err.response.data.code) {
        case errors.code.USER_ALREADY_IN_LIST:
          Logger.info('User already attend the list redirecting')
          router.push('/list/' + listId)
          return resolve()
        default:
          return reject(err)
      }
    })
  })
}

const joinRequest = (listId, payload) => {
  return new Promise((resolve, reject) => {
    axios.request({
      url: 'lists/' + listId + '/join',
      method: 'post',
      data: payload
    }).then((res) => resolve(res.data), (err) => reject(err))
  })
}

ListsController.createList = async (listName, displayName, userEmail) => {
  const postAsCurrentUser = (displayName === store.state.currentUser.name) && (userEmail === store.state.currentUser.email)
  const payload = {
    displayName,
    listName,
    userEmail
  }
  if (postAsCurrentUser) {
    Logger.debug('Creating list as user', store.state.currentUser)
    payload.userId = store.state.currentUser.id
  } else Logger.debug('Creating list as new user')

  return new Promise((resolve, reject) => {
    postList(payload).then((data) => {
      cookiesUtils.setUser(data.owner)
      router.push('/list/' + data.id)
      resolve()
    }, (err) => {
      reject(err)
    })
  })
}

const postList = async (payload) => {
  return new Promise((resolve, reject) => {
    Logger.debug('Posting list')
    axios.request({
      url: 'lists',
      method: 'post',
      data: payload
    }).then((res) => {
      Logger.debug('Sucess', res)
      return resolve(res.data)
    }, (err) => {
      Logger.debug('error', err.response)
      return reject(err)
    })
  })
}

export default ListsController
