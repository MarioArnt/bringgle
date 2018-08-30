import axios from '@/api'
import store from '@/store';
import { ActionDTO } from '@/models/action';

export default class HistoryController {
  public static markHistoryAsSeen() {
    axios.patch(`lists/${store.state.currentList.id}/history`, {
      userId: store.state.currentUser.id,
    }).then((res => {
      const updatedEvents: ActionDTO[] = res.data;
      updatedEvents.forEach(updatedEvent => {
        store.commit('markEventAsSeen', updatedEvent);
      });
    }));
  }

  public static markEventAsSeen(eventId: string) {
    axios.patch(`lists/${store.state.currentList.id}/history/${eventId}`, {
      userId: store.state.currentUser.id,
    }).then((res => {
      const eventId: string = res.data;
      store.commit('markEventAsSeen', eventId);
    }));
  }
}
