import Logger from 'js-logger'
import axios from '@/api'
import store from '@/store'
import cookiesUtils from '@/cookies'
import router from '@/router'
import errors from '@/constants/errors'
import actions from '@/constants/actions'

const ItemsController = {}

ItemsController.addItem = () => {
  const item = store.state.newItem
  Logger.info('Submitting item', item)
  axios.post(`lists/${store.state.currentList.id}/items`, {
    quantity: item.quantity,
    name: item.name,
    author: store.state.currentUser.id
  }).then((res) => {
    store.commit('resetNewItem')
  }, (err) => addItemErrorHandler(err))
}

const addItemErrorHandler = (err) => {
  switch (err.code) {
    default:
      Logger.error('Error happened creating item', err)
      // TOAST
      break
  }
}

ItemsController.bringItem = (item, sub) => {
  Logger.info(`User ${store.state.currentUser.name} brings item ${item.name}`)
  axios.patch(`lists/${store.state.currentList.id}/items/${item.id}`, {
    userId: store.state.currentUser.id,
    action: item.responsible[sub] ? actions.CLEAR_ITEM.code : actions.BRING_ITEM.code,
    sub
  }).then((res) => {
    Logger.debug(res)
  }, (err) => bringItemErrorHandler(err.response.data))
}

const bringItemErrorHandler = (err) => {
  switch (err.code) {
    case errors.code.ITEM_ALREADY_BROUGHT:
    case errors.code.ITEM_ALREADY_CLEARED:
      Logger.warn('Item flagged as already brought/cleared upstream.')
      const serverItem = err.details
      if (serverItem) store.commit('updateItem', serverItem)
      break
    case errors.code.NOT_AUTHORIZED:
      Logger.error('User not authorized to update this list')
      router.push('/')
      break
    case errors.code.RESOURCE_NOT_FOUND:
      const itemId = err.details.id
      Logger.warn(`Item ${itemId} does not exist anymore upstream. Deleting it.`)
      if (itemId) store.commit('removeItem', err.details.id)
      break
    case errors.code.NO_ID:
      if (err.details.type === 'user') {
        Logger.error('User ID undefined')
        cookiesUtils.removeUser()
        return router.push('/')
      }
      break
    default:
      Logger.error('Error happened updating list', err)
      const msg = 'Error happened while deleting item'
      Logger.error(msg, err)
      this.$toastr.e(msg)
      break
  }
}

ItemsController.removeItem = (id) => {
  axios.delete(`lists/${store.state.currentList.id}/items/${id}`, {
    params: {
      userId: store.state.currentUser.id
    }
  }).then(res => {
    Logger.debug(res)
  }, (err) => removeItemErrorHandler(err.response.data))
}

const removeItemErrorHandler = (err) => {
  switch (err.code) {
    case errors.code.RESOURCE_NOT_FOUND:
      Logger.warn(`Item ${err.details.id} not found`)
      store.commit('removeItem', err.details.id)
      break
    default:
      const msg = 'Error happened while deleting item'
      Logger.error(msg, err)
      this.$toastr.e(msg)
      break
  }
}

export default ItemsController
