import Action, {ActionModel, ActionLazyDTO, ActionEagerDTO} from '../models/action';
import {Request, Response} from 'express';
import SeensController from './seens';
import Errors from '../constants/errors';
import {Document} from 'mongoose';
import UsersController from './users';
import Seen, {SeenEagerDTO, SeenLazyDTO, SeenModel} from '../models/seen';
import User from '../models/user';
import RequestDataHelpers from './helpers/request-data';
import ListsController from './lists';
import {ListModelLazy} from '../models/list';

export default class ActionsController {
	public static actionBuilder = (action: ActionModel, eager = false): ActionLazyDTO | ActionEagerDTO => {
		let seen: any;
		if (eager) {
			seen = action.seen.map(see => SeensController.seenBuilder(see, true) as SeenEagerDTO);
		} else {
			seen = action.seen.map(see => SeensController.seenBuilder(see, false) as SeenLazyDTO);
		}
		return {
			id: action.id,
			code: action.code,
			by: eager ? UsersController.userBuilder(action.by) : action.by._id,
			date: action.date,
			itemName: action.itemName,
			oldValue: action.oldValue,
			newValue: action.newValue,
			seen
		};
	};

	public static save = async (action: Document): Promise<ActionModel> => {
		return new Promise<ActionModel>((resolve, reject) => {
			action.save((err, savedAction: ActionModel) => {
				if (err) {
					return reject(Errors.databaseAccess(err));
				}
				resolve(savedAction);
			});
		});
	};

	public static findById = async (id: string): Promise<ActionModel> => {
		return new Promise<ActionModel>((resolve, reject) => {
			Action.findById(id).populate({
				path: 'seen',
				model: Seen,
				populate: {path: 'by', model: User}
			}).exec((err, action: ActionModel) => {
				if (err) {
					return reject(Errors.databaseAccess(err));
				}
				resolve(action);
			});
		});
	};

	public static markActionAsSeen = (req: Request, res: Response) => {
		const userId: string = req.body.userId;
		const listId: string = req.params.listId;
		const actionId: string = req.params.actionId;
		ActionsController.markEventAsSeen(userId, listId, actionId).then((updatedAction: ActionEagerDTO) => {
			return res.json(updatedAction);
		}).catch(err => {
			return res.status(err.status || 500).send(err);
		});
	};

	private static markEventAsSeen = async (userId: string, listId: string, actionId: string): Promise<ActionEagerDTO> => {
		let err = RequestDataHelpers.checkId(userId, 'user');
		if (!err) {
			err = RequestDataHelpers.checkId(listId, 'list');
		}
		if (!err) {
			err = RequestDataHelpers.checkId(actionId, 'action');
		}
		if (err) {
			return Promise.reject(err);
		}
		const list: ListModelLazy = await ListsController.findById(listId).catch(errFetchingList => Promise.reject(errFetchingList)) as ListModelLazy;
		err = RequestDataHelpers.checkAuthorized(list, userId, 'mark event as seen');
		if (!err) {
			err = RequestDataHelpers.checkActionInHistory(list, actionId);
		}
		if (err) {
			return Promise.reject(err);
		}
		const unseenEvent: ActionModel = await ActionsController.findById(actionId).catch(errFetchingList => Promise.reject(errFetchingList));
		const seenByMe = new Seen({
			by: userId,
			date: Date.now()
		});
		const savedSeen: SeenModel = await SeensController.save(seenByMe).catch(errSavingSeen => Promise.reject(errSavingSeen));
		unseenEvent.seen.push(savedSeen);
		const savedAction = await ActionsController.save(unseenEvent).catch(errSavingAction => Promise.reject(errSavingAction));
		return ActionsController.actionBuilder(savedAction, true) as ActionEagerDTO;
	};

	public static findByIds = async (ids: string[]): Promise<ActionModel[]> => {
		return new Promise<ActionModel[]>((resolve, reject) => {
			Action.find({
				_id: {$in: ids}
			}).populate({
				path: 'seen',
				model: Seen,
				populate: {path: 'by', model: User}
			}).exec((err, actions: ActionModel[]) => {
				if (err) {
					return reject(Errors.databaseAccess(err));
				}
				resolve(actions);
			});
		});
	};
}
