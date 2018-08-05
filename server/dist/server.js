"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = __importDefault(require("socket.io"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
// import morgan from 'morgan'
const sockets_1 = __importDefault(require("./sockets"));
const api_1 = __importDefault(require("./api"));
const config_json_1 = __importDefault(require("../config.json"));
const logger_1 = __importDefault(require("./logger"));
class BringgleServer {
    constructor() {
        this.env = process.env.NODE_ENV || 'development';
        logger_1.default.info(`Starting app in ${this.env} mode`);
        /*this.app.use(morgan('combined', {
          skip: (req, res) => { return res.statusCode < 400 },
          stream: logger.stream
        })) */
        this.createApp();
        this.createServer();
        this.sockets();
        this.createRouter();
        this.connectDatabase();
        this.listen();
        this.socketsUtils.initialize();
    }
    createApp() {
        this.app = express_1.default();
        this.app.use(body_parser_1.default.json());
        this.app.use(cors_1.default());
    }
    createRouter() {
        this.router = new api_1.default(this.socketsUtils);
        this.app.use('/', this.router.getRouter());
    }
    createServer() {
        this.server = http_1.createServer(this.app);
    }
    connectDatabase() {
        logger_1.default.info('Connecting database');
        const dbConfig = config_json_1.default.database[this.env];
        logger_1.default.debug(JSON.stringify(dbConfig));
        mongoose_1.default.connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`, { useNewUrlParser: true }).then(() => { logger_1.default.info('Database Connection Succeeded'); }, err => { logger_1.default.error('Database Connection Failed', err); });
    }
    sockets() {
        this.io = socket_io_1.default(this.server);
        this.socketsUtils = new sockets_1.default(this.io);
    }
    listen() {
        this.server.listen(process.env.PORT || 8081);
        logger_1.default.info('Magic happens on port 8081');
    }
    getApp() {
        return this.app;
    }
    getSocketsUtils() {
        return this.socketsUtils;
    }
}
BringgleServer.PORT = 8081;
exports.BringgleServer = BringgleServer;
//# sourceMappingURL=server.js.map