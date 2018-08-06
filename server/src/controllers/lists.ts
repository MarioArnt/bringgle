import logger from '../logger'
import { Request, Response } from "express";
import SocketsUtils from '../sockets';
import Errors, { ErrorModel } from '../constants/errors'
import User, { UserModel, UserDTO } from '../models/user'
import List, { ListModelLazy, ListModelEager, ListDTO } from '../models/list'
import ListItem, { ItemModel, ItemDTO } from '../models/item'
import UsersController from './users'
import ItemsController from './items'
import Actions from '../constants/actions'
import { Document } from 'mongoose'

export interface CreateJoinResponse {
  listId: string;
  user: UserDTO;
}

export default class ListsController {
  socketsUtils: SocketsUtils;
  constructor(socketsUtils: SocketsUtils) {
    this.socketsUtils = socketsUtils;
  }
  private static checkId = (id: string, type: string): ErrorModel => {
    if (!id) return Errors.noId(type)
    return null
  }

  private static checkRequired = (field: string, value: any): ErrorModel => {
    if (!value && value !== 0) return Errors.missingRequiredField(field)
    return null
  }

  private static checkQuantity = (qty: any): ErrorModel => {
    const quantity = Number(qty)
    if (Number.isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) return Errors.badQuantity(quantity)
    return null
  }

  private static checkAuthorized = (list: ListModelLazy, userId: string, action: string): ErrorModel => {
    if (list.attendees.indexOf(userId) < 0) return Errors.notAuthorized(userId, action)
    return null
  }

  private static checkItemInList = (list: ListModelLazy, itemId: string) => {
    if (list.items.indexOf(itemId) < 0) return Errors.itemNotInList(list._id, itemId)
    return null
  }

  public static createList = (req: Request, res: Response): Response => {
    const listName = req.body.title
    const userName = req.body.owner ? req.body.owner.name : null
    const userEmail = req.body.owner ? req.body.owner.email : null
    const userId = req.body.owner ? req.body.owner.id : null
    const err = ListsController.checkRequired('listName', listName)
    if (err) return res.status(err.status || 500).json(err)
    if (!userId) {
      ListsController.createUserAndList(listName, userName, userEmail).then((createdList) => {
        return res.json(createdList)
      }, (err) => {
        return res.status(err.status || 500).json(err)
      })
    } else {
      UsersController.findById(userId).then((user: UserModel) => {
        ListsController.createListRequest(listName, user).then((createdList) => {
          return res.json(createdList)
        }, (err) => {
          return res.status(err.status || 500).json(err)
        })
      }, (err) => {
        if (err.code === Errors.code.RESOURCE_NOT_FOUND) {
          ListsController.createUserAndList(listName, userName, userEmail).then((createdList) => {
            return res.json(createdList)
          }, (err) => {
            return res.status(err.status || 500).json(err)
          })
        } else return res.status(err.status || 500).json(err)
      })
    }
  }

  private static createUserAndList = async (listName: string, userName: string, userEmail: string): Promise<CreateJoinResponse> => {
    let err = ListsController.checkRequired('displayName', userName)
    if (!err) err = ListsController.checkRequired('userEmail', userEmail)
    if (err) return Promise.reject(err)
    const owner = new User({
      name: userName,
      email: userEmail
    })
    const user = <UserModel>await UsersController.save(owner).catch(err => Promise.reject(err))
    return ListsController.createListRequest(listName, user)
  }

  private static createListRequest = async (name: string, owner: UserModel): Promise<CreateJoinResponse> => {
    const list = new List({
      title: name,
      owner: owner,
      attendees: [owner]
    })
    const savedList: ListModelLazy = await ListsController.save(list).catch(err => Promise.reject(err))
    return {
      listId: savedList._id,
      user: UsersController.userBuilder(owner)
    }
  }

  public joinList = (req: Request, res: Response): Response => {
    const listId: string = req.params.id
    const userName: string = req.body.name
    const userEmail: string = req.body.email
    const userId: string = req.body.id
    const err: ErrorModel = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list_id')
    if (err) return res.status(err.status || 500).send(err)
    if (!userId) {
      this.createUserAndJoinList(listId, userName, userEmail).then((data) => {
        this.socketsUtils.joinList(data.listId, data.user)
        return res.status(200).json(data)
      }).catch((err) => { return res.status(err.status || 500).send(err) })
    } else {
      UsersController.findById(req.body.id).then((user) => {
        this.addAttendeeToList(listId, <UserModel>user).then((data) => {
          this.socketsUtils.joinList(data.listId, data.user)
          return res.status(200).json(data)
        }).catch((err) => {
          return res.status(err.status || 500).send(err)
        })
      }, (err) => {
        if (err.code === Errors.code.RESOURCE_NOT_FOUND) {
          this.createUserAndJoinList(listId, userName, userEmail).then((data) => {
            this.socketsUtils.joinList(data.listId, data.user)
            return res.status(200).json(data)
          }).catch((err) => {
            return res.status(err.status || 500).send(err)
          })
        } else return res.status(err.status || 500).send(err)
      })
    }
  }

  private createUserAndJoinList = async (listId: string, userName: string, userEmail: string): Promise<CreateJoinResponse> => {
    let err: ErrorModel = ListsController.checkRequired('displayName', userName)
    if (!err) err = ListsController.checkRequired('userEmail', userEmail)
    if (err) return Promise.reject(err)
    const attendee = new User({
      name: userName,
      email: userEmail
    })
    const user: UserDTO|UserModel = await UsersController.save(attendee).catch((err) => Promise.reject(err))
    return this.addAttendeeToList(listId, <UserModel>user)
  }

  private addAttendeeToList = async (listId: string, user: UserModel): Promise<CreateJoinResponse> => {
    const list: ListModelLazy = <ListModelLazy>(await ListsController.findById(listId).catch((err) => Promise.reject(err)))
    if (list.attendees.indexOf(user._id) >= 0) return Promise.reject(Errors.userAlreadyInList(list._id, user._id))
    list.attendees.push(user._id)
    const savedList: ListModelLazy = await ListsController.save(list).catch((err) => {
      logger.error(err)
      return Promise.reject(err)
    })
    return {
      listId: savedList._id,
      user: UsersController.userBuilder(user)
    }
  }

  public static findById = async (id: string, eager: boolean = false): Promise<ListModelLazy|ListModelEager> => {
    return new Promise<ListModelLazy|ListModelEager>((resolve, reject) => {
      const callback = (err: any, list: ListModelLazy|ListModelEager) => {
        if (err) reject(Errors.databaseAccess(err))
        else if (list == null) reject(Errors.ressourceNotFound({type: 'list', id}))
        else resolve(list)
      }
      if (eager) {
        return List.findById(id).populate('owner').populate('attendees').populate('items').populate({
          path: 'items',
          populate: { path: 'responsible' }
        }).exec(callback)
      } else return List.findById(id, callback)
    })
  }

  private static uncastFalsyRequestParamter = (param: string): string => {
    if (param === 'undefined') return undefined
    if (param === 'null') return null
    return param
  }

