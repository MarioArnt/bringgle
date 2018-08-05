import Mongoose from 'mongoose';
import { UserModel, UserDTO } from './user';
import { ItemModel, ItemDTO } from './item';

export type ListModelEager = Mongoose.Document & {
  title: string,
  owner: UserModel,
  attendees: UserModel[],
  items: ItemModel[],
  created: Date
};

export type ListDTO = {
  id: string,
  title: string,
  owner: UserDTO,
  attendees: UserDTO[],
  items: ItemDTO[],
  created: Date
}

export type ListModelLazy = Mongoose.Document & {
  title: string,
  owner: string,
  attendees: string[],
  items: string[],
  created: Date
};

const Schema = Mongoose.Schema
const ListSchema = new Schema({
  title: {
    type: String,
    required: true
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
  created: Date
})

const List = Mongoose.model('list', ListSchema)
export default List
