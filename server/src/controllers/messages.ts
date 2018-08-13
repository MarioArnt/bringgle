import SeensController from './seens';
import {MessageModel, MessageLazyDTO, MessageEagerDTO} from '../models/message';
import {Document} from 'mongoose';
import Errors from '../constants/errors';
import UsersController from './users';
import {SeenEagerDTO, SeenLazyDTO} from '../models/seen';

export default class MessagesController {
	public static messageBuilder = (msg: MessageModel, eager = false): MessageLazyDTO | MessageEagerDTO => {
		let seen: any;
		if (eager) {
			seen = msg.seen.map(see => SeensController.seenBuilder(see, true) as SeenEagerDTO);
		} else {
			seen = msg.seen.map(see => SeensController.seenBuilder(see, false) as SeenLazyDTO);
		}
		return {
			from: eager ? UsersController.userBuilder(msg.from) : msg.from._id,
			to: eager ? (!msg.to ? null : UsersController.userBuilder(msg.to)) : (!msg.to ? null : msg.to._id),
			msg: msg.msg,
			sent: msg.sent,
			seen
		};
	};

	public static save = async (msg: Document): Promise<MessageModel> => {
		return new Promise<MessageModel>((resolve, reject) => {
			msg.save((err, savedMessage: MessageModel) => {
				if (err) {
					reject(Errors.databaseAccess(err));
				} else {
					resolve(savedMessage);
				}
			});
		});
	};
}
