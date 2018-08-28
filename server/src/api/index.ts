import SocketsUtils from '../sockets';
import ListsController from '../controllers/lists';
import * as Express from 'express';

export default class Router {
	private socketsUtils: SocketsUtils;
	private listsController: ListsController;
	private router: Express.Router;
	constructor(socketsUtils: SocketsUtils) {
		this.socketsUtils = socketsUtils;
		this.router = Express.Router();
		this.listsController = new ListsController(this.socketsUtils);
		this.createRoutes();
	}
	private createRoutes(): void {
		this.router.post('/api/lists', this.listsController.createList);
		this.router.get('/api/lists/:id', this.listsController.getList);
		this.router.post('/api/lists/:id/join', this.listsController.joinList);
		this.router.post('/api/lists/:id/items', this.listsController.addItem);
		this.router.patch('/api/lists/:listId/items/:itemId', this.listsController.updateItem);
		this.router.delete('/api/lists/:listId/items/:itemId', this.listsController.removeItem);
		this.router.post('/api/lists/:id/invite', this.listsController.invite);
		this.router.post('/api/lists/:id/messages', this.listsController.sendMessage);
	}
	public getRouter(): Express.Router {
		return this.router;
	}
}
