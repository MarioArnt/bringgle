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
    if (!id) return errors.noId({type, value: id})
    return null
  }

  const checkRequired = (field, value) => {
    if (!value) return errors.missingRequiredField(field)
    return null
  }

  const checkQuantity = (qty) => {
    const quantity = Number(qty)
    if (quantity.isNaN || quantity <= 0) return errors.badQuantity(quantity)
    return null
  }

  const checkAuthorized = (list, userId, action) => {
    console.log(userId)
    console.log(list.attendees)
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
    }
    UsersController.findById(userId).then((user) => {
      createList(listName, user).then((createdList) => {
        return res.status(200).json(createdList)
      }, (err) => {
        return res.status(err.status).json(err)
      })
    }, (err) => {
      console.log('User not found')
      console.log(err)
      if (err.code === errors.code.RESOURCE_NOT_FOUND) {
        createUserAndList(listName, userName, userEmail).then((createdList) => {
          return res.status(200).json(createdList)
        }, (err) => {
          return res.status(err.status).json(err)
        })
      } else return res.status(err.status).json(err)
    })
  }

  const createUserAndList = async (listName, userName, userEmail) => {
    console.log('Checking prerequisites...')
    let err = checkRequired('displayName', userName)
    if (!err) err = checkRequired('userEmail', userEmail)
    if (err) return Promise.reject(err)
    console.log('done')
    const owner = new User()
    owner.name = userName
    owner.email = userEmail
    console.log('Saving user...')
    const user = await UsersController.save(owner).catch(err => Promise.reject(err))
    console.log('done')
    return createList(listName, user)
  }

  const createList = async (name, owner) => {
    const list = new List()
    list.title = name
    list.owner = owner
    list.attendees = []
    list.attendees.push(owner)
    console.log('saving list...')
    const savedList = await ListsController.save(list).catch(err => Promise.reject(err))
    console.log('done')
    return {
      id: savedList._id,
      owner: UsersController.userBuilder(owner)
    }
  }

  ListsController.joinList = async (req, res) => {
    const listId = req.params.id
    const userName = req.params.displayName
    const userEmail = req.params.userEmail
    const userId = req.body.userId
    const err = checkId(res, listId, 'list_id')
    if (err) return res.status(err.status).send(err)
    if (!userId) {
      const data = await createUserAndJoinList(listId, userName, userEmail).catch(err => res.status(err.status).send(err))
      res.status(200).json(data)
      SocketsUtils.joinList(data.listId, data.attendee)
    }
    const user = await UsersController.findById(req.body.userId).catch(err => {
      if (err.code === errors.code.RESOURCE_NOT_FOUND) {
        createUserAndJoinList(listId, userName, userEmail).then((data => {
          res.status(200).json(data)
          SocketsUtils.joinList(data.listId, data.attendee)
        }, (err) => res.status(err.status).send(err)))
      } else res.status(err.status).send(err)
    })
    const data = await addAttendeeToList(listId, user).catch(err => res.status(err.status).send(err))
    res.status(200).json(data)
    SocketsUtils.joinList(data.listId, data.attendee)
  }

  const createUserAndJoinList = async (listId, userName, userEmail) => {
    if (checkRequired('displayName', userName)) Promise.reject(checkRequired('displayName', userName))
    if (checkRequired('userEmail', userEmail)) Promise.reject(checkRequired('userEmail', userEmail))
    const attendee = new User()
    attendee.name = userName
    attendee.email = userEmail
    const user = UsersController.save(attendee).catch(Promise.reject)
    return addAttendeeToList(listId, user)
  }

  const addAttendeeToList = async (listId, user) => {
    const list = await ListsController.findById(listId).catch(Promise.reject)
    if (list.attendees.some((att) => att.id === user.id)) Promise.reject(errors.userAlreadyInList(list._id, user._id))
    list.attendees.push(user)
    const savedList = await ListsController.save(list).catch(Promise.reject)
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

  ListsController.getList = async (req, res) => {
    const err = checkId(req.params.id, 'list_id')
    if (err) return res.status(err.status).send(err)
    const list = await ListsController.findById(req.params.id).catch((err) => res.status(err.status).send(err))
    const owner = await UsersController.findById(list.owner, true).catch((err) => res.status(err.status).send(err))
    const attendees = await fetchListAttendees(list).catch((err) => res.status(err.status).send(err))
    const items = await fetchListItems(list).catch((err) => res.status(err.status).send(err))
    const data = {}
    data.id = list._id
    data.title = list.title
    data.owner = owner
    data.attendees = attendees || []
    data.items = items || []
    res.json(data)
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
    let err = checkId(req.params.id, 'list_id')
    if (!err) err = checkRequired('name', req.body.name)
    if (!err) err = checkRequired('author', req.body.author)
    if (!err) err = checkQuantity(req.body.quantity)
    if (err) return res.status(err.status).send(err)

    const list = await ListsController.findById(req.params.id).catch((err) => res.status(err.status).send(err))
    const author = await UsersController.findById(req.body.author).catch((err) => res.status(err.status).send(err))

    err = checkAuthorized(res, list, author._id, 'add item')
    if (err) return res.status(err.status).send(err)

    let item = new ListItem()
    item.quantity = req.body.quantity
    item.name = req.body.name
    item.author = author
    item.responsible = []

    item = await ItemsController.save(item).catch(err => res.status(err.status).send(err))
    await addItemToList(list, item).catch(err => res.status(err.status).send(err))

    SocketsUtils.itemAdded(list._id, ItemsController.itemBuilder(item))
  }

  const addItemToList = async (list, item) => {
    return new Promise((resolve, reject) => {
      list.items.push(item)
      list.save((err, list) => {
        if (err) reject(errors.databaseAccess(err))
        else resolve(list)
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

  ListsController.removeItem = async (req, res) => {
    let err = checkId(req.query.userId, 'user')
    if (err) return res.send(err.status).send(err)
    const list = await ListsController.findById(req.params.listId).catch(err => res.send(err.status).send(err))
    const item = await ItemsController.findById(req.params.itemId).catch(err => res.send(err.status).send(err))
    const user = await UsersController.findById(req.body.userId).catch(err => res.status(err.status).send(err))
    err = checkAuthorized(list, user._id, 'bring/clear item')
    if (!err) err = checkItemInList(list, item._id)
    if (err) return res.send(err.status).send(err)
    const updatedList = await removeItemFromList(list, item._id).catch(err => res.status(err.status).send(err))
    const deletedItem = await ItemsController.delete(item._id).catch(err => res.status(err.status).send(err))
    SocketsUtils.itemRemoved(updatedList._id, deletedItem._id)
    return res.status(200).send({ id: deletedItem._id })
  }

  const removeItemFromList = (list, itemId) => {
    return new Promise((resolve, reject) => {
      _.pull(list.items, itemId)
      list.save((err, list) => {
        if (err) reject(errors.databaseAccess(err))
        else resolve(list)
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
