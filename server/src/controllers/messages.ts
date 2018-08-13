import SeensController from './seens';
import {MessageModel, MessageDTO} from '../models/message';

export default class MessagesController {
	public static messageBuilder = (msg: MessageModel): MessageDTO => {
		return {
			from: msg.from._id,
			to: msg.to._id,
			msg: msg.msg,
			sent: msg.sent,
			seen: msg.seen.map(see => SeensController.seenBuilder(see))
		};
	};
}
