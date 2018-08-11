import Mongoose from 'mongoose';
import {UserModel, UserDTO} from './user';

export type SeenModel = Mongoose.Document & {
	by: UserModel;
	date: Date;
};

export interface SeenDTO {
	by: UserDTO;
	date: Date;
}

const Schema = Mongoose.Schema;

const seenSchema = new Schema({
	by: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'user'
	},
	date: {
		required: true,
		type: Date
	},
});

export default Mongoose.model('seen', seenSchema);
