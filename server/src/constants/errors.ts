import { ItemModel } from '../models/item'

export class ErrorModel {
  code: string;
  status: number;
  msg: string;
  details: any;
  constructor(code: string, status: number, msg: string, details: any) {
    this.code = code;
    this.status = status;
    this.msg = msg;
    this.details = details;
  }
}

export default class Errors {
  public static readonly code: any = {
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
    ITEM_ALREADY_CLEARED: 'E11'
  }
  
public static databaseAccess = (details: any): ErrorModel => {
  return new ErrorModel(Errors.code.DB_ACCESS, 500, 'Error happened while requesting database', details)
}

public static ressourceNotFound = (details: any): ErrorModel => {
  return {
    code: Errors.code.RESOURCE_NOT_FOUND,
    status: 404,
    msg: `Ressource not found`,
    details
  }
}

public static noId = (type: string): ErrorModel => {
  return {
    code: Errors.code.NO_ID,
    status: 400,
    msg: 'Invalid ID',
    details: { type }
  }
}

public static badQuantity = (qty: any): ErrorModel => {
  const quantity = Number(qty)
  let msg = ''
  if (Number.isNaN(quantity)) msg = 'Quantity is not a number'
  else if (!Number.isInteger(quantity)) msg = 'Quantity is not an integer'
  else if (quantity <= 0) msg = 'Quantity is lower or equal to zero'
  else if (quantity > 99) msg = 'Quantity must be lesser than 99'
  const error: ErrorModel = {
    code: Errors.code.BAD_QUANTITY,
    status: 400,
    msg: 'Invalid quantity',
    details: {details: msg}
  }
  return error
}

public static missingRequiredField = (field: string): ErrorModel => {
  return {
    code: Errors.code.MISSING_REQUIRED_FIELD,
    status: 400,
    msg: 'Missing required field',
    details: {field}
  }
}

public static notAuthorized = (userId: string, action: string): ErrorModel => {
  return {
    code: Errors.code.NOT_AUTHORIZED,
    status: 401,
    msg: 'Not authorized',
    details: {userId, action}
  }
}

public static itemNotInList = (listId: string, itemId: string): ErrorModel => {
  return {
    code: Errors.code.ITEM_NOT_IN_LIST,
    status: 400,
    msg: 'Item not in list',
    details: {listId, itemId}
  }
}

public static userAlreadyInList = (listId: string, userId: string): ErrorModel => {
  return {
    code: Errors.code.USER_ALREADY_IN_LIST,
    status: 400,
    msg: 'User already attend this list',
    details: {listId, userId}
  }
}

public static invalidAction = (action: string): ErrorModel => {
  return {
    code: Errors.code.INVALID_ACTION,
    status: 400,
    msg: 'Invalid action',
    details: action
  }
}

public static itemAlreadyBrought = (item: ItemModel): ErrorModel => {
  return {
    code: Errors.code.ITEM_ALREADY_BROUGHT,
    status: 400,
    msg: 'Item Already Brought',
    details: item
  }
}

public static itemAlreadyCleared = (item: ItemModel): ErrorModel => {
  return {
    code: Errors.code.ITEM_ALREADY_CLEARED,
    status: 400,
    msg: 'Item Already Cleared',
    details: item
  }
}
}