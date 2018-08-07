import Mongoose from 'mongoose';

export interface IUser {
	email: string;
	name: string;
}

export interface UserDTO extends IUser {
	id: string;
}

export interface UserModel extends IUser, Mongoose.Document {}

const userSchema = new Mongoose.Schema({
	name: {type: String, required: true},
	email: {type: String, required: true}
});

export default Mongoose.model('user', userSchema);
