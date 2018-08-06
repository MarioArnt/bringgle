import Mongoose from "mongoose";
import { UserModel, UserDTO } from "./user"

export type ItemModel = Mongoose.Document & {
  name: string,
  quantity: number,
  author: UserModel,
  responsible: Map<string, UserModel>,
  created: Date
};

export type ItemDTO = {
  id: string,
  name: string,
  quantity: number,
  author: UserDTO,
  responsible: any,
  created: Date
}

const Schema = Mongoose.Schema

const ListItemSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    validate: function (v: any) {
      return (!Number.isNaN(v) && Number.isInteger(v) && v > 0 && v < 100)
    }
  },
  author: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user'
  },
  responsible: {
    type: Map,
    of: {
      type: Schema.Types.ObjectId,
      ref: 'user'
    }
  },
  created: Date
})

const Item = Mongoose.model('item', ListItemSchema)

export default Item
