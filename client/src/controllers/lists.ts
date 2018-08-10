import axios from '@/api'
import Logger from 'js-logger'
import store from '@/store'
import SocketsUtils from '@/sockets'
import CookiesUtils from '@/cookies'
import router from '@/router'
import errors, { ToastError } from '@/constants/errors'
import User from '@/models/user';
import List from '@/models/list';
import { AxiosError } from '../../node_modules/axios';

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
    this.getList(id).then(() => {
      Logger.debug('List successfully fetched');
      store.commit('listLoaded')
      this.socketsUtils.createSocket()
      return Promise.resolve()
    }, (err: AxiosError) => {
      Logger.debug('Handling fetch list error');
      const toastError = this.handleFetchListErrors(err, id);
      if(!toastError) return Promise.resolve();
      else return Promise.reject(toastError)
    });
  }
  
  private getList = async (id: string): Promise<List> => {
    Logger.debug('GET list request');
    if (!store.state.currentUser.id) {
      Logger.debug('User has no session');
      const err = {response: {data: {code: errors.code.NO_ID, details: {type: 'user'}}}}
      return Promise.reject(err)
    }
    Logger.debug('User has a session sending request');
    const res = await axios.get('lists/' + id, {
      params: {
        userId: store.state.currentUser.id
      }
    }).catch((err: AxiosError) => {
      Logger.debug('Request failed');
      return Promise.reject(err)
    })
    Logger.debug('Request succeed');
    Logger.debug('List loaded', store.state.currentList)
    store.commit('changeCurrentList', res.data)
    return res.data
  }

  private handleFetchListErrors = (err: AxiosError, listId: string): ToastError => {
    if (!err.response || !err.response.data) {
      Logger.debug('No error response, server connection has been failed');
      store.commit('errorLoadingList', 500);
      return new ToastError('Disconnect from server');
    }
    switch(err.response.data.code) {
      case errors.code.NO_ID: {
        const type = !err.response.data.details ? '' : err.response.data.details.type;
        switch(type){
          case 'list':
            router.push('/');
            return new ToastError('Invalid list ID');
          case 'user':
            Logger.info('Current user has no session, redirecting...', store.state.currentUser);
            router.push('/list/' + listId + '/join');
            return null;
          default:
            return new ToastError();
        }
      }
      case errors.code.RESOURCE_NOT_FOUND: {
        const type = !err.response.data.details ? '' : err.response.data.details.type;
        switch(type){
          case 'list':
            Logger.error('404: List not found');
            store.commit('errorLoadingList', 404);
            return new ToastError('Ooops it seems this list does not exist');
        }
      }
      case errors.code.NOT_AUTHORIZED: {
        Logger.info('Current user is not an attendee, redirecting...', store.state.currentUser)
        router.push('/list/' + listId + '/join')
        return null;
      }
      default:
        Logger.error('Error happened while loading the list', err);
        store.commit('errorLoadingList', 500);
        return new ToastError('Error happened while loading the list');
    }
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
      }, (err: AxiosError) => {
        Logger.error('Error happened')
        const toastError: ToastError = this.joinListErrorHandler(err, listId);
        if(!toastError) resolve();
        else reject(toastError);
      });
    });
  }

  private joinListErrorHandler = (err: AxiosError, listId: string): ToastError => {
    if (!err.response || !err.response.data) {
      store.commit('errorLoadingList', 500);
      return new ToastError('Disconnect from server');
    }
    switch (err.response.data.code) {
      case errors.code.USER_ALREADY_IN_LIST:
        Logger.info('User already attend the list redirecting')
        router.push('/list/' + listId)
        return null;
      case errors.code.EMAIL_ALREADY_TAKEN:
        Logger.info('Email already taken');
        router.push(`/list/${listId}/recovery?listName=${encodeURIComponent(err.response.data.details.listName)}&email=${encodeURIComponent(err.response.data.details.email)}`);
        return null;
      default:
        return new ToastError();
    }
  }
  
  private joinRequest = (listId: string, payload: User): Promise<CreateJoinResponse> => {
    return new Promise((resolve, reject) => {
      axios.request({
        url: 'lists/' + listId + '/join',
        method: 'post',
        data: payload
      }).then((res) => resolve(res.data), (err: AxiosError) => reject(err))
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
      }, (err: AxiosError) => {
        reject(err)
      })
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

  public static inviteAttendee = async(listId: string, email: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      axios.post(`lists/${listId}/invite`, {
        userId: store.state.currentUser.id,
        email
      }).then(() => resolve(), (err) => reject(err))
    })
  }
}
