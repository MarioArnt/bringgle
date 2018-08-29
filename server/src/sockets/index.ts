import logger from '../logger';
import {UserDTO} from '../models/user';
import {ItemDTO} from '../models/item';
import {ActionEagerDTO} from '../models/action';
import {MessageEagerDTO} from '../models/message';

export default class SocketsUtils {
	io: SocketIO.Server;
	connections: Map<string, Map<string, number>>;
	usersTyping: Map<string, Set<string>>;

	constructor(io: SocketIO.Server) {
		this.io = io;
		this.connections = new Map<string, Map<string, number>>();
		this.usersTyping = new Map<string, Set<string>>();
	}

	private userConnected = (socket: any) => {
		const list: string = socket.handshake.query.listId;
		const user: string = socket.handshake.query.userId;
		if (!this.connections.has(list)) {
			this.connections.set(list, new Map());
		}
		const users: Map<string, number> = this.connections.get(list);
		let tabCount = 1;
		if (users.has(user)) {
			tabCount = users.get(user) + 1;
		}
		users.set(user, tabCount);
		socket.join(list);
		logger.debug(`User ${user} joined list ${list}`);
		logger.debug('----------UPDATED CONNECTIONS MAP------------');
		[...this.connections.get(list).keys()].forEach(userId => {
			logger.debug(`User ${userId} has now ${this.connections.get(list).get(userId)} active connections`);
		});
		logger.debug('---------------------------------------------');
		logger.debug(`Now ${this.connections.get(list).size} users are connected to list ${list}`);
		logger.debug('---------------------------------------------');
		this.io.sockets.to(list).emit('user connected', [...this.connections.get(list).keys()]);
	};

	private userDisconnected = (socket: any) => {
		const list: string = socket.handshake.query.listId;
		const user: string = socket.handshake.query.userId;
		const users: Map<string, number> = this.connections.get(list);
		const tabCount = users.get(user);
		if (tabCount > 1) {
			users.set(user, tabCount - 1);
		} else {
			users.delete(user);
		}
		this.io.sockets.to(list).emit('user disconnected', [...this.connections.get(list).keys()]);
		socket.leave(list);
		logger.debug(`User ${user} left list ${list}`);
		logger.debug('----------UPDATED CONNECTIONS MAP------------');
		[...this.connections.get(list).keys()].forEach(userId => {
			logger.debug(`User ${userId} has now ${this.connections.get(list).get(userId)} active connections`);
		});
		logger.debug('---------------------------------------------');
		logger.debug(`Now ${this.connections.get(list).size} users are connected to list ${list}`);
		logger.debug('---------------------------------------------');
	};

	public initialize = () => {
		this.io.on('connection', socket => {
			this.userConnected(socket);
			const list: string = socket.handshake.query.listId;
			const user: string = socket.handshake.query.userId;
			socket.on('disconnect', () => this.userDisconnected(socket));
			socket.on('start typing', () => this.userTypingChanged(list, user, true));
			socket.on('stop typing', () => this.userTypingChanged(list, user, false));
		});
	};

	private userTypingChanged = (list: string, user: string, typing: boolean) => {
		logger.debug('receiving typing socket event');
		logger.debug(list);
		logger.debug(user);
		logger.debug('isTyping: ' + typing);
		let usersTypingForList;
		if (!this.usersTyping.has(list)) {
			usersTypingForList = new Set<string>();
			if (typing) {
				usersTypingForList.add(user);
			} else {
				return;
			}
		} else {
			usersTypingForList = this.usersTyping.get(list);
			if (typing) {
				usersTypingForList.add(user);
			} else {
				usersTypingForList.delete(user);
			}
		}
		this.usersTyping.set(list, usersTypingForList);
		logger.debug('users typing updated. sending socket event');
		logger.debug([...usersTypingForList]);
		this.io.sockets.to(list).emit('user typing changed', [...usersTypingForList]);
	};

	public joinList = (listId: string, user: UserDTO) => {
		logger.debug(`Socket event ${listId}: User joined list`);
		this.io.sockets.to(listId).emit('user joined', user);
	};

	public itemAdded = (listId: string, item: ItemDTO) => {
		logger.debug(`Socket event ${listId}: User cretaed item`);
		this.io.sockets.to(listId).emit('item added', item);
	};

	public itemUpdated = (listId: string, item: ItemDTO) => {
		logger.debug(`Socket event ${listId}: User updated item`);
		this.io.sockets.to(listId).emit('item updated', item);
	};

	public itemRemoved = (listId: string, itemId: string) => {
		logger.debug(`Socket event ${listId}: User remove item`);
		this.io.sockets.to(listId).emit('item removed', itemId);
	};

	public emitAction = (listId: string, action: ActionEagerDTO) => {
		logger.debug(`Socket event ${listId}: New history entry`);
		this.io.sockets.to(listId).emit('action happened', action);
	};

	public messageSent = (listId: string, message: MessageEagerDTO) => {
		logger.debug(`Socket event ${listId}: New message`);
		this.io.sockets.to(listId).emit('new message', message);
	};
}
