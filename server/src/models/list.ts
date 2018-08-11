import Mongoose from 'mongoose';
import {UserModel, UserDTO} from './user';
import {ItemModel, ItemDTO} from './item';
import {MessageModel, MessageDTO} from './message';
import {ActionModel, ActionDTO} from './action';

export type ListModelEager = Mongoose.Document & {
	title: string;
	description: string;
	owner: UserModel;
	attendees: UserModel[];
	items: ItemModel[];
	messages: MessageModel[];
	history: ActionModel[];
	created: Date;
};

export interface ListDTO {
	id: string;
	title: string;
	description: string;
	owner: UserDTO;
	attendees: UserDTO[];
	items: ItemDTO[];
	messages: MessageDTO[];
	history: ActionDTO[];
	created: Date;
}

export type ListModelLazy = Mongoose.Document & {
	title: string;
	description: string;
	owner: string;
	attendees: string[];
	items: string[];
	messages: string[];
	history: string[];
	created: Date;
};

const Schema = Mongoose.Schema;

const listSchema = new Schema({
	title: {
		type: String,
		required: true,
		maxlength: 25
	},
	description: {
		type: String,
		maxlength: 16384
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'user',
		required: true
	},
	attendees: [{
		type: Schema.Types.ObjectId,
		ref: 'user'
	}],
	items: [{
		type: Schema.Types.ObjectId,
		ref: 'item'
	}],
	history: [{
		type: Schema.Types.ObjectId,
		ref: 'action'
	}],
	messages: [{
		type: Schema.Types.ObjectId,
		ref: 'message'
	}],
	created: Date
});

export default Mongoose.model('list', listSchema);
