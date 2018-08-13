import {SeenModel, SeenDTO} from '../models/seen';

export default class SeensController {
	public static seenBuilder = (seen: SeenModel): SeenDTO => {
		return {
			by: seen.by._id,
			date: seen.date
		};
	};
}
