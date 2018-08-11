import Mongoose from 'mongoose';
import {UserModel, UserDTO} from './user';
import {SeenModel, SeenDTO} from './seen';

export type MessageModel = Mongoose.Document & {
	from: UserModel;
	to: UserModel;
	msg: string;
	sent: Date;
	seen: SeenModel[];
};

export interface MessageDTO {
	from: UserDTO;
	to: UserDTO;
	msg: string;
	sent: Date;
	seen: SeenDTO[];
}

const Schema = Mongoose.Schema;

const messageSchema = new Schema({
	from: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'user'
	},
	to: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	msg: {
		type: String,
		maxlength: 1024,
		required: true
	},
	sent: {
		type: Date,
		required: true,
	},
	seen: [{
		type: Schema.Types.ObjectId,
		ref: 'seen'
	}],
});

export default Mongoose.model('message', messageSchema);
