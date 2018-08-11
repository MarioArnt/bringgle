import UsersController from './users';
import SeensController from './seens';
import {MessageModel, MessageDTO} from '../models/message';

export default class MessagesController {
	public static messageBuilder = (msg: MessageModel): MessageDTO => {
		return {
			from: UsersController.userBuilder(msg.from),
			to: UsersController.userBuilder(msg.to),
			msg: msg.msg,
			sent: msg.sent,
			seen: msg.seen.map(see => SeensController.seenBuilder(see))
		};
	};
}
