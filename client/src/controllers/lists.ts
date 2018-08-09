import axios from '@/api'
import Logger from 'js-logger'
import store from '@/store'
import SocketsUtils from '@/sockets'
import CookiesUtils from '@/cookies'
import router from '@/router'
import errors from '@/constants/errors'
import User from '@/models/user';
import List from '@/models/list';

interface CreateJoinResponse {
  listId: string;
  user: User;
}

export default class ListsController {
  socketsUtils: SocketsUtils;
  cookiesUtils: CookiesUtils;
  constructor () {
    this.socketsUtils = new SocketsUtils();
  }
  public fetchList = async (id: string): Promise<void> => {
    Logger.debug('Fetching list', id)
    this.getList(id).then((list) => {
      store.commit('listLoaded')
      this.socketsUtils.createSocket()
      return Promise.resolve()
    }, (err) => {
      if (err.code === errors.code.NOT_AUTHORIZED) {
        Logger.info('Current user is not an attendee, redirecting...', store.state.currentUser)
        router.push('/list/' + id + '/join')
        return Promise.resolve()
      }
      Logger.error('Error happened while loading the list', err)
      store.commit('errorLoadingList')
      return Promise.reject(err)
    })
  }
  
  private getList = async (id: string): Promise<List> => {
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
  
  public joinList = async (listId: string, displayName: string, userEmail: string): Promise<void> => {
    const postAs = new User()
    const postAsCurrentUser: boolean = (displayName === store.state.currentUser.name) && (userEmail === store.state.currentUser.email)
    if (postAsCurrentUser) {
      Logger.debug('Joining list as user', store.state.currentUser)
      postAs.id = store.state.currentUser.id
    } else Logger.debug('Joining list as new user')
    postAs.name = displayName
    postAs.email = userEmail
    return new Promise<void>((resolve, reject) => {
      this.joinRequest(listId, postAs).then((data: CreateJoinResponse) => {
        Logger.info('User joined the list', data.user)
        CookiesUtils.setUser(data.user)
        store.commit('changeCurrentUser', CookiesUtils.getUser())
        router.push('/list/' + listId)
        resolve()
      }, (err) => {
        Logger.error('Error happened')
        if (!err.response) reject(err)
        switch (err.response.data.code) {
          case errors.code.USER_ALREADY_IN_LIST:
            Logger.info('User already attend the list redirecting')
            router.push('/list/' + listId)
            return resolve()
          case errors.code.EMAIL_ALREADY_TAKEN:
            Logger.info('Email already taken');
            router.push(`/list/${listId}/recovery?listName=${err.response.data.details.listName}&email=${err.response.data.details.email}`);
            return reject(err);
          default:
            return reject(err);
        }
      });
    });
  }
  
  private joinRequest = (listId: string, payload: User): Promise<CreateJoinResponse> => {
    return new Promise((resolve, reject) => {
      axios.request({
        url: 'lists/' + listId + '/join',
        method: 'post',
        data: payload
      }).then((res) => resolve(res.data), (err) => reject(err))
    })
  }
  
  public createList = async (listName: string, displayName: string, userEmail: string): Promise<void> => {
    const postAs = new User();
    if((displayName === store.state.currentUser.name) && (userEmail === store.state.currentUser.email)) {
      Logger.debug('Creating list as user', store.state.currentUser)
      postAs.id = store.state.currentUser.id;
    } else Logger.debug('Creating list as new user')
    postAs.name = displayName;
    postAs.email = userEmail;
    const payload = new List(listName, postAs)
    return new Promise<void>((resolve, reject) => {
      this.postList(payload).then((data) => {
        CookiesUtils.setUser(data.user)
        router.push('/list/' + data.listId)
        resolve()
      }, (err) => {
        reject(err)
      })
    })
  }

  public static inviteAttendee = async(listId: string, email: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      axios.post(`lists/${listId}/invite`, {
        userId: store.state.currentUser.id,
        email
      }).then(() => resolve(), (err) => reject(err))
    })
  }
  
  private postList = async (payload: List): Promise<CreateJoinResponse> => {
    return new Promise<CreateJoinResponse>((resolve, reject) => {
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
}
