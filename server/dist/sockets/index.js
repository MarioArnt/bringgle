"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../logger"));
class SocketsUtils {
    constructor(io) {
        this.userConnected = (socket) => {
            const list = socket.handshake.query.listId;
            const user = socket.handshake.query.userId;
            if (!this.connections.has(list)) {
                this.connections.set(list, new Map());
            }
            const users = this.connections.get(list);
            let tabCount = 1;
            if (users.has(user)) {
                tabCount = users.get(user) + 1;
            }
            users.set(user, tabCount);
            socket.join(list);
            logger_1.default.debug(`User ${user} joined list ${list}`);
            logger_1.default.debug(`Now ${this.connections.get(list).size} users are connected to list ${list}`);
            this.io.sockets.to(list).emit('user connected', [...this.connections.get(list).keys()]);
        };
        this.userDisconnected = (socket) => {
            const list = socket.handshake.query.listId;
            const user = socket.handshake.query.userId;
            const users = this.connections.get(list);
            const tabCount = users.get(user);
            if (tabCount > 1) {
                users.set(user, tabCount - 1);
            }
            else {
                users.delete(user);
            }
            this.io.sockets.to(list).emit('user disconnected', [...this.connections.get(list).keys()]);
            socket.leave(list);
            logger_1.default.debug(`User ${user} left list ${list}`);
            logger_1.default.debug(`Now ${this.connections.get(list).size} users are connected to list ${list}`);
        };
        this.initialize = () => {
            this.io.on('connection', (socket) => {
                this.userConnected(socket);
                socket.on('disconnect', () => this.userDisconnected(socket));
            });
        };
        this.joinList = (listId, user) => {
            this.io.sockets.to(listId).emit('user joined', user);
        };
        this.itemAdded = (listId, item) => {
            this.io.sockets.to(listId).emit('item added', item);
        };
        this.itemUpdated = (listId, item) => {
            this.io.sockets.to(listId).emit('item updated', item);
        };
        this.itemRemoved = (listId, itemId) => {
            this.io.sockets.to(listId).emit('item removed', itemId);
        };
        this.io = io;
        this.connections = new Map();
    }
}
exports.default = SocketsUtils;
//# sourceMappingURL=index.js.map