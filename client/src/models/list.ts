import User from '@/models/user'
import Item from '@/models/item'
import Action from '@/models/action'
import Message from '@/models/message'

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