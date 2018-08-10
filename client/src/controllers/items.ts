import Logger from 'js-logger'
import axios from '@/api'
import store from '@/store'
import CookiesUtils from '@/cookies'
import router from '@/router'
import errors, { ToastError } from '@/constants/errors'
import actions from '@/constants/actions'
import { AxiosError } from '../../node_modules/axios';
import Errors from '@/constants/errors';

export default class ItemsController {
  public static addItem = (quantity, name) => {
    return new Promise((resolve, reject) => {
      const item = { quantity, name }
      Logger.info('Submitting item', item)
      axios.post(`lists/${store.state.currentList.id}/items`, {
        quantity: item.quantity,
        name: item.name,
        author: store.state.currentUser.id
      }).then(() => {
        resolve()
      }, (err: AxiosError) => {
        const toastError = ItemsController.addItemErrorHandler(err, store.state.currentList.id)
        if(!toastError) resolve();
        else reject(err);
      })
    })
  }
  
  private static addItemErrorHandler = (err: AxiosError, listId: string): ToastError => {
    if(!err.response || !err.response.data) {
      return new ToastError('Disconnect from server');
    }
    switch (err.response.data.code) {
      case Errors.code.NOT_AUTHORIZED:
        return ItemsController.unauthorized();
      case Errors.code.RESOURCE_NOT_FOUND: {
        return ItemsController.ressourceNotFound(err);
      }
      default:
        Logger.error('Error happened creating item', err);
        return new ToastError('Error happened creating item');
    }
  }

  public static bringItem = async (item, sub): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      Logger.info(`User ${store.state.currentUser.name} brings item ${item.name}`)
      axios.patch(`lists/${store.state.currentList.id}/items/${item.id}`, {
        userId: store.state.currentUser.id,
        action: item.responsible[sub] ? actions.CLEAR_ITEM.code : actions.BRING_ITEM.code,
        sub
      }).then((res) => {
        Logger.debug(res)
        resolve();
      }, (err: AxiosError) => {
        const toastError = ItemsController.bringItemErrorHandler(err);
        if(!toastError) resolve();
        else reject(toastError);
      });
    })
  }

  private static bringItemErrorHandler = (err: AxiosError): ToastError => {
    if(!err.response || !err.response.data) {
      return new ToastError('Disconnect from server');
    }
    switch (err.response.data.code) {
      case errors.code.ITEM_ALREADY_BROUGHT:
      case errors.code.ITEM_ALREADY_CLEARED:
        Logger.warn('Item flagged as already brought/cleared upstream.')
        const serverItem = err.response.data.details
        Logger.debug('server item', serverItem)
        if (serverItem) store.commit('updateItem', serverItem)
        return new ToastError('Item status changed upstream');
      case errors.code.NOT_AUTHORIZED:
        return ItemsController.unauthorized();
      case errors.code.RESOURCE_NOT_FOUND: {
        return ItemsController.ressourceNotFound(err);
      }
      case errors.code.NO_ID:
        return ItemsController.sessionLost(err);
      default:
        return new ToastError('Error happened while updating item');
    }
  }

  public static updateItem = (id: string, quantity: number, name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      axios.patch(`lists/${store.state.currentList.id}/items/${id}`, {
        userId: store.state.currentUser.id,
        action: actions.UPDATE_QUANTITY_AND_NAME.code,
        newName: name,
        newQuantity: quantity
      }).then((res) => {
        resolve()
      }, (err) => reject(err))
    })
  }

  public static removeItem = async (id: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      axios.delete(`lists/${store.state.currentList.id}/items/${id}`, {
        params: {
          userId: store.state.currentUser.id
        }
      }).then(res => {
        Logger.debug(res)
        resolve();
      }, (err: AxiosError) => {
        const toastError = ItemsController.removeItemErrorHandler(err);
        if(!toastError) resolve();
        else reject(toastError);
      });
    });
  }
  
  private static removeItemErrorHandler = (err: AxiosError): ToastError => {
    if(!err.response || !err.response.data) {
      return new ToastError('Disconnect from server');
    }
    switch (err.response.data.code) {
      case errors.code.NOT_AUTHORIZED:
        return ItemsController.unauthorized();
      case errors.code.RESOURCE_NOT_FOUND: {
        return ItemsController.ressourceNotFound(err);
      }
      case errors.code.NO_ID:
        return ItemsController.sessionLost(err);
      default:
        const msg = 'Error happened while deleting item'
        Logger.error(msg, err)
        return new ToastError('Error happened while deleting item');
    }
  }

  private static ressourceNotFound = (err: AxiosError): ToastError => {
    const type = !err.response.data.details ? '' : err.response.data.details.type;
    switch(type) {
      case 'list':
        router.push(`/list/${store.state.currentList.id}`);
        return null;
      case 'item':
        const itemId = err.response.data.details.id
        Logger.warn(`Item ${itemId} does not exist anymore upstream. Deleting it.`)
        if (itemId) store.commit('removeItem', err.response.data.details.id)
        return new ToastError('Item deleted upstream');
      case 'user':
        Logger.error('User deleted upstream!');
        CookiesUtils.removeUser();
        router.push('/')
        return new ToastError('You are not authorized to contribute to this list.');
    }
  }
  private static unauthorized = (): ToastError => {
    Logger.error('User not authorized to update this list')
    router.push('/')
    return new ToastError('You are not authorized to contribute to this list.');
  }

  private static sessionLost = (err: AxiosError): ToastError => {
    if (err.response.data.details.type === 'user') {
      Logger.error('User ID undefined')
      CookiesUtils.removeUser()
      router.push('/')
      return new ToastError('Your session have been lost.');
    }
  } 
}
