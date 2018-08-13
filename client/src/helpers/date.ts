import moment from 'moment';

export default class DateHelpers {
  public static format = (date: any): string => {
    const actionDate = moment(date);
    const now = moment();
    if (!actionDate.isBefore(now.subtract(1, 'd'))) return actionDate.fromNow();
    if( actionDate.year()!== now.year()) return actionDate.format('MMMM Do YYYY - HH:mm');
    return actionDate.format('MMMM Do - HH:mm');
  }
}