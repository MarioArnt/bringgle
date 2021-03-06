import logger from '../logger';
import {Request, Response} from 'express';
import SocketsUtils from '../sockets';
import Errors, {ErrorModel} from '../constants/errors';
import Action, {ActionModel, ActionLazyDTO, ActionEagerDTO} from '../models/action';
import User, {UserModel, UserDTO} from '../models/user';
import List, {ListModelLazy, ListModelEager, ListDTO} from '../models/list';
import ListItem, {ItemModel, ItemDTO} from '../models/item';
import UsersController from './users';
import ItemsController from './items';
import Actions from '../constants/actions';
import {Document} from 'mongoose';
import MailsController from '../mails';
import MessagesController from './messages';
import ActionsController from './actions';
import Message, {MessageLazyDTO, MessageEagerDTO} from '../models/message';
import Seen from '../models/seen';
import SeensController from './seens';

export interface CreateJoinResponse {
	listId: string;
	listName: string;
	user: UserDTO;
}

export default class ListsController {
	socketsUtils: SocketsUtils;
	constructor(socketsUtils: SocketsUtils) {
		this.socketsUtils = socketsUtils;
	}
	private static checkId = (id: string, type: string): ErrorModel => {
		if (!id) {
			return Errors.noId(type);
		}
		return null;
	};

	private static checkRequired = (field: string, value: any): ErrorModel => {
		if (!value && value !== 0) {
			return Errors.missingRequiredField(field);
		}
		return null;
	};

	private static checkQuantity = (qty: any): ErrorModel => {
		const quantity = Number(qty);
		if (Number.isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
			return Errors.badQuantity(quantity);
		}
		return null;
	};

	private static checkAuthorized = (list: ListModelLazy, userId: string, action: string): ErrorModel => {
		if (list.attendees.indexOf(userId) < 0) {
			return Errors.notAuthorized(userId, action);
		}
		return null;
	};

	private static checkItemInList = (list: ListModelLazy, itemId: string) => {
		if (list.items.indexOf(itemId) < 0) {
			return Errors.itemNotInList(list._id, itemId);
		}
		return null;
	};

	private static checkValidEmail = (email: string): ErrorModel => {
		const pattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
		if (!email.match(pattern)) {
			return Errors.invalidEmailAddress(email);
		}
		return null;
	};

	private static checkMailNotAlreadyTaken = async (listId: string, userEmail: string): Promise<ErrorModel> => {
		return new Promise<ErrorModel>((resolve, reject) => {
			ListsController.findById(listId, true).then((list: ListModelEager) => {
				if (list.attendees.some(att => att.email === userEmail)) {
					const user: UserModel = list.attendees.find(att => att.email === userEmail);
					MailsController.recoverSession(list._id, list.title, user._id, user.name, userEmail);
					return resolve(Errors.emailAlreadyTaken(userEmail, list.title));
				}
				return resolve(null);
			}, err => {
				return reject(err);
			});
		});
	};

	public createList = (req: Request, res: Response): Response => {
		const listName = req.body.title;
		const userName = req.body.owner ? req.body.owner.name : null;
		const userEmail = req.body.owner ? req.body.owner.email : null;
		const userId = req.body.owner ? req.body.owner.id : null;
		const err = ListsController.checkRequired('listName', listName);
		if (err) {
			return res.status(err.status || 500).json(err);
		}
		if (!userId) {
			this.createUserAndList(listName, userName, userEmail).then(createdList => {
				MailsController.sendListCreated(createdList.listId, createdList.listName, createdList.user.name, createdList.user.email);
				return res.json(createdList);
			}, errCreation => {
				return res.status(errCreation.status || 500).json(errCreation);
			});
		} else {
			UsersController.findById(userId).then((user: UserModel) => {
				this.createListRequest(listName, user).then(createdList => {
					MailsController.sendListCreated(createdList.listId, createdList.listName, createdList.user.name, createdList.user.email);
					return res.json(createdList);
				}, errCreation => {
					return res.status(errCreation.status || 500).json(errCreation);
				});
			}, errFindUser => {
				if (errFindUser.code === Errors.code.RESOURCE_NOT_FOUND) {
					this.createUserAndList(listName, userName, userEmail).then(createdList => {
						MailsController.sendListCreated(createdList.listId, createdList.listName, createdList.user.name, createdList.user.email);
						return res.json(createdList);
					}, errCreation => {
						return res.status(errCreation.status || 500).json(errCreation);
					});
				} else {
					logger.error(errFindUser);
					return res.status(errFindUser.status || 500).json(errFindUser);
				}
			});
		}
	};

	private createUserAndList = async (listName: string, userName: string, userEmail: string): Promise<CreateJoinResponse> => {
		let err = ListsController.checkRequired('displayName', userName);
		if (!err) {
			err = ListsController.checkRequired('userEmail', userEmail);
		}
		if (err) {
			return Promise.reject(err);
		}
		const owner = new User({
			name: userName,
			email: userEmail
		});
		const user = await UsersController.save(owner).catch(errSaving => Promise.reject(errSaving)) as UserModel;
		return this.createListRequest(listName, user);
	};

	private createListRequest = async (name: string, owner: UserModel): Promise<CreateJoinResponse> => {
		const listCreated = new Action({
			code: Actions.CREATED_LIST.code,
			by: owner,
			date: Date.now(),
			seen: []
		});
		const savedAction: ActionModel = await ActionsController.save(listCreated).catch(err => Promise.reject(err));
		const list = new List({
			title: name,
			owner,
			attendees: [owner],
			items: [],
			history: [savedAction],
			messages: []
		});
		const savedList: ListModelLazy = await ListsController.save(list).catch(err => Promise.reject(err));
		return {
			listId: savedList._id,
			listName: savedList.title,
			user: UsersController.userBuilder(owner)
		};
	};

	public joinList = (req: Request, res: Response): Response => {
		const listId: string = req.params.id;
		const userName: string = req.body.name;
		const userEmail: string = req.body.email;
		const userId: string = req.body.id;
		const err: ErrorModel = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list_id');
		if (err) {
			return res.status(err.status || 500).send(err);
		}
		if (!userId) {
			this.createUserAndJoinListRequest(listId, userName, userEmail).then(data => {
				this.socketsUtils.joinList(data.listId, data.user);
				MailsController.joinedList(data.listId, data.listName, data.user.email, data.user.name);
				return res.status(200).json(data);
			}).catch(errJoin => {
				return res.status(errJoin.status || 500).send(errJoin);
			});
		} else {
			UsersController.findById(req.body.id).then(user => {
				this.addAttendeeToList(listId, user as UserModel).then(data => {
					this.socketsUtils.joinList(data.listId, data.user);
					MailsController.joinedList(data.listId, data.listName, data.user.email, data.user.name);
					return res.status(200).json(data);
				}).catch(errJoin => {
					return res.status(errJoin.status || 500).send(errJoin);
				});
			}, errFind => {
				if (errFind.code === Errors.code.RESOURCE_NOT_FOUND) {
					this.createUserAndJoinListRequest(listId, userName, userEmail).then(data => {
						this.socketsUtils.joinList(data.listId, data.user);
						MailsController.joinedList(data.listId, data.listName, data.user.email, data.user.name);
						return res.status(200).json(data);
					}).catch(errJoin => {
						return res.status(errJoin.status || 500).send(errJoin);
					});
				} else {
					logger.error(errFind);
					return res.status(errFind.status || 500).send(errFind);
				}
			});
		}
	};

	private createUserAndJoinListRequest = async (listId: string, userName: string, userEmail: string): Promise<CreateJoinResponse> => {
		return new Promise<CreateJoinResponse>((resolve, reject) => {
			let err: ErrorModel = ListsController.checkRequired('displayName', userName);
			if (!err) {
				err = ListsController.checkRequired('userEmail', userEmail);
			}
			if (err) {
				return reject(err);
			}
			ListsController.checkMailNotAlreadyTaken(listId, userEmail).then((emailAlreadyTaken: ErrorModel) => {
				if (emailAlreadyTaken) {
					return reject(emailAlreadyTaken);
				}
				const attendee = new User({
					name: userName,
					email: userEmail
				});
				UsersController.save(attendee).then((user: UserModel) => {
					return resolve(this.addAttendeeToList(listId, user));
				}, errSave => {
					return reject(errSave);
				});
			}, errAnalyse => {
				return reject(errAnalyse);
			});
		});
	};

	private addAttendeeToList = async (listId: string, user: UserModel): Promise<CreateJoinResponse> => {
		const list = (await ListsController.findById(listId).catch(err => Promise.reject(err))) as ListModelLazy;
		if (list.attendees.indexOf(user._id) >= 0) {
			return Promise.reject(Errors.userAlreadyInList(list._id, user._id));
		}
		const joinedList = new Action({
			code: Actions.JOINED_LIST.code,
			by: user,
			date: Date.now(),
			seen: []
		});
		const joinAction: ActionModel = await ActionsController.save(joinedList).catch(err => {
			return Promise.reject(err);
		});
		list.attendees.push(user._id);
		list.history.push(joinAction._id);
		const savedList: ListModelLazy = await ListsController.save(list).catch(err => {
			logger.error(err);
			return Promise.reject(err);
		});
		this.socketsUtils.emitAction(list._id, ActionsController.actionBuilder(joinAction, true) as ActionEagerDTO);
		return {
			listId: savedList._id,
			listName: savedList.title,
			user: UsersController.userBuilder(user)
		};
	};

	public static findById = async (id: string, eager = false): Promise<ListModelLazy | ListModelEager> => {
		return new Promise<ListModelLazy | ListModelEager>((resolve, reject) => {
			const callback = (err: any, list: ListModelLazy | ListModelEager) => {
				if (err) {
					reject(Errors.databaseAccess(err));
				} else if (!list) {
					reject(Errors.ressourceNotFound({type: 'list', id}));
				} else {
					resolve(list);
				}
			};
			if (eager) {
				return List.findById(id)
					.populate({path: 'owner', model: User})
					.populate({path: 'attendees', model: User})
					.populate({
						path: 'items',
						model: ListItem,
					})
					.populate({
						path: 'history',
						model: Action,
						populate: {path: 'seen', model: Seen}
					})
					.populate({
						path: 'messages',
						model: Message,
						populate: {path: 'seen', model: Seen}
					})
					.exec(callback);
			}
			return List.findById(id, callback);
		});
	};

	private static uncastFalsyRequestParamter = (param: string): string => {
		if (param === 'undefined') {
			return null;
		}
		if (param === 'null') {
			return null;
		}
		return param;
	};

	public getList = (req: Request, res: Response): Response => {
		const listId: string = req.params.id;
		const userId: string = req.query.userId;
		let err: ErrorModel = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list');
		if (!err) {
			err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(userId), 'user');
		}
		if (err) {
			return res.status(err.status || 500).send(err);
		}
		this.fetchListData(listId, userId).then(data => {
			return res.json(data);
		}, errFetch => {
			return res.status(errFetch.status || 500).send(errFetch);
		});
	};

	private fetchListData = async (id: string, userId: string): Promise<ListDTO> => {
		const list: ListModelEager = await ListsController.findById(id, true).catch(err => Promise.reject(err)) as ListModelEager;
		if (!list.attendees.some(att => att.id === userId)) {
			return Promise.reject(Errors.notAuthorized(userId, 'get list'));
		}
		return ListsController.listBuilder(list);
	};

	public static listBuilder = (list: ListModelEager): ListDTO => {
		return {
			id: list._id,
			title: list.title,
			description: list.description,
			owner: UsersController.userBuilder(list.owner),
			attendees: list.attendees.map(att => UsersController.userBuilder(att)),
			items: list.items.map(it => ItemsController.itemBuilder(it)),
			messages: list.messages.map(msg => MessagesController.messageBuilder(msg) as MessageLazyDTO),
			history: list.history.map(action => ActionsController.actionBuilder(action) as ActionLazyDTO),
			created: list.created
		};
	};

	public addItem = (req: Request, res: Response): Response => {
		const listId: string = req.params.id;
		let err: ErrorModel = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list_id');
		if (!err) {
			err = ListsController.checkRequired('name', req.body.name);
		}
		if (!err) {
			err = ListsController.checkRequired('author', req.body.author);
		}
		if (!err) {
			err = ListsController.checkRequired('quantity', req.body.quantity);
		}
		if (!err) {
			err = ListsController.checkQuantity(req.body.quantity);
		}
		if (err) {
			return res.status(err.status || 500).send(err);
		}
		this.addItemRequest(req.params.id, req.body.author, req.body.quantity, req.body.name).then(item => {
			this.socketsUtils.itemAdded(listId, ItemsController.itemBuilder(item));
			return res.status(200).send(ItemsController.itemBuilder(item));
		}, errAdd => {
			return res.status(errAdd.status || 500).send(errAdd);
		});
	};

	private addItemRequest = async (listId: string, authorId: string, quantity: number, name: string): Promise<ItemModel> => {
		const list = await ListsController.findById(listId).catch(errList => Promise.reject(errList)) as ListModelLazy;
		const author = await UsersController.findById(authorId).catch(errUser => Promise.reject(errUser)) as UserModel;
		const err: ErrorModel = ListsController.checkAuthorized(list, author._id, 'add item');

		if (err) {
			return Promise.reject(err);
		}
		const item = new ListItem({
			quantity,
			name,
			author,
			responsible: new Map<number, UserModel>()
		});
		const itemAdded = new Action({
			code: Actions.ADDED_ITEM.code,
			by: author,
			itemName: name,
			date: Date.now()
		});
		const savedAction = await ActionsController.save(itemAdded).catch(errItem => Promise.reject(errItem));
		const savedItem = await ItemsController.save(item).catch(errItem => Promise.reject(errItem)) as ItemModel;
		this.socketsUtils.emitAction(list._id, ActionsController.actionBuilder(savedAction, true) as ActionEagerDTO);
		return this.addItemToList(list, savedItem, savedAction).catch(errSave => Promise.reject(errSave));
	};

	private addItemToList = async (list: ListModelLazy, item: ItemModel, addAction: ActionModel): Promise<ItemModel> => {
		return new Promise<ItemModel>((resolve, reject) => {
			list.history.push(addAction._id);
			list.items.push(item._id);
			list.save(err => {
				if (err) {
					reject(Errors.databaseAccess(err));
				} else {
					resolve(item);
				}
			});
		});
	};

	public updateItem = (req: Request, res: Response): Response => {
		const listId: string = req.params.listId;
		const itemId: string = req.params.itemId;
		const payload: any = req.body;
		let err: ErrorModel = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list');
		if (!err) {
			err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(itemId), 'item');
		}
		if (!err) {
			err = ListsController.checkId(payload.userId, 'user');
		}
		if (!err) {
			err = ListsController.checkRequired('action', payload.action);
		}
		if (err) {
			return res.status(err.status).send(err);
		}
		this.updateItemRequest(listId, itemId, payload).then(data => {
			this.socketsUtils.itemUpdated(listId, data);
			return res.status(200).json(data);
		}, errUpdate => {
			return res.status(errUpdate.status || 500).send(errUpdate);
		});
	};

	private updateItemRequest = async (listId: string, itemId: string, payload: any): Promise<ItemDTO> => {
		const list = await ListsController.findById(listId).catch(errList => Promise.reject(errList)) as ListModelLazy;
		const item = await ItemsController.findById(itemId).catch(errItem => Promise.reject(errItem)) as ItemModel;
		const user = await UsersController.findById(payload.userId).catch(errUser => Promise.reject(errUser)) as UserModel;
		let err = ListsController.checkAuthorized(list, user._id, 'update item');
		if (!err) {
			err = ListsController.checkItemInList(list, item._id);
		}
		if (err) {
			return Promise.reject(err);
		}
		switch (payload.action) {
			case Actions.BRING_ITEM.code:
				return this.bringItem(item, payload.sub, user);
			case Actions.CLEAR_ITEM.code:
				return this.clearItem(item, payload.sub);
			case Actions.UPDATE_QUANTITY_AND_NAME.code:
				return this.updateQuantityAndName(list, user, item, payload.newName, payload.newQuantity);
			default:
				return Promise.reject(Errors.invalidAction(payload.action));
		}
	};

	private updateQuantityAndName = async (list: ListModelLazy, user: UserModel, item: ItemModel, newName: string, newQuantity: any): Promise<ItemDTO> => {
		let err = ListsController.checkRequired('name', newName);
		if (!err) {
			err = ListsController.checkQuantity(newQuantity);
		}
		if (err) {
			return Promise.reject(err);
		}
		const nameHasChanged: boolean = newName !== item.name;
		const oldName: string = item.name;
		const quantityHasChanged: boolean = newQuantity !== item.quantity;
		const oldQuantity: number = item.quantity;
		item.name = newName;
		item.quantity = newQuantity;
		if (item.responsible.size > newQuantity) {
			logger.debug('Responsible size higher than quantity');
			logger.debug(JSON.stringify(item.responsible));
			const toDelete = item.responsible.size - newQuantity;
			logger.debug('removing items: ' + toDelete);
			const keys = [...item.responsible.keys()].map(k => Number(k)).sort((a, b) => a - b);
			for (let i = 0; i < toDelete; ++i) {
				item.responsible.delete(keys[i].toString());
			}
			logger.debug(JSON.stringify(item.responsible));
		}
		const savedItem = await ItemsController.save(item, true).catch(errUpdate => Promise.reject(errUpdate)) as ItemDTO;
		if (nameHasChanged) {
			await this.createNameHasChangedAction(list, user, oldName, newName);
		}
		if (quantityHasChanged) {
			await this.createQuantityHasChangedAction(list, user, oldQuantity, newQuantity, item.name);
		}
		await ListsController.save(list).catch(errUpdate => Promise.reject(errUpdate));
		return savedItem;
	};

	private createNameHasChangedAction = async (list: ListModelLazy, author: UserModel, oldName: string, newName: string): Promise<void> => {
		const changeName = new Action({
			code: Actions.UPDATED_ITEM_NAME.code,
			by: author,
			oldValue: oldName,
			newValue: newName,
			date: Date.now()
		});
		const savedAction = await ActionsController.save(changeName).catch(errItem => Promise.reject(errItem));
		list.history.push(savedAction._id);
		this.socketsUtils.emitAction(list._id, ActionsController.actionBuilder(savedAction, true) as ActionEagerDTO);
		return Promise.resolve();
	};

	private createQuantityHasChangedAction = async (list: ListModelLazy, author: UserModel, oldQuantity: number, newQuantity: number, itemName: string): Promise<void> => {
		const changeName = new Action({
			code: Actions.UPDATED_ITEM_QUANTITY.code,
			by: author,
			itemName,
			oldValue: oldQuantity,
			newValue: newQuantity,
			date: Date.now()
		});
		const savedAction = await ActionsController.save(changeName).catch(errItem => Promise.reject(errItem));
		list.history.push(savedAction._id);
		this.socketsUtils.emitAction(list._id, ActionsController.actionBuilder(savedAction, true) as ActionEagerDTO);
		return Promise.resolve();
	};

	private bringItem = async (item: ItemModel, sub: number, user: UserModel): Promise<ItemDTO> => {
		const err: ErrorModel = ListsController.checkRequired('sub-item', sub);
		if (err) {
			return Promise.reject(err);
		}
		if (item.responsible.get(sub.toString())) {
			return Promise.reject(Errors.itemAlreadyBrought(ItemsController.itemBuilder(item)));
		}
		item.responsible.set(sub.toString(), user);
		return await ItemsController.save(item, true).catch(errUpdate => Promise.reject(errUpdate)) as ItemDTO;
	};

	private clearItem = async (item: ItemModel, sub: number): Promise<ItemDTO> => {
		const err = ListsController.checkRequired('sub-item', sub);
		if (err) {
			return Promise.reject(err);
		}
		if (!item.responsible.get(sub.toString())) {
			return Promise.reject(Errors.itemAlreadyCleared(ItemsController.itemBuilder(item)));
		}
		item.responsible.delete(sub.toString());
		return await ItemsController.save(item, true).catch(errUpdate => Promise.reject(errUpdate)) as ItemDTO;
	};

	public removeItem = (req: Request, res: Response): Response => {
		const listId: string = req.params.listId;
		const itemId: string = req.params.itemId;
		const userId: string = req.query.userId;
		let err: ErrorModel = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list');
		if (!err) {
			err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(itemId), 'item');
		}
		if (!err) {
			err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(userId), 'user');
		}
		if (err) {
			return res.status(err.status || 500).send(err);
		}
		this.deleteItem(listId, itemId, userId).then(deletedItem => {
			this.socketsUtils.itemRemoved(listId, deletedItem._id);
			return res.status(200).send({id: deletedItem._id});
		}, errDelete => {
			return res.status(errDelete.status || 500).send(errDelete);
		});
	};

	private deleteItem = async (listId: string, itemId: string, userId: string): Promise<ItemModel> => {
		const list = await ListsController.findById(listId).catch(errList => Promise.reject(errList)) as ListModelLazy;
		const item = await ItemsController.findById(itemId).catch(errItem => Promise.reject(errItem)) as ItemModel;
		const user = await UsersController.findById(userId).catch(errUser => Promise.reject(errUser)) as UserModel;
		let err = ListsController.checkAuthorized(list, user._id, 'delete item');
		if (!err) {
			err = ListsController.checkItemInList(list, item._id);
		}
		if (err) {
			return Promise.reject(err);
		}
		await this.removeItemFromList(list, item).catch(errRemove => Promise.reject(errRemove));
		const deletedItem = await ItemsController.delete(item._id).catch(errRemove => Promise.reject(errRemove)) as ItemModel;
		const removeItem = new Action({
			code: Actions.REMOVED_ITEM.code,
			by: user,
			itemName: item.name,
			date: Date.now()
		});
		const savedAction = await ActionsController.save(removeItem).catch(errItem => Promise.reject(errItem));
		list.history.push(savedAction._id);
		await ListsController.save(list).catch(errUpdate => Promise.reject(errUpdate));
		this.socketsUtils.emitAction(listId, ActionsController.actionBuilder(savedAction, true) as ActionEagerDTO);
		return deletedItem;
	};

	private removeItemFromList = async (list: ListModelLazy, item: ItemModel): Promise<void> => {
		return new Promise<void>((resolve, reject) => {
			list.update({$pull: {items: item._id}}, err => {
				if (err) {
					return reject(Errors.databaseAccess(err));
				}
				return resolve();
			});
		});
	};

	public static save = (list: Document): Promise<ListModelLazy> => {
		return new Promise<ListModelLazy>((resolve, reject) => {
			list.save((err, savedList: ListModelLazy) => {
				if (err) {
					reject(Errors.databaseAccess(err));
				}
				resolve(savedList);
			});
		});
	};

	public invite = (req: Request, res: Response): Response => {
		let err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(req.params.id), 'list');
		if (!err) {
			err = ListsController.checkRequired('email', req.body.email);
		}
		if (!err) {
			err = ListsController.checkValidEmail(req.body.email);
		}
		if (!err) {
			err = ListsController.checkId(req.body.userId, 'user');
		}
		if (err) {
			return res.status(err.status).send(err);
		}
		this.inviteUser(req.params.id, req.body.userId, req.body.email).then((action: ActionEagerDTO) => {
			this.socketsUtils.emitAction(req.params.id, action);
			return res.status(200).send(req.body.email);
		}, errInvite => {
			return res.status(errInvite.status).send(errInvite);
		});
	};

	private inviteUser = async (listId: string, userId: string, email: string): Promise<ActionEagerDTO> => {
		const list = await ListsController.findById(listId).catch(err => Promise.reject(err)) as ListModelLazy;
		const user = await UsersController.findById(userId).catch(err => Promise.reject(err)) as UserModel;
		const unathorized = ListsController.checkAuthorized(list, user._id, 'invite attendee');
		if (unathorized) {
			return Promise.reject(unathorized);
		}
		await MailsController.invite(list._id, list.title, email, user.name).catch(err => Promise.reject(err));
		const action = await this.createUserInvitedAction(list, user, email).catch(err => Promise.reject(err));
		return ActionsController.actionBuilder(action, true) as ActionEagerDTO;
	};

	private createUserInvitedAction = async (list: ListModelLazy, user: UserModel, email: string): Promise<ActionModel> => {
		const pattern = /^(.+)@/;
		const userInvited = new Action({
			code: Actions.INVITED_USER.code,
			by: user,
			newValue: !email.match(pattern) ? null : email.match(pattern)[1],
			date: Date.now()
		});
		const savedAction = await ActionsController.save(userInvited).catch(errItem => Promise.reject(errItem));
		list.history.push(savedAction._id);
		await ListsController.save(list).catch(errUpdate => Promise.reject(errUpdate));
		return savedAction;
	};

	public sendMessage = (req: Request, res: Response): Response => {
		const listId = req.params.id;
		const userId = req.body.userId;
		let err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list');
		if (!err) {
			err = ListsController.checkId(userId, 'user');
		}
		if (err) {
			return res.status(err.status).send(err);
		}
		this.saveMessage(listId, userId, req.body.content).then(savedMessage => {
			this.socketsUtils.messageSent(listId, MessagesController.messageBuilder(savedMessage, true) as MessageEagerDTO);
			return res.status(200).send(savedMessage);
		}, errSavingMessage => {
			return res.status(errSavingMessage.status).send(errSavingMessage);
		});

	};
	private saveMessage = async (listId: string, from: string, content: string) => {
		const list: ListModelLazy = await ListsController.findById(listId).catch(err => Promise.reject(err)) as ListModelLazy;
		const user: UserModel = await UsersController.findById(from).catch(err => Promise.reject(err)) as UserModel;
		const unathorized = ListsController.checkAuthorized(list, from, 'send message');
		if (unathorized) {
			return Promise.reject(unathorized);
		}
		const created = Date.now();
		const seenByPoster = new Seen({
			by: from,
			date: created,
		});
		const savedSeen = await SeensController.save(seenByPoster).catch(err => Promise.reject(err));
		const message = new Message({
			from: user,
			msg: content,
			sent: created,
			seen: [savedSeen]
		});
		const savedMessage = await MessagesController.save(message).catch(err => Promise.reject(err));
		list.messages.push(savedMessage._id);
		await ListsController.save(list).catch(err => Promise.reject(err));
		return savedMessage;
	};
}
