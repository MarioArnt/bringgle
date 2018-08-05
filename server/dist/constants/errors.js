"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorModel {
    constructor(code, status, msg, details) {
        this.code = code;
        this.status = status;
        this.msg = msg;
        this.details = details;
    }
}
exports.ErrorModel = ErrorModel;
class Errors {
}
Errors.code = {
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
};
Errors.databaseAccess = (details) => {
    return new ErrorModel(Errors.code.DB_ACCESS, 500, 'Error happened while requesting database', details);
};
Errors.ressourceNotFound = (details) => {
    return {
        code: Errors.code.RESOURCE_NOT_FOUND,
        status: 404,
        msg: `Ressource not found`,
        details
    };
};
Errors.noId = (type) => {
    return {
        code: Errors.code.NO_ID,
        status: 400,
        msg: 'Invalid ID',
        details: { type }
    };
};
Errors.badQuantity = (qty) => {
    const quantity = Number(qty);
    let msg = '';
    if (Number.isNaN(quantity))
        msg = 'Quantity is not a number';
    else if (!Number.isInteger(quantity))
        msg = 'Quantity is not an integer';
    else if (quantity <= 0)
        msg = 'Quantity is lower or equal to zero';
    else if (quantity > 99)
        msg = 'Quantity must be lesser than 99';
    const error = {
        code: Errors.code.BAD_QUANTITY,
        status: 400,
        msg: 'Invalid quantity',
        details: { details: msg }
    };
    return error;
};
Errors.missingRequiredField = (field) => {
    return {
        code: Errors.code.MISSING_REQUIRED_FIELD,
        status: 400,
        msg: 'Missing required field',
        details: { field }
    };
};
Errors.notAuthorized = (userId, action) => {
    return {
        code: Errors.code.NOT_AUTHORIZED,
        status: 401,
        msg: 'Not authorized',
        details: { userId, action }
    };
};
Errors.itemNotInList = (listId, itemId) => {
    return {
        code: Errors.code.ITEM_NOT_IN_LIST,
        status: 400,
        msg: 'Item not in list',
        details: { listId, itemId }
    };
};
Errors.userAlreadyInList = (listId, userId) => {
    return {
        code: Errors.code.USER_ALREADY_IN_LIST,
        status: 400,
        msg: 'User already attend this list',
        details: { listId, userId }
    };
};
Errors.invalidAction = (action) => {
    return {
        code: Errors.code.INVALID_ACTION,
        status: 400,
        msg: 'Invalid action',
        details: action
    };
};
Errors.itemAlreadyBrought = (item) => {
    return {
        code: Errors.code.ITEM_ALREADY_BROUGHT,
        status: 400,
        msg: 'Item Already Brought',
        details: item
    };
};
Errors.itemAlreadyCleared = (item) => {
    return {
        code: Errors.code.ITEM_ALREADY_CLEARED,
        status: 400,
        msg: 'Item Already Cleared',
        details: item
    };
};
exports.default = Errors;
//# sourceMappingURL=errors.js.map