"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../logger"));
const errors_1 = __importDefault(require("../constants/errors"));
const user_1 = __importDefault(require("../models/user"));
const list_1 = __importDefault(require("../models/list"));
const item_1 = __importDefault(require("../models/item"));
const users_1 = __importDefault(require("./users"));
const items_1 = __importDefault(require("./items"));
const actions_1 = __importDefault(require("../constants/actions"));
class ListsController {
    constructor(socketsUtils) {
        this.joinList = (req, res) => {
            const listId = req.params.id;
            const userName = req.body.name;
            const userEmail = req.body.email;
            const userId = req.body.id;
            const err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list_id');
            if (err)
                return res.status(err.status || 500).send(err);
            if (!userId) {
                this.createUserAndJoinList(listId, userName, userEmail).then((data) => {
                    this.socketsUtils.joinList(data.listId, data.user);
                    return res.status(200).json(data);
                }).catch((err) => { return res.status(err.status || 500).send(err); });
            }
            else {
                users_1.default.findById(req.body.userId).then((user) => {
                    this.addAttendeeToList(listId, user).then((data) => {
                        this.socketsUtils.joinList(data.listId, data.user);
                        return res.status(200).json(data);
                    }).catch((err) => {
                        return res.status(err.status || 500).send(err);
                    });
                }, (err) => {
                    if (err.code === errors_1.default.code.RESOURCE_NOT_FOUND) {
                        this.createUserAndJoinList(listId, userName, userEmail).then((data) => {
                            this.socketsUtils.joinList(data.listId, data.user);
                            return res.status(200).json(data);
                        }).catch((err) => {
                            return res.status(err.status || 500).send(err);
                        });
                    }
                    else
                        return res.status(err.status || 500).send(err);
                });
            }
        };
        this.createUserAndJoinList = (listId, userName, userEmail) => __awaiter(this, void 0, void 0, function* () {
            let err = ListsController.checkRequired('displayName', userName);
            if (!err)
                err = ListsController.checkRequired('userEmail', userEmail);
            if (err)
                return Promise.reject(err);
            const attendee = new user_1.default({
                name: userName,
                email: userEmail
            });
            const user = yield users_1.default.save(attendee).catch((err) => Promise.reject(err));
            return this.addAttendeeToList(listId, user);
        });
        this.addAttendeeToList = (listId, user) => __awaiter(this, void 0, void 0, function* () {
            const list = (yield ListsController.findById(listId).catch((err) => Promise.reject(err)));
            if (list.attendees.indexOf(user._id) >= 0)
                return Promise.reject(errors_1.default.userAlreadyInList(list._id, user._id));
            list.attendees.push(user._id);
            const savedList = yield ListsController.save(list).catch((err) => {
                logger_1.default.error(err);
                return Promise.reject(err);
            });
            return {
                listId: savedList._id,
                user: users_1.default.userBuilder(user)
            };
        });
        this.getList = (req, res) => {
            const listId = req.params.id;
            const userId = req.query.userId;
            let err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list');
            if (!err)
                err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(userId), 'user');
            if (err)
                return res.status(err.status || 500).send(err);
            this.fetchListData(listId, userId).then((data) => {
                return res.json(data);
            }, (err) => {
                return res.status(err.status || 500).send(err);
            });
        };
        this.fetchListData = (id, userId) => __awaiter(this, void 0, void 0, function* () {
            const list = yield ListsController.findById(id, true).catch((err) => Promise.reject(err));
            if (!list.attendees.some((att) => att.id === userId))
                return Promise.reject(errors_1.default.notAuthorized(userId, 'get list'));
            return ListsController.listBuilder(list);
        });
        this.addItem = (req, res) => {
            const listId = req.params.id;
            let err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list_id');
            if (!err)
                err = ListsController.checkRequired('name', req.body.name);
            if (!err)
                err = ListsController.checkRequired('author', req.body.author);
            if (!err)
                err = ListsController.checkRequired('quantity', req.body.quantity);
            if (!err)
                err = ListsController.checkQuantity(req.body.quantity);
            if (err)
                return res.status(err.status || 500).send(err);
            this.addItemRequest(req.params.id, req.body.author, req.body.quantity, req.body.name).then((item) => {
                this.socketsUtils.itemAdded(listId, items_1.default.itemBuilder(item));
                return res.status(200).send(item);
            }, (err) => { return res.status(err.status || 500).send(err); });
        };
        this.addItemRequest = (listId, authorId, quantity, name) => __awaiter(this, void 0, void 0, function* () {
            const list = yield ListsController.findById(listId).catch((err) => Promise.reject(err));
            const author = yield users_1.default.findById(authorId).catch((err) => Promise.reject(err));
            const err = ListsController.checkAuthorized(list, author._id, 'add item');
            if (err)
                return Promise.reject(err);
            const item = new item_1.default({
                quantity: quantity,
                name: name,
                author: author,
                responsible: new Map()
            });
            const savedItem = yield items_1.default.save(item).catch((err) => Promise.reject(err));
            return this.addItemToList(list, savedItem).catch((err) => Promise.reject(err));
        });
        this.addItemToList = (list, item) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                list.items.push(item._id);
                list.save((err) => {
                    if (err)
                        reject(errors_1.default.databaseAccess(err));
                    else
                        resolve(item);
                });
            });
        });
        this.updateItem = (req, res) => {
            const listId = req.params.listId;
            const itemId = req.params.itemId;
            const payload = req.body;
            let err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list');
            if (!err)
                err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(itemId), 'item');
            if (!err)
                err = ListsController.checkId(payload.userId, 'user');
            if (!err)
                err = ListsController.checkRequired('action', payload.action);
            if (err)
                return res.status(err.status).send(err);
            this.updateItemRequest(listId, itemId, payload).then((data) => {
                this.socketsUtils.itemUpdated(listId, data);
                return res.status(200).json(data);
            }, (err) => { return res.status(err.status || 500).send(err); });
        };
        this.updateItemRequest = (listId, itemId, payload) => __awaiter(this, void 0, void 0, function* () {
            const list = yield ListsController.findById(listId).catch(err => Promise.reject(err));
            const item = yield items_1.default.findById(itemId).catch(err => Promise.reject(err));
            const user = yield users_1.default.findById(payload.userId).catch(err => Promise.reject(err));
            let err = ListsController.checkAuthorized(list, user._id, 'update item');
            if (!err)
                err = ListsController.checkItemInList(list, item._id);
            if (err)
                return Promise.reject(err);
            switch (payload.action) {
                case actions_1.default.BRING_ITEM.code:
                    return this.bringItem(item, payload.sub, user);
                case actions_1.default.CLEAR_ITEM.code:
                    return this.clearItem(item, payload.sub);
                case actions_1.default.UPDATE_QUANTITY_AND_NAME.code:
                    return this.updateQuantityAndName(item, payload.newName, payload.newQuantity);
                default:
                    return Promise.reject(errors_1.default.invalidAction(payload.action));
            }
        });
        this.updateQuantityAndName = (item, newName, newQuantity) => __awaiter(this, void 0, void 0, function* () {
            let err = ListsController.checkRequired('name', newName);
            if (!err)
                err = ListsController.checkQuantity(newQuantity);
            if (err)
                return Promise.reject(err);
            item.name = newName;
            item.quantity = newQuantity;
            if (item.responsible.size > newQuantity) {
                logger_1.default.debug('Responsible size higher than quantity');
                logger_1.default.debug(JSON.stringify(item.responsible));
                const toDelete = item.responsible.size - newQuantity;
                logger_1.default.debug('removing items: ' + toDelete);
                const keys = [...item.responsible.keys()].map((k) => Number(k)).sort((a, b) => a - b);
                for (let i = 0; i < toDelete; ++i) {
                    item.responsible.delete(keys[i].toString());
                }
                logger_1.default.debug(JSON.stringify(item.responsible));
            }
            const updatedItem = yield items_1.default.save(item, true).catch((err) => Promise.reject(err));
            return updatedItem;
        });
        this.bringItem = (item, sub, user) => __awaiter(this, void 0, void 0, function* () {
            const err = ListsController.checkRequired('sub-item', sub);
            if (err)
                return Promise.reject(err);
            logger_1.default.debug('Inserting responsible at position ' + sub);
            logger_1.default.debug('Responsible map type ' + typeof item.responsible);
            logger_1.default.debug('Responsible map size ' + item.responsible.size);
            logger_1.default.debug('Responsible map content ' + JSON.stringify(item.responsible));
            logger_1.default.debug('Responsible map keys ' + JSON.stringify(item.responsible.keys()));
            logger_1.default.debug('Responsible map values ' + JSON.stringify(item.responsible.values()));
            logger_1.default.debug('Responsible map content at position ' + sub + ':' + item.responsible.get(sub.toString()));
            if (item.responsible.get(sub.toString()))
                return Promise.reject(errors_1.default.itemAlreadyBrought(item));
            logger_1.default.debug('Item not already brought');
            try {
                logger_1.default.debug('Trying to set ' + user._id + ' at pos ' + sub);
                item.responsible.set(sub.toString(), user);
            }
            catch (e) {
                logger_1.default.error('failure', e);
                throw e;
            }
            logger_1.default.debug('sucess. Saving item....');
            const savedItem = yield items_1.default.save(item, true).catch((err) => Promise.reject(err));
            logger_1.default.debug('done');
            return savedItem;
        });
        this.clearItem = (item, sub) => __awaiter(this, void 0, void 0, function* () {
            const err = ListsController.checkRequired('sub-item', sub);
            if (err)
                return Promise.reject(err);
            if (err)
                return Promise.reject(err);
            if (!item.responsible.get(sub.toString()))
                return Promise.reject(errors_1.default.itemAlreadyCleared(item));
            item.responsible.delete(sub.toString());
            const savedItem = yield items_1.default.save(item, true).catch((err) => Promise.reject(err));
            return savedItem;
        });
        this.removeItem = (req, res) => {
            const listId = req.params.listId;
            const itemId = req.params.itemId;
            const userId = req.query.userId;
            let err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(listId), 'list');
            if (!err)
                err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(itemId), 'item');
            if (!err)
                err = ListsController.checkId(ListsController.uncastFalsyRequestParamter(userId), 'user');
            if (err)
                return res.status(err.status || 500).send(err);
            this.deleteItem(listId, itemId, userId).then((deletedItem) => {
                this.socketsUtils.itemRemoved(listId, deletedItem._id);
                return res.status(200).send({ id: deletedItem._id });
            }, (err) => { return res.status(err.status || 500).send(err); });
        };
        this.deleteItem = (listId, itemId, userId) => __awaiter(this, void 0, void 0, function* () {
            const list = yield ListsController.findById(listId).catch(err => Promise.reject(err));
            const item = yield items_1.default.findById(itemId).catch(err => Promise.reject(err));
            const user = yield users_1.default.findById(userId).catch(err => Promise.reject(err));
            let err = ListsController.checkAuthorized(list, user._id, 'delete item');
            if (!err)
                err = ListsController.checkItemInList(list, item._id);
            if (err)
                return Promise.reject(err);
            yield this.removeItemFromList(list, item).catch(err => Promise.reject(err));
            const deletedItem = yield items_1.default.delete(item._id).catch(err => Promise.reject(err));
            return deletedItem;
        });
        this.removeItemFromList = (list, item) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                list.update({ $pull: { items: item._id } }, (err, list) => {
                    if (err)
                        return reject(errors_1.default.databaseAccess(err));
                    return resolve();
                });
            });
        });
        this.socketsUtils = socketsUtils;
    }
}
ListsController.checkId = (id, type) => {
    if (!id)
        return errors_1.default.noId(type);
    return null;
};
ListsController.checkRequired = (field, value) => {
    if (!value && value !== 0)
        return errors_1.default.missingRequiredField(field);
    return null;
};
ListsController.checkQuantity = (qty) => {
    const quantity = Number(qty);
    if (Number.isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99)
        return errors_1.default.badQuantity(quantity);
    return null;
};
ListsController.checkAuthorized = (list, userId, action) => {
    if (list.attendees.indexOf(userId) < 0)
        return errors_1.default.notAuthorized(userId, action);
    return null;
};
ListsController.checkItemInList = (list, itemId) => {
    if (list.items.indexOf(itemId) < 0)
        return errors_1.default.itemNotInList(list._id, itemId);
    return null;
};
ListsController.createList = (req, res) => {
    const listName = req.body.title;
    const userName = req.body.owner ? req.body.owner.name : null;
    const userEmail = req.body.owner ? req.body.owner.email : null;
    const userId = req.body.owner ? req.body.owner.id : null;
    const err = ListsController.checkRequired('listName', listName);
    if (err)
        return res.status(err.status || 500).json(err);
    if (!userId) {
        ListsController.createUserAndList(listName, userName, userEmail).then((createdList) => {
            return res.status(200).json(createdList);
        }, (err) => {
            return res.status(err.status || 500).json(err);
        });
    }
    else {
        users_1.default.findById(userId).then((user) => {
            ListsController.createListRequest(listName, user).then((createdList) => {
                return res.status(200).json(createdList);
            }, (err) => {
                return res.status(err.status || 500).json(err);
            });
        }, (err) => {
            if (err.code === errors_1.default.code.RESOURCE_NOT_FOUND) {
                ListsController.createUserAndList(listName, userName, userEmail).then((createdList) => {
                    return res.status(200).json(createdList);
                }, (err) => {
                    return res.status(err.status || 500).json(err);
                });
            }
            else
                return res.status(err.status || 500).json(err);
        });
    }
};
ListsController.createUserAndList = (listName, userName, userEmail) => __awaiter(this, void 0, void 0, function* () {
    let err = ListsController.checkRequired('displayName', userName);
    if (!err)
        err = ListsController.checkRequired('userEmail', userEmail);
    if (err)
        return Promise.reject(err);
    const owner = new user_1.default({
        name: userName,
        email: userEmail
    });
    const user = yield users_1.default.save(owner).catch(err => Promise.reject(err));
    return ListsController.createListRequest(listName, user);
});
ListsController.createListRequest = (name, owner) => __awaiter(this, void 0, void 0, function* () {
    const list = new list_1.default({
        title: name,
        owner: owner,
        attendees: [owner]
    });
    const savedList = yield ListsController.save(list).catch(err => Promise.reject(err));
    return {
        listId: savedList._id,
        user: users_1.default.userBuilder(owner)
    };
});
ListsController.findById = (id, eager = false) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const callback = (err, list) => {
            if (err)
                reject(errors_1.default.databaseAccess(err));
            else if (list == null)
                reject(errors_1.default.ressourceNotFound({ type: 'list', id }));
            else
                resolve(list);
        };
        if (eager) {
            return list_1.default.findById(id).populate('owner').populate('attendees').populate('items').populate({
                path: 'items',
                populate: { path: 'responsible' }
            }).exec(callback);
        }
        else
            return list_1.default.findById(id, callback);
    });
});
ListsController.uncastFalsyRequestParamter = (param) => {
    if (param === 'undefined')
        return undefined;
    if (param === 'null')
        return null;
    return param;
};
ListsController.listBuilder = (list) => {
    return {
        id: list._id,
        title: list.title,
        owner: users_1.default.userBuilder(list.owner),
        attendees: list.attendees.map((att) => users_1.default.userBuilder(att)),
        items: list.items.map((it) => items_1.default.itemBuilder(it)),
        created: list.created
    };
};
ListsController.save = (list) => {
    return new Promise((resolve, reject) => {
        list.save((err, list) => {
            if (err)
                reject(errors_1.default.databaseAccess(err));
            resolve(list);
        });
    });
};
exports.default = ListsController;
//# sourceMappingURL=lists.js.map