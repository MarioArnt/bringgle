module.exports = (SocketsUtils) => {
  const _ = require('lodash')
  const User = require('../models/user')
  const List = require('../models/list')
  const ListItem = require('../models/item')
  const UsersController = require('./users')
  const ItemsController = require('./items')
  const errors = require('../constants/errors')

  const ListsController = {}

  const checkId = (id, type) => {
    if (!id) return errors.noId(type)
    return null
  }

  const checkRequired = (field, value) => {
    if (!value) return errors.missingRequiredField(field)
    return null
  }

  const checkQuantity = (qty) => {
    const quantity = Number(qty)
    if (Number.isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) return errors.badQuantity(quantity)
    return null
  }

  const checkAuthorized = (list, userId, action) => {
    if (list.attendees.indexOf(userId) < 0) return errors.notAuthorized(userId, action)
    return null
  }

  const checkItemInList = (list, itemId) => {
    if (list.items.indexOf(itemId) < 0) return errors.itemNotInList(list._id, itemId)
    return null
  }

  ListsController.createList = (req, res) => {
    const listName = req.body.listName
    const userName = req.body.displayName
    const userEmail = req.body.userEmail
    const userId = req.body.userId
    const err = checkRequired('listName', listName)
    if (err) return res.status(err.status).json(err)
    if (!userId) {
      createUserAndList(listName, userName, userEmail).then((createdList)=> {
        return res.status(200).json(createdList)
      }, (err) => {
        return res.status(err.status).json(err)
      })
    } else {
      UsersController.findById(userId).then((user) => {
        createList(listName, user).then((createdList) => {
          return res.status(200).json(createdList)
        }, (err) => {
          return res.status(err.status).json(err)
        })
      }, (err) => {
        if (err.code === errors.code.RESOURCE_NOT_FOUND) {
          createUserAndList(listName, userName, userEmail).then((createdList) => {
            return res.status(200).json(createdList)
          }, (err) => {
            return res.status(err.status).json(err)
          })
        } else return res.status(err.status).json(err)
      })
    }
  }

  const createUserAndList = async (listName, userName, userEmail) => {
    let err = checkRequired('displayName', userName)
    if (!err) err = checkRequired('userEmail', userEmail)
    if (err) return Promise.reject(err)
    const owner = new User()
    owner.name = userName
    owner.email = userEmail
    const user = await UsersController.save(owner).catch(err => Promise.reject(err))
    return createList(listName, user)
  }

  const createList = async (name, owner) => {
    const list = new List()
    list.title = name
    list.owner = owner
    list.attendees = []
    list.attendees.push(owner)
    const savedList = await ListsController.save(list).catch(err => Promise.reject(err))
    return {
      id: savedList._id,
      owner: UsersController.userBuilder(owner)
    }
  }

  ListsController.joinList = (req, res) => {
    const listId = req.params.id
    const userName = req.body.displayName
    const userEmail = req.body.userEmail
    const userId = req.body.userId
    const err = checkId(uncastFalsyRequestParamter(listId), 'list_id')
    if (err) return res.status(err.status).send(err)
    if (!userId) {
      createUserAndJoinList(listId, userName, userEmail).then((data) => {
        SocketsUtils.joinList(data.listId, data.attendee)
        return res.status(200).json(data)
      }).catch((err) => { return res.status(err.status).send(err) })
    } else {
      UsersController.findById(req.body.userId).then((user) => {
        addAttendeeToList(listId, user).then((data) => {
          SocketsUtils.joinList(data.listId, data.attendee)
          return res.status(200).json(data)
        }).catch((err) => {
          return res.status(err.status).send(err)
        })
      }, (err) => {
        if (err.code === errors.code.RESOURCE_NOT_FOUND) {
          createUserAndJoinList(listId, userName, userEmail).then((data) => {
            SocketsUtils.joinList(data.listId, data.attendee)
            return res.status(200).json(data)
          }).catch((err) => {
            return res.status(err.status).send(err)
          })
        } else return res.status(err.status).send(err)
      })
    }
  }

  const createUserAndJoinList = async (listId, userName, userEmail) => {
    let err = checkRequired('displayName', userName)
    if (!err) err = checkRequired('userEmail', userEmail)
    if (err) return Promise.reject(err)
    const attendee = new User()
    attendee.name = userName
    attendee.email = userEmail
    const user = await UsersController.save(attendee).catch((err) => Promise.reject(err))
    return addAttendeeToList(listId, user)
  }

  const addAttendeeToList = async (listId, user) => {
    const list = await ListsController.findById(listId).catch((err) => Promise.reject(err))
    if (list.attendees.indexOf(user._id) >= 0) return Promise.reject(errors.userAlreadyInList(list._id, user._id))
    list.attendees.push(user)
    const savedList = await ListsController.save(list).catch((err) => {
      console.log(err)
      return Promise.reject(err)
    })
    return {
      listId: savedList._id,
      attendee: UsersController.userBuilder(user)
    }
  }

  ListsController.findById = async (id) => {
    return new Promise((resolve, reject) => {
      List.findById(id, (err, list) => {
        if (err) reject(errors.databaseAccess(err))
        else if (list == null) reject(errors.ressourceNotFound({ type: 'list', id }))
        else resolve(list)
      })
    })
  }

  const uncastFalsyRequestParamter = (param) => {
    if (param === 'undefined') return undefined
    if (param === 'null') return null
    return param
  }

  ListsController.getList = async (req, res) => {
    const err = checkId(uncastFalsyRequestParamter(req.params.id), 'list_id')
    if (err) return res.status(err.status).send(err)
    fetchListData(req.params.id).then((data) => res.json(data), (err) => res.status(err.status).send(err))
  }

  const fetchListData = async (id) => {
    const list = await ListsController.findById(id).catch((err) => Promise.reject(err))
    const owner = await UsersController.findById(list.owner, true).catch((err) => Promise.reject(err))
    const attendees = await fetchListAttendees(list).catch((err) => Promise.reject(err))
    const items = await fetchListItems(list).catch((err) => Promise.reject(err))
    return ListsController.listBuilder(list, owner, attendees, items)
  }

  ListsController.listBuilder = (list, owner, attendees, items) => {
    return {
      id: list._id,
      title: list.title,
      owner,
      attendees: attendees || [],
      items: items || []
    }
  }

  const fetchListAttendees = async (list) => {
    return new Promise((resolve, reject) => {
      const attendeesPromise = []
      for (let i = 0; i < list.attendees.length; ++i) {
        attendeesPromise.push(UsersController.findById(list.attendees[i], true))
      }
      Promise.all(attendeesPromise).then((attendees) => {
        resolve(attendees)
      }, (err) => reject(err))
    })
  }

  const fetchListItems = async (list) => {
    return new Promise((resolve, reject) => {
      const itemsPromises = []
      list.items.forEach(itemId => {
        itemsPromises.push(ItemsController.findById(itemId, true))
      })
      Promise.all(itemsPromises).then((items) => {
        resolve(items)
      }, (err) => reject(err))
    })
  }

  ListsController.addItem = async (req, res) => {
    let err = checkId(uncastFalsyRequestParamter(req.params.id), 'list_id')
    if (!err) err = checkRequired('name', req.body.name)
    if (!err) err = checkRequired('author', req.body.author)
    if (!err) err = checkRequired('quantity', req.body.quantity)
    if (!err) err = checkQuantity(req.body.quantity)
    if (err) return res.status(err.status).send(err)

    addItem(req.params.id, req.body.author, req.body.quantity, req.body.name).then((data) => {
      SocketsUtils.itemAdded(data.list._id, ItemsController.itemBuilder(data.item))
      return res.status(200).send(data.item)
    }, (err) => { return res.status(err.status).send(err) })
  }

  const addItem = async (listId, authorId, quantity, name) => {
    const list = await ListsController.findById(listId).catch((err) => Promise.reject(err))
    const author = await UsersController.findById(authorId).catch((err) => Promise.reject(err))

    const err = checkAuthorized(list, author._id, 'add item')
    if (err) return Promise.reject(err)

    let item = new ListItem()
    item.quantity = quantity
    item.name = name
    item.author = author
    item.responsible = []

    item = await ItemsController.save(item).catch((err) => Promise.reject(err))
    return addItemToList(list, item).catch((err) => Promise.reject(err))
  }

  const addItemToList = async (list, item) => {
    return new Promise((resolve, reject) => {
      list.items.push(item)
      list.save((err, list) => {
        if (err) reject(errors.databaseAccess(err))
        else resolve({list, item})
      })
    })
  }

  ListsController.bringItem = async (req, res) => {
    let err = checkId(req.body.userId, 'user')
    if (err) return res.send(err.status).send(err)
    const list = await ListsController.findById(req.params.listId).catch(err => res.send(err.status).send(err))
    const item = await ItemsController.findById(req.params.itemId).catch(err => res.send(err.status).send(err))
    const user = await UsersController.findById(req.body.userId).catch(err => res.status(err.status).send(err))
    err = checkAuthorized(list, user._id, 'bring/clear item')
    if (!err) err = checkItemInList(list, item._id)
    if (err) return res.send(err.status).send(err)

    if (item.quantity === 1) {
      console.log('Handle case 1 item')
      if (item.responsible.length === 1) {
        console.log('Already brought, clearing')
        item.responsible = []
      } else {
        console.log('User bring it')
        item.responsible = [user._id]
      }
    } else {
      if (!req.body.responsibleId) {
        item.responsible.push(user._id)
      } else {
        console.log('Not supported yet')
      }
    }
    console.log('Saving item')
    const savedItem = await ItemsController.save(item, true).catch(err => res.status(err.status).send(err))
    console.log('Done sending response')
    SocketsUtils.itemUpdated(list._id, savedItem)
    res.status(200).json(savedItem)
  }

  ListsController.removeItem = (req, res) => {
    const listId = req.params.listId
    const itemId = req.params.itemId
    const userId = req.query.userId
    let err = checkId(uncastFalsyRequestParamter(listId), 'list')
    if (!err) err = checkId(uncastFalsyRequestParamter(itemId), 'item')
    if (!err) err = checkId(uncastFalsyRequestParamter(userId), 'user')
    if (err) return res.status(err.status).send(err)
    deleteItem(listId, itemId, userId).then((deletedItem) => {
      SocketsUtils.itemRemoved(listId, deletedItem._id)
      return res.status(200).send({ id: deletedItem._id })
    }, (err) => { return res.status(err.status).send(err) })
  }

  const deleteItem = async (listId, itemId, userId) => {
    const list = await ListsController.findById(listId).catch(err => Promise.reject(err))
    const item = await ItemsController.findById(itemId).catch(err => Promise.reject(err))
    const user = await UsersController.findById(userId).catch(err => Promise.reject(err))
    let err = checkAuthorized(list, user._id, 'delete item')
    if (!err) err = checkItemInList(list, item._id)
    if (err) return Promise.reject(err)
    await removeItemFromList(list, item).catch(err => Promise.reject(err))
    const deletedItem = await ItemsController.delete(item._id).catch(err => Promise.reject(err))
    return deletedItem
  }

  const removeItemFromList = (list, item) => {
    return new Promise((resolve, reject) => {
      list.update({$pull: { items: item._id }}, (err, list) => {
        if (err) return reject(errors.databaseAccess(err))
        return resolve(list)
      })
    })
  }

  ListsController.save = (list) => {
    return new Promise((resolve, reject) => {
      list.save((err, list) => {
        if (err) reject(errors.databaseAccess(err))
        resolve(list)
      })
    })
  }

  return ListsController
}
