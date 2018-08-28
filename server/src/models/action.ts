import Mongoose from 'mongoose';
import {UserModel, UserDTO} from './user';
import {SeenModel, SeenLazyDTO, SeenEagerDTO} from './seen';

export type ActionModel = Mongoose.Document & {
	code: string;
	by: UserModel;
	date: Date;
	itemName: string;
	oldValue: string;
	newValue: string;
	seen: SeenModel[];
};

export interface ActionLazyDTO {
	id: string;
	code: string;
	by: string;
	date: Date;
	itemName: string;
	oldValue: string;
	newValue: string;
	seen: SeenLazyDTO[];
}

export interface ActionEagerDTO {
	id: string;
	code: string;
	by: UserDTO;
	date: Date;
	itemName: string;
	oldValue: string;
	newValue: string;
	seen: SeenEagerDTO[];
}

const Schema = Mongoose.Schema;

const actionSchema = new Schema({
	code: {
		type: String,
		maxlength: 4,
		required: true
	},
	by: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'user'
	},
	date: {
		type: Date,
		requireed: true
	},
	itemName: {
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
