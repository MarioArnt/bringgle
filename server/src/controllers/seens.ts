import {SeenModel, SeenLazyDTO, SeenEagerDTO} from '../models/seen';
import {Document} from 'mongoose';
import Errors from '../constants/errors';
import UsersController from './users';

export default class SeensController {
	public static seenBuilder = (seen: SeenModel, eager = false): SeenLazyDTO | SeenEagerDTO => {
		return {
			by: eager ? UsersController.userBuilder(seen.by) : seen.by._id,
			date: seen.date
		};
	};
	public static save = async (seen: Document): Promise<SeenModel> => {
		return new Promise<SeenModel>((resolve, reject) => {
			seen.save((err, savedSeen: SeenModel) => {
				if (err) {
					reject(Errors.databaseAccess(err));
				} else {
					resolve(savedSeen);
				}
			});
		});
	};
}
