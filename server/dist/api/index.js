"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lists_1 = __importDefault(require("../controllers/lists"));
const Express = __importStar(require("express"));
class Router {
    constructor(socketsUtils) {
        this.socketsUtils = socketsUtils;
        this.router = Express.Router();
        this.listsController = new lists_1.default(this.socketsUtils);
        this.createRoutes();
    }
    createRoutes() {
        this.router.post('/api/lists', lists_1.default.createList);
        this.router.get('/api/lists/:id', this.listsController.getList);
        this.router.post('/api/lists/:id/join', this.listsController.joinList);
        this.router.post('/api/lists/:id/items', this.listsController.addItem);
        this.router.patch('/api/lists/:listId/items/:itemId', this.listsController.updateItem);
        this.router.delete('/api/lists/:listId/items/:itemId', this.listsController.removeItem);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = Router;
//# sourceMappingURL=index.js.map