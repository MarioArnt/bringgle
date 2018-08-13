import User from '@/models/user'
import Seen, { SeenDTO } from '@/models/seen'

export interface ActionDTO {
  code: string;
	by: string;
	date: Date;
	itemName: string;
	oldValue: string;
	newValue: string;
	seen: SeenDTO[];
}

export default class Action {
	code: string;
	by: User;
	date: Date;
	itemName: string;
	oldValue: string;
	newValue: string;
	seen: Seen[];
  constructor(code: string, by: User, date: Date, itemName?: string, oldValue?: string, newValue?: string, seen?: Seen[]) {
    this.code = code;
    this.by = by;
    this.date = date;
    this.itemName = !itemName ? null : itemName;
    this.oldValue = !oldValue ? null : oldValue;
    this.newValue = !newValue ? null : newValue;
    this.seen = !seen ? [] : seen;
  }
}