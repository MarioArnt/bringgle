import axios from '@/api'
import Logger from 'js-logger'
import store from '@/store'
import SocketsUtils from '@/sockets'
import CookiesUtils from '@/cookies'
import router from '@/router'
import errors, { ToastError } from '@/constants/errors'
import User from '@/models/user';
import List, { ListDTO } from '@/models/list';
import Item, { ItemDTO } from '@/models/item';
import { AxiosError } from '../../node_modules/axios';
import moment from 'moment';
import Action, { ActionDTO } from '@/models/action';
import Message, { MessageDTO } from '@/models/message';

interface CreateJoinResponse {
  listId: string;
  user: User;
}

export default class ListsController {
  public static fetchList = async (id: string): Promise<void> => {
    Logger.debug('Fetching list', id)
    ListsController.getList(id).then((listDTO: ListDTO) => {
      Logger.debug('List successfully fetched');
      Logger.time('Building list');
      const list = ListsController.populateList(listDTO);
      Logger.timeEnd('Building list');
      store.commit('changeCurrentList', list);
      store.commit('listLoaded');
      SocketsUtils.createSocket();
      return Promise.resolve()
    }, (err: AxiosError) => {
      Logger.debug('Handling fetch list error');
      const toastError = ListsController.handleFetchListErrors(err, id);
      if(!toastError) return Promise.resolve();
      else return Promise.reject(toastError);
    });
  }

  private static populateList = (list: ListDTO): List => {
    const attendeesMap: Map<string, User> = ListsController.createAttendeesMap(list.attendees);
    const builtList = new List(list.title, list.owner, list.attendees);
    builtList.id = list.id;
    builtList.items = ListsController.populateItemResponsible(list.items, attendeesMap);
    builtList.history = ListsController.populateHistory(list.history, attendeesMap);
    builtList.messages = ListsController.populateMessages(list.messages, attendeesMap);
    return builtList;
  }

  private static populateItemResponsible = (items: ItemDTO[], attendeesMap: Map<string, User>) => {
    const built: Item[] = [];
    items.forEach((item => {
      const builtItem = new Item();
      builtItem.id = item.id;
      builtItem.name = item.name;
      builtItem.quantity = item.quantity;
      builtItem.responsible = new Map<number, User>();
      builtItem.created = item.created;
      Object.keys(item.responsible).forEach(key => {
        builtItem.responsible.set(Number(key), attendeesMap.get(item.responsible[key]));
      })
      built.push(builtItem);
    }));
    return built;
  };

  private static populateHistory = (actions: ActionDTO[], attendeesMap: Map<string, User>): Action[] => {
    const built: Action[] = [];
    actions.forEach(action => {
      const builtAction = new Action(action.code, attendeesMap.get(action.by), action.date);
      builtAction.itemName = action.itemName;
      builtAction.oldValue = action.oldValue;
      builtAction.newValue = action.newValue;
      action.seen.forEach((seen) => {
        builtAction.seen.push({
          by: attendeesMap.get(seen.by),
          date: seen.date
        });
      });
      built.push(builtAction);
    });
    return built;
  }

  private static populateMessages = (messages: MessageDTO[], attendeesMap: Map<string, User>) => {
    const built: Message[] = [];
    messages.forEach(msg => {
      const builtMessage = new Message(attendeesMap.get(msg.from), attendeesMap.get(msg.to), msg.msg, msg.sent);
      msg.seen.forEach((seen) => {
        builtMessage.seen.push({
          by: attendeesMap.get(seen.by),
          date: seen.date
        });
      });
      built.push(builtMessage);
    });
    return built;
  }

  private static createAttendeesMap = (attendees: User[]): Map<string, User> => {
    const result = new Map<string, User>();
    for(let i = 0; i < attendees.length; ++i) {
      result.set(attendees[i].id, attendees[i]);
    }
    return result;
  }
  
  private static getList = async (id: string): Promise<ListDTO> => {
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
    Logger.debug('List DTO loaded', res.data)
    return res.data
  }

  private static handleFetchListErrors = (err: AxiosError, listId: string): ToastError => {
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
  
  public static joinList = async (listId: string, displayName: string, userEmail: string): Promise<void> => {
    const postAs = new User()
    const postAsCurrentUser: boolean = (displayName === store.state.currentUser.name) && (userEmail === store.state.currentUser.email)
    if (postAsCurrentUser) {
      Logger.debug('Joining list as user', store.state.currentUser)
      postAs.id = store.state.currentUser.id
    } else Logger.debug('Joining list as new user')
    postAs.name = displayName
    postAs.email = userEmail
    return new Promise<void>((resolve, reject) => {
      ListsController.joinRequest(listId, postAs).then((data: CreateJoinResponse) => {
        Logger.info('User joined the list', data.user)
        CookiesUtils.setUser(data.user)
        store.commit('changeCurrentUser', CookiesUtils.getUser())
        router.push('/list/' + listId)
        resolve()
      }, (err: AxiosError) => {
        Logger.error('Error happened')
        const toastError: ToastError = ListsController.joinListErrorHandler(err, listId);
        if(!toastError) resolve();
        else reject(toastError);
      });
    });
  }

  private static joinListErrorHandler = (err: AxiosError, listId: string): ToastError => {
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
  
  private static joinRequest = (listId: string, payload: User): Promise<CreateJoinResponse> => {
    return new Promise((resolve, reject) => {
      axios.request({
        url: 'lists/' + listId + '/join',
        method: 'post',
        data: payload
      }).then((res) => resolve(res.data), (err: AxiosError) => reject(err))
    })
  }
  
  public static createList = async (listName: string, displayName: string, userEmail: string): Promise<void> => {
    const postAs = new User();
    if((displayName === store.state.currentUser.name) && (userEmail === store.state.currentUser.email)) {
      Logger.debug('Creating list as user', store.state.currentUser)
      postAs.id = store.state.currentUser.id;
    } else Logger.debug('Creating list as new user')
    postAs.name = displayName;
    postAs.email = userEmail;
    const payload = new List(listName, postAs)
    return new Promise<void>((resolve, reject) => {
      ListsController.postList(payload).then((data) => {
        CookiesUtils.setUser(data.user)
        router.push('/list/' + data.listId)
        resolve()
      }, (err: AxiosError) => {
        reject(err)
      })
    })
  }

  private static postList = async (payload: List): Promise<CreateJoinResponse> => {
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
