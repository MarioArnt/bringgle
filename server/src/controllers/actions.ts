import {ActionModel, ActionDTO} from '../models/action';
import UsersController from './users';
import SeensController from './seens';

export default class ActionsController {
	public static actionBuilder = (action: ActionModel): ActionDTO => {
		return {
			action: action.action,
			by: UsersController.userBuilder(action.by),
			itemName: action.itemName,
			oldValue: action.oldValue,
			newValue: action.newValue,
			seen: action.seen.map(see => SeensController.seenBuilder(see))
		};
	};
}
