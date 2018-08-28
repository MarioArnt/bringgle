export default class Errors {
  static readonly code = {
    DB_ACCESS: 'E01',
    RESOURCE_NOT_FOUND: 'E02',
    NO_ID: 'E03',
    BAD_QUANTITY: 'E04',
    MISSING_REQUIRED_FIELD: 'E05',
    NOT_AUTHORIZED: 'E06',
    ITEM_NOT_IN_LIST: 'E07',
    USER_ALREADY_IN_LIST: 'E08',
    INVALID_ACTION: 'E09',
    ITEM_ALREADY_BROUGHT: 'E10',
    ITEM_ALREADY_CLEARED: 'E11',
		EMAIL_NOT_SENT: 'E12',
		INVALID_EMAIL_ADDRESS: 'E13',
		EMAIL_ALREADY_TAKEN: 'E14'
  }
}

export class ToastError {
  private msg: string;
  constructor (msg?: string) {
    if(!msg) this.msg = 'Something wrong happened';
    else this.msg = msg;
  }
}
