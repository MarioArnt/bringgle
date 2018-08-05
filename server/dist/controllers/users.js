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
const user_1 = __importDefault(require("../models/user"));
const errors_1 = __importDefault(require("../constants/errors"));
class UsersController {
}
UsersController.findById = (id, build = false) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        user_1.default.findById(id, (err, user) => {
            if (err)
                reject(errors_1.default.databaseAccess(err));
            else if (user == null)
                reject(errors_1.default.ressourceNotFound({ type: 'user', id }));
            else if (build)
                resolve(UsersController.userBuilder(user));
            else
                resolve(user);
        });
    });
});
UsersController.userBuilder = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email
    };
};
UsersController.save = (user, build = false) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        user.save((err, savedUser) => {
            if (err)
                reject(errors_1.default.databaseAccess(err));
            else if (build)
                resolve(UsersController.userBuilder(savedUser));
            else
                resolve(savedUser);
        });
    });
});
exports.default = UsersController;
//# sourceMappingURL=users.js.map