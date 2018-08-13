import {ActionModel, ActionDTO} from '../models/action';
import SeensController from './seens';
import Errors from '../constants/errors';
import {Document} from 'mongoose';

export default class ActionsController {
	public static actionBuilder = (action: ActionModel): ActionDTO => {
		return {
			id: action.id,
			code: action.code,
			by: action.by._id,
			date: action.date,
			itemName: action.itemName,
			oldValue: action.oldValue,
			newValue: action.newValue,
			seen: action.seen.map(see => SeensController.seenBuilder(see))
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