  public getList = (req: Request, res: Response): Response => {
    const listId: string = req.params.id
    const userId: string = req.query.userId
    let err: ErrorModel = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list')
    if (!err) err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(userId), 'user')
    if (err) return res.status(err.status || 500).send(err)
    this.fetchListData(listId, userId).then((data) => {
      return res.json(data)
    }, (err) => {
      return res.status(err.status || 500).send(err)
    })
  }

  private fetchListData = async (id: string, userId: string): Promise<ListDTO> => {
    const list: ListModelEager = <ListModelEager> await ListsController.findById(id, true).catch((err) => Promise.reject(err))
    if (!list.attendees.some((att) => att.id === userId)) return Promise.reject(Errors.notAuthorized(userId, 'get list'))
    return ListsController.listBuilder(list)
  }

  public static listBuilder = (list: ListModelEager): ListDTO => {
    return {
      id: list._id,
      title: list.title,
      owner: UsersController.userBuilder(list.owner),
      attendees: list.attendees.map((att) => UsersController.userBuilder(att)),
      items: list.items.map((it) => ItemsController.itemBuilder(it)),
      created: list.created
    }
  }

  public addItem = (req: Request, res: Response): Response => {
    const listId: string = req.params.id;
    let err: ErrorModel = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list_id')
    if (!err) err = ListsController.checkRequired('name', req.body.name)
    if (!err) err = ListsController.checkRequired('author', req.body.author)
    if (!err) err = ListsController.checkRequired('quantity', req.body.quantity)
    if (!err) err = ListsController.checkQuantity(req.body.quantity)
    if (err) return res.status(err.status || 500).send(err)

    this.addItemRequest(req.params.id, req.body.author, req.body.quantity, req.body.name).then((item) => {
      this.socketsUtils.itemAdded(listId, ItemsController.itemBuilder(item))
      return res.status(200).send(ItemsController.itemBuilder(item))
    }, (err) => { return res.status(err.status || 500).send(err) })
  }

  private addItemRequest = async (listId: string, authorId: string, quantity: number, name: string): Promise<ItemModel> => {
    const list: ListModelLazy = <ListModelLazy>await ListsController.findById(listId).catch((err) => Promise.reject(err))
    const author: UserModel = <UserModel>await UsersController.findById(authorId).catch((err) => Promise.reject(err))
    const err: ErrorModel = ListsController.checkAuthorized(list, author._id, 'add item')
    if (err) return Promise.reject(err)
    const item = new ListItem({
      quantity: quantity,
      name: name,
      author: author,
      responsible: new Map<number, UserModel>()
    })
    const savedItem: ItemModel = <ItemModel>await ItemsController.save(item).catch((err) => Promise.reject(err))
    return this.addItemToList(list, savedItem).catch((err) => Promise.reject(err))
  }

  private addItemToList = async (list: ListModelLazy, item: ItemModel): Promise<ItemModel> => {
    return new Promise<ItemModel>((resolve, reject) => {
      list.items.push(item._id)
      list.save((err) => {
        if (err) reject(Errors.databaseAccess(err))
        else resolve(item)
      })
    })
  }

  public updateItem = (req: Request, res: Response): Response => {
    const listId: string = req.params.listId
    const itemId: string = req.params.itemId
    const payload: any = req.body
    let err: ErrorModel = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list')
    if (!err) err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(itemId), 'item')
    if (!err) err = ListsController.checkId(payload.userId, 'user')
    if (!err) err = ListsController.checkRequired('action', payload.action)
    if (err) return res.status(err.status).send(err)
    this.updateItemRequest(listId, itemId, payload).then((data) => {
      this.socketsUtils.itemUpdated(listId, data)
      return res.status(200).json(data)
    }, (err) => { return res.status(err.status || 500).send(err) })
  }

  private updateItemRequest = async (listId: string, itemId: string, payload: any): Promise<ItemDTO> => {
    const list: ListModelLazy = <ListModelLazy>await ListsController.findById(listId).catch(err => Promise.reject(err))
    const item: ItemModel = <ItemModel>await ItemsController.findById(itemId).catch(err => Promise.reject(err))
    const user: UserModel = <UserModel>await UsersController.findById(payload.userId).catch(err => Promise.reject(err))
    let err = ListsController.checkAuthorized(list, user._id, 'update item')
    if (!err) err = ListsController.checkItemInList(list, item._id)
    if (err) return Promise.reject(err)
    switch (payload.action) {
      case Actions.BRING_ITEM.code:
        return this.bringItem(item, payload.sub, user)
      case Actions.CLEAR_ITEM.code:
        return this.clearItem(item, payload.sub)
      case Actions.UPDATE_QUANTITY_AND_NAME.code:
        return this.updateQuantityAndName(item, payload.newName, payload.newQuantity)
      default:
        return Promise.reject(Errors.invalidAction(payload.action))
    }
  }

  private updateQuantityAndName = async (item: ItemModel, newName: string, newQuantity: any): Promise<ItemDTO> => {
    let err = ListsController.checkRequired('name', newName)
    if (!err) err = ListsController.checkQuantity(newQuantity)
    if (err) return Promise.reject(err)
    item.name = newName
    item.quantity = newQuantity
    if (item.responsible.size > newQuantity) {
      logger.debug('Responsible size higher than quantity')
      logger.debug(JSON.stringify(item.responsible))
      const toDelete = item.responsible.size - newQuantity
      logger.debug('removing items: ' + toDelete)
      const keys = [...item.responsible.keys()].map((k) => Number(k)).sort((a, b) => a - b)
      for (let i = 0; i < toDelete; ++i) {
        item.responsible.delete(keys[i].toString())
      }
      logger.debug(JSON.stringify(item.responsible))
    }
    const updatedItem = <ItemDTO>await ItemsController.save(item, true).catch((err) => Promise.reject(err))
    return updatedItem
  }

  private bringItem = async (item: ItemModel, sub: number, user: UserModel): Promise<ItemDTO> => {
    const err: ErrorModel = ListsController.checkRequired('sub-item', sub)
    if (err) return Promise.reject(err)
    if (item.responsible.get(sub.toString())) return Promise.reject(Errors.itemAlreadyBrought(item._id))
    item.responsible.set(sub.toString(), user)
    const savedItem = <ItemDTO>await ItemsController.save(item, true).catch((err) => Promise.reject(err))
    return savedItem
  }

  private clearItem = async (item: ItemModel, sub: number): Promise<ItemDTO> => {
    const err = ListsController.checkRequired('sub-item', sub)
    if (err) return Promise.reject(err)
    if (!item.responsible.get(sub.toString())) return Promise.reject(Errors.itemAlreadyCleared(item._id))
    item.responsible.delete(sub.toString())
    const savedItem = <ItemDTO>await ItemsController.save(item, true).catch((err) => Promise.reject(err))
    return savedItem
  }

  public removeItem = (req: Request, res: Response): Response => {
    const listId: string = req.params.listId
    const itemId: string = req.params.itemId
    const userId: string = req.query.userId
    let err: ErrorModel = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list')
    if (!err) err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(itemId), 'item')
    if (!err) err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(userId), 'user')
    if (err) return res.status(err.status || 500).send(err)
    this.deleteItem(listId, itemId, userId).then((deletedItem) => {
      this.socketsUtils.itemRemoved(listId, deletedItem._id)
      return res.status(200).send({ id: deletedItem._id })
    }, (err) => { return res.status(err.status || 500).send(err) })
  }

  private deleteItem = async (listId: string, itemId: string, userId: string): Promise<ItemModel> => {
    const list = <ListModelLazy>await ListsController.findById(listId).catch(err => Promise.reject(err))
    const item = <ItemModel>await ItemsController.findById(itemId).catch(err => Promise.reject(err))
    const user = <UserModel>await UsersController.findById(userId).catch(err => Promise.reject(err))
    let err = ListsController.checkAuthorized(list, user._id, 'delete item')
    if (!err) err = ListsController.checkItemInList(list, item._id)
    if (err) return Promise.reject(err)
    await this.removeItemFromList(list, item).catch(err => Promise.reject(err))
    const deletedItem = <ItemModel>await ItemsController.delete(item._id).catch(err => Promise.reject(err))
    return deletedItem
  }

  private removeItemFromList = async (list: ListModelLazy, item: ItemModel): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      list.update({$pull: { items: item._id }}, (err, list) => {
        if (err) return reject(Errors.databaseAccess(err))
        return resolve()
      })
    })
  }

  public static save = (list: Document): Promise<ListModelLazy> => {
    return new Promise<ListModelLazy>((resolve, reject) => {
      list.save((err, list: ListModelLazy) => {
        if (err) reject(Errors.databaseAccess(err))
        resolve(list)
      })
    })
  }
}
