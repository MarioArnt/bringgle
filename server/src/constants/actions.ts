export interface ActionModel  {
  code: string;
  text: string
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
}
