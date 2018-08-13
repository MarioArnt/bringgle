import User from '@/models/user'

export interface SeenDTO {
  by: string;
  date: Date;
}

export default class Seen {
	by: User;
	date: Date;
  constructor(by: User, date: Date) {
    this.by = by;
    this.date = date;
  }
}
