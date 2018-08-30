import Errors, {ErrorModel} from '../../constants/errors';
import {UserModel} from '../../models/user';
import {ListModelLazy, ListModelEager} from '../../models/list';
import MailsController from '../../mails';
import ListsController from '../lists';

export default class RequestDataHelpers {
	public static checkId = (id: string, type: string): ErrorModel => {
		if (!RequestDataHelpers.uncastFalsyRequestParamter(id)) {
			return Errors.noId(type);
		}
		return null;
	};

	public static checkRequired = (field: string, value: any): ErrorModel => {
		if (!value && value !== 0) {
			return Errors.missingRequiredField(field);
		}
		return null;
	};

	public static checkQuantity = (qty: any): ErrorModel => {
		const quantity = Number(qty);
		if (Number.isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
			return Errors.badQuantity(quantity);
		}
		return null;
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

	public static checkAuthorized = (list: ListModelLazy, userId: string, action: string): ErrorModel => {
		if (list.attendees.indexOf(userId) < 0) {
			return Errors.notAuthorized(userId, action);
		}
		return null;
	};

	public static checkItemInList = (list: ListModelLazy, itemId: string) => {
		if (list.items.indexOf(itemId) < 0) {
			return Errors.itemNotInList(list._id, itemId);
		}
		return null;
	};

	public static checkActionInHistory = (list: ListModelLazy, actionId: string) => {
		if (list.history.indexOf(actionId) < 0) {
			return Errors.actionNotInListHistory(actionId, list.id);
		}
		return null;
	};

	public static checkValidEmail = (email: string): ErrorModel => {
		const pattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
		if (!email.match(pattern)) {
			return Errors.invalidEmailAddress(email);
		}
		return null;
	};

	public static checkMailNotAlreadyTaken = async (listId: string, userEmail: string): Promise<ErrorModel> => {
		return new Promise<ErrorModel>((resolve, reject) => {
			ListsController.findById(listId, true).then((list: ListModelEager) => {
				if (list.attendees.some(att => att.email === userEmail)) {
					const user: UserModel = list.attendees.find(att => att.email === userEmail);
					MailsController.recoverSession(list._id, list.title, user._id, user.name, userEmail);
					return resolve(Errors.emailAlreadyTaken(userEmail, list.title));
				}
				return resolve(null);
			}, (err: ErrorModel) => {
				return reject(err);
			});
		});
	};
}
