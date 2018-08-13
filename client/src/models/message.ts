import User from '@/models/user'
import Seen, { SeenDTO } from '@/models/seen'

export interface MessageDTO {
  from: string;
  to: string;
  msg: string;
  sent: Date;
  seen: SeenDTO[];
}

export default class Message {
  from: User;
  to: User;
  msg: string;
  sent: Date;
  seen: Seen[];
  constructor(from: User, to: User, msg: string, sent: Date, seen?: Seen[]) {
    this.from = from;
    this.to = to;
    this.msg = msg;
    this.sent =sent;
    this.seen = !seen ? [] : seen;
  }
}