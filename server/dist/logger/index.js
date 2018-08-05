"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const moment_1 = __importDefault(require("moment"));
const { combine, timestamp, printf } = winston_1.format;
const myFormat = printf(info => {
    return `[${info.level} @ ${moment_1.default(info.timestamp).format('DD/MM/YY hh:mm:ss.SSS')}]: ${info.message}`;
});
const useTransports = [];
if (process.env.NODE_ENV === 'production') {
    useTransports.push(new winston_1.transports.File({
        filename: 'error.log',
        level: 'error',
        format: winston_1.format.json()
    }));
    useTransports.push(new winston_1.transports.File({
        filename: 'combined.log',
        level: 'info',
        format: winston_1.format.json()
    }));
}
else if (process.env.NODE_ENV === 'test') {
    useTransports.push(new winston_1.transports.Console({
        format: combine(winston_1.format.colorize(), timestamp(), myFormat),
        level: 'error'
    }));
}
else {
    useTransports.push(new winston_1.transports.Console({
        format: combine(winston_1.format.colorize(), timestamp(), myFormat),
        level: 'silly'
    }));
}
const logger = winston_1.createLogger({
    transports: useTransports
});
/* logger.stream = {
  write: (message, encoding) => {
    logger.error(message)
  }
} */
exports.default = logger;
//# sourceMappingURL=index.js.map