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
const item_1 = __importDefault(require("../models/item"));
const users_1 = __importDefault(require("./users"));
const errors_1 = __importDefault(require("../constants/errors"));
class ItemsController {
}
ItemsController.itemBuilder = (item) => {
    const build = {
        id: item._id,
        name: item.name,
        quantity: item.quantity,
        author: users_1.default.userBuilder(item.author),
        responsible: {},
        created: item.created
    };
    build.responsible = [...item.responsible.entries()].reduce((obj, [key, value]) => (obj[key] = value, obj), {});
    return build;
};
ItemsController.findById = (id, build = false) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        item_1.default.findById(id, (err, item) => {
            if (err)
                reject(errors_1.default.databaseAccess(err));
            else if (item == null)
                reject(errors_1.default.ressourceNotFound({ type: 'item', id }));
            else if (build)
                resolve(ItemsController.itemBuilder(item));
            else
                resolve(item);
        });
    });
});
ItemsController.save = (item, build = false) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        item.save((err, item) => {
            if (err)
                reject(errors_1.default.databaseAccess(err));
            else if (build) {
                item.populate('responsible', (err) => {
                    if (err)
                        reject(err);
                    resolve(ItemsController.itemBuilder(item));
                });
            }
            else
                resolve(item);
        });
    });
});
ItemsController.delete = (itemId) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        item_1.default.findByIdAndRemove(itemId, (err, item) => {
            if (err)
                return reject(errors_1.default.databaseAccess(err));
            return resolve(item);
        });
    });
});
exports.default = ItemsController;
//# sourceMappingURL=items.js.map