import {ActionModel, ActionLazyDTO, ActionEagerDTO} from '../models/action';
import SeensController from './seens';
import Errors from '../constants/errors';
import {Document} from 'mongoose';
import UsersController from './users';
import {SeenEagerDTO, SeenLazyDTO} from '../models/seen';

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
}
