import User from '@/models/user'
import Seen, { SeenDTO } from '@/models/seen'

export interface ActionDTO {
	id: string;
  code: string;
	by: string;
	date: Date;
	itemName: string;
	oldValue: string;
	newValue: string;
	seen: SeenDTO[];
}

export default class Action {
	id: string;
	code: string;
	by: User;
	date: Date;
	itemName: string;
	oldValue: string;
	newValue: string;
	seen: Seen[];
  constructor(code: string, by: User, date: Date, itemName?: string, oldValue?: string, newValue?: string, seen?: Seen[], id?: string) {
    this.code = code;
    this.by = by;
    this.date = date;
    this.itemName = !itemName ? null : itemName;
    this.oldValue = !oldValue ? null : oldValue;
    this.newValue = !newValue ? null : newValue;
		this.seen = !seen ? [] : seen;
		this.id = !id ? null : id;
  }
}