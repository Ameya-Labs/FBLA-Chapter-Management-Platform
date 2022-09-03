import EVENTS_ACTION_TYPES from './events.types';
import { createAction } from '../../utils/reducer/reducer.utils';

import { getEventsList } from '../../utils/firebase/firebase.utils';

export const fetchEventsStart = () =>
  createAction(EVENTS_ACTION_TYPES.FETCH_EVENTS_START);

export const fetchEventsSuccess = (eventsArray) =>
  createAction(
    EVENTS_ACTION_TYPES.FETCH_EVENTS_SUCCESS,
    eventsArray
  );

export const fetchEventsFailure = (error) =>
  createAction(EVENTS_ACTION_TYPES.FETCH_EVENTS_FAILED, error);

export const fetchEventsStartAsync = () => {
  return async (dispatch) => {
    dispatch(fetchEventsStart());
    try {
      const eventsArray = await getEventsList('events');
      dispatch(fetchEventsSuccess(eventsArray));
    } catch (error) {
      dispatch(fetchEventsFailure(error));
    }
  };
};