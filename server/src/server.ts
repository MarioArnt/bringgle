import express from 'express';
import {createServer, Server} from 'http';
import io from 'socket.io';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import SocketsUtils from './sockets';
import Router from './api';
import Config, {DatabaseConfig} from '../config';
import logger from './logger';

export class BringgleServer {
	public static readonly PORT: number = 8081;
	private app: express.Application;
	private server: Server;
	private io: SocketIO.Server;
	private socketsUtils: SocketsUtils;
	private env: string;
	private router: Router;
	constructor() {
		this.env = process.env.NODE_ENV || 'development';
		logger.info(`Starting app in ${this.env} mode`);
		this.createApp();
		this.createServer();
		if (this.env !== 'test') {
			this.createLogger();
		}
		this.sockets();
		this.createRouter();
		this.connectDatabase();
		this.listen();
		this.socketsUtils.initialize();
	}

	private createApp(): void {
		this.app = express();
		this.app.use(bodyParser.json());
		this.app.use(cors());
	}

	private createLogger(): void {
		const prodFormat = ':status - :remote-addr - :remote-user ":method :url HTTP/:http-version" :res[content-length] ":referrer" ":user-agent" :response-time ms';
		const devFormat = ':status :method :url :response-time ms - :res[content-length]';
		this.app.use(morgan(this.env === 'prodution' ? prodFormat : devFormat, {
			stream: {
				write: (meta: any) => {
					const status = meta.match(/^([0-9]{3})/);
					if (status && status[1] && Number(status[1]) >= 400) {
						logger.error(meta);
					} else if (this.env !== 'prodution') {
						logger.info(meta);
					}
				},
			}
		}));
	}

	private createRouter(): void {
		this.router = new Router(this.socketsUtils);
		this.app.use('/', this.router.getRouter());
	}

	private createServer(): void {
		this.server = createServer(this.app);
	}

	private connectDatabase(): void {
		logger.info('Connecting database');
		logger.debug(JSON.stringify(Config));
		const dbConfig: DatabaseConfig = Config.database[this.env];
		logger.debug(JSON.stringify(dbConfig));
		mongoose.connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`, {
			useNewUrlParser: true
		}).then(() => {
			logger.info('Database Connection Succeeded');
		}, err => {
			logger.error('Database Connection Failed', err);
		});
	}

	private sockets(): void {
			this.io = io(this.server);
			this.socketsUtils = new SocketsUtils(this.io);
	}

	private listen(): void {
		this.server.listen(process.env.PORT || 8081);
		logger.info('Magic happens on port 8081');
	}

	public getApp(): express.Application {
		return this.app;
	}

	public getSocketsUtils(): SocketsUtils {
		return this.socketsUtils;
	}
}
