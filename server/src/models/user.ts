import Mongoose from "mongoose";

export interface IUser {
  email: string;
  name: string;
}

export interface UserDTO extends IUser {
  id: string;
};

export interface UserModel extends IUser, Mongoose.Document {}

const UserSchema = new Mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true}
})

const User = Mongoose.model('user', UserSchema)

export default User
