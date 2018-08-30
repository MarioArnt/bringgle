import User from '@/models/user'
import Seen, { SeenDTO } from '@/models/seen'

export interface MessageDTO {
  id: string;
  from: string;
  to: string;
  msg: string;
  sent: Date;
  seen: SeenDTO[];
}

export default class Message {
  id: string;
  from: User;
  to: User;
  msg: string;
  sent: Date;
  seen: Seen[];
  constructor(from: User, to: User, msg: string, sent: Date, seen?: Seen[], id?: string) {
    this.id = !id ? null : id;
    this.from = from;
    this.to = to;
    this.msg = msg;
    this.sent =sent;
    this.seen = !seen ? [] : seen;
  }
}