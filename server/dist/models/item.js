"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const ListItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        validate: function (v) {
            return (!Number.isNaN(v) && Number.isInteger(v) && v > 0 && v < 100);
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    responsible: {
        type: Map,
        of: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },
    created: Date
});
const Item = mongoose_1.default.model('item', ListItemSchema);
exports.default = Item;
//# sourceMappingURL=item.js.map