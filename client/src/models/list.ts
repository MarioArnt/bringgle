import User from '@/models/user'
import Item from '@/models/item'

export default class List {
  id: string;
  title: string;
  owner: User;
  attendees: User[];
  items: Item[];
  constructor (title?: string, owner?: User, attendees?: User[], items?: Item[], id?: string) {
    this.id = ''
    this.title = ''
    this.owner = new User()
    this.attendees = []
    this.items = []
    if (title) this.title = title
    if (owner) this.owner = owner
    if (attendees) this.attendees = attendees
    if (items) this.items = items
    if (id) this.id = id
  }
}