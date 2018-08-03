const errors = {}

errors.code = {
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

errors.databaseAccess = (details) => {
  return {
    code: errors.code.DB_ACCESS,
    status: 500,
    msg: 'Error happened while requesting database',
    details
  }
}

errors.ressourceNotFound = (details) => {
  return {
    code: errors.code.RESOURCE_NOT_FOUND,
    status: 404,
    msg: `Ressource not found`,
    details
  }
}

errors.noId = (type) => {
  return {
    code: errors.code.NO_ID,
    status: 400,
    msg: 'Invalid ID',
    details: { type }
  }
}

errors.badQuantity = (qty) => {
  const quantity = Number(qty)
  const error = {
    code: errors.code.BAD_QUANTITY,
    status: 400,
    msg: 'Invalid quantity'
  }
  if (Number.isNaN(quantity)) error.details = {details: 'Quantity is not a number'}
  else if (!Number.isInteger(quantity)) errors.details = {details: 'Quantity is not an integer'}
  else if (quantity <= 0) error.details = {details: 'Quantity is lower or equal to zero'}
  else if (quantity > 99) error.details = {details: 'Quantity must be lesser than 99'}
  return error
}

errors.missingRequiredField = (field) => {
  return {
    code: errors.code.MISSING_REQUIRED_FIELD,
    status: 400,
    msg: 'Missing required field',
    details: {field}
  }
}

errors.notAuthorized = (userId, action) => {
  return {
    code: errors.code.NOT_AUTHORIZED,
    status: 401,
    msg: 'Not authorized',
    details: {userId, action}
  }
}

errors.itemNotInList = (listId, itemId) => {
  return {
    code: errors.code.ITEM_NOT_IN_LIST,
    status: 400,
    msg: 'Item not in list',
    details: {listId, itemId}
  }
}

errors.userAlreadyInList = (listId, userId) => {
  return {
    code: errors.code.USER_ALREADY_IN_LIST,
    status: 400,
    msg: 'User already attend this list',
    details: {listId, userId}
  }
}

errors.invalidAction = (action) => {
  return {
    code: errors.code.INVALID_ACTION,
    status: 400,
    msg: 'Invalid action',
    details: action
  }
}

errors.itemAlreadyBrought = (item) => {
  return {
    code: errors.code.ITEM_ALREADY_BROUGHT,
    status: 400,
    msg: 'Item Already Brought',
    details: item
  }
}

errors.itemAlreadyCleared = (item) => {
  return {
    code: errors.code.ITEM_ALREADY_CLEARED,
    status: 400,
    msg: 'Item Already Cleared',
    details: item
  }
}

module.exports = errors
