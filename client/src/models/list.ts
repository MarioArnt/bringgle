import User from '@/models/user'
import Item, { ItemDTO } from '@/models/item'
import Action, { ActionDTO } from '@/models/action'
import Message, { MessageDTO } from '@/models/message'

export interface ListDTO {
  id: string;
  title: string;
  owner: User;
  attendees: User[];
  items: ItemDTO[];
  history: ActionDTO[];
  messages: MessageDTO[];
}

export default class List {
  id: string;
  title: string;
  owner: User;
  attendees: User[];
  items: Item[];
  history: Action[];
  messages: Message[];
  constructor (title?: string, owner?: User, attendees?: User[], items?: Item[], id?: string) {
    this.id = '';
    this.title = '';
    this.owner = new User();
    this.attendees = [];
    this.items = [];
    this.history = [];
    this.messages = [];
    if (title) this.title = title;
    if (owner) this.owner = owner;
    if (attendees) this.attendees = attendees;
    if (items) this.items = items;
    if (id) this.id = id;
  }
}