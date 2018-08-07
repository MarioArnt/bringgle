import ListItem, {ItemModel, ItemDTO} from '../models/item';
import UsersController from './users';
import Errors from '../constants/errors';
import {Document} from 'mongoose';

export default class ItemsController {
	public static itemBuilder = (item: ItemModel): ItemDTO => {
		const build = {
			id: item._id,
			name: item.name,
			quantity: item.quantity,
			author: UsersController.userBuilder(item.author),
			responsible: {},
			created: item.created
		};
		build.responsible = [...item.responsible.entries()].reduce((obj: any, [key, value]: any) => (obj[key] = value, obj), {});
		return build;
	};

	public static findById = async (id: string, build = false): Promise<ItemDTO | ItemModel> => {
		return new Promise<ItemDTO | ItemModel>((resolve, reject) => {
			ListItem.findById(id, (err, item: ItemModel) => {
				if (err) {
					reject(Errors.databaseAccess(err));
				} else if (!item) {
					reject(Errors.ressourceNotFound({type: 'item', id}));
				} else if (build) {
					resolve(ItemsController.itemBuilder(item));
				} else {
					resolve(item);
				}
			});
		});
	};

	public static save = async (item: Document, build = false): Promise<ItemModel | ItemDTO> => {
		return new Promise<ItemModel | ItemDTO>((resolve, reject) => {
			item.save((err, savedItem: ItemModel) => {
				if (err) {
					return reject(Errors.databaseAccess(err));
				}
				if (!build) {
					return resolve(savedItem);
				}
				item.populate('responsible', errPop => {
					if (errPop) {
						return reject(errPop);
					}
					return resolve(ItemsController.itemBuilder(savedItem));
				});
			});
		});
	};

	public static delete = async (itemId: string): Promise<ItemModel> => {
		return new Promise<ItemModel>((resolve, reject) => {
			ListItem.findByIdAndRemove(itemId, (err, item: ItemModel) => {
				if (err) {
					return reject(Errors.databaseAccess(err));
				}
				return resolve(item);
			});
		});
	};
}
