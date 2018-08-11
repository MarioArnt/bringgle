import UsersController from './users';
import {SeenModel, SeenDTO} from '../models/seen';

export default class SeensController {
	public static seenBuilder = (seen: SeenModel): SeenDTO => {
		return {
			by: UsersController.userBuilder(seen.by),
			date: seen.date
		};
	};
}
