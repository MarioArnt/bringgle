export interface ActionModel {
	code: string;
	text: string;
}

export default class Actions {
	public static readonly BRING_ITEM: ActionModel = {
		code: 'A01',
		text: 'Bring item'
	};
	public static readonly CLEAR_ITEM: ActionModel = {
		code: 'A02',
		text: 'Clear item'
	};
	public static readonly UPDATE_QUANTITY_AND_NAME: ActionModel = {
		code: 'A03',
		text: 'Update quantity and name'
	};
	public static readonly CREATED_LIST: ActionModel = {
		code: 'A04',
		text: 'Bring item'
	};
	public static readonly CHANGED_LIST_NAME: ActionModel = {
		code: 'A05',
		text: 'Clear item'
	};
	public static readonly ADDED_LIST_DESCRIPTION: ActionModel = {
		code: 'A06',
		text: 'Clear item'
	};
	public static readonly CHANGED_LIST_DESCRIPTION: ActionModel = {
		code: 'A07',
		text: 'Clear item'
	};
	public static readonly ADDED_ITEM: ActionModel = {
		code: 'A08',
		text: 'Clear item'
	};
	public static readonly REMOVED_ITEM: ActionModel = {
		code: 'A09',
		text: 'Clear item'
	};
	public static readonly UPDATED_ITEM_NAME: ActionModel = {
		code: 'A10',
		text: 'Clear item'
	};
	public static readonly UPDATED_ITEM_QUANTITY: ActionModel = {
		code: 'A11',
		text: 'Clear item'
	};
	public static readonly JOINED_LIST: ActionModel = {
		code: 'A12',
		text: 'Clear item'
	};
	public static readonly INVITED_USER: ActionModel = {
		code: 'A13',
		text: 'Clear item'
	};
}
