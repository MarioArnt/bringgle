import User from '@/models/user'

export default class Seen {
	by: User;
	date: Date;
  constructor(by: User, date: Date) {
    this.by = by;
    this.date = date;
  }
}
