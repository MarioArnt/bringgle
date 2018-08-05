"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const ListSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    attendees: [{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }],
    items: [{
            type: Schema.Types.ObjectId,
            ref: 'item'
        }],
    created: Date
});
const List = mongoose_1.default.model('list', ListSchema);
exports.default = List;
//# sourceMappingURL=list.js.map