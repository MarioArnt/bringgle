import Mongoose from 'mongoose';
import {UserModel, UserDTO} from './user';
import {SeenModel, SeenDTO} from './seen';

export type ActionModel = Mongoose.Document & {
	action: string;
	by: UserModel;
	itemName: string;
	oldValue: string;
	newValue: string;
	seen: SeenModel[];
};

export interface ActionDTO {
	action: string;
	by: UserDTO;
	itemName: string;
	oldValue: string;
	newValue: string;
	seen: SeenDTO[];
}

const Schema = Mongoose.Schema;

const actionSchema = new Schema({
	action: {
		type: String,
		maxlength: 4,
		required: true
	},
	by: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'user'
	},
	item: {
		type: String,
		maxlength: 128
	},
	oldValue: {
		type: String,
		maxlength: 128
	},
	newValue: {
		type: String,
		maxlength: 128
	},
	seen: [{
		type: Schema.Types.ObjectId,
		ref: 'seen'
	}]
});

export default Mongoose.model('action', actionSchema);
