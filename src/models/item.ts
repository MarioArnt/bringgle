import User from '@/models/user'

export default class Item {
  id: string;
  quantity: number;
  name: string;
  responsible: Map<number, User>;
  created: Date;
  constructor(quantity?: number, name?: string, responsible?: Map<number, User>, created?: Date, id?: string) {
    this.id = '';
    this.quantity = 1;
    this.name = '';
    this.responsible = new Map<number, User>();
    if (quantity && name) {
      this.quantity = quantity;
      this.name = name;
    }
    if (quantity && name && responsible) this.responsible = responsible;
    if (created) this.created = created
    if (id) this.id = id
  }
}