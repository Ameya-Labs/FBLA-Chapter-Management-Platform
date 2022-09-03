import EVENTS_ACTION_TYPES from './events.types';

export const EVENTS_INITIAL_STATE = {
  events: [],
  isLoading: false,
  error: null,
};

export const eventsReducer = (
  state = EVENTS_INITIAL_STATE,
  action = {}
) => {
  const { type, payload } = action;

  switch (type) {
    case EVENTS_ACTION_TYPES.FETCH_EVENTS_START:
      return {...state, isLoading: true}
    case EVENTS_ACTION_TYPES.FETCH_EVENTS_SUCCESS:
      return { ...state, events: payload, isLoading: false };
    case EVENTS_ACTION_TYPES.FETCH_EVENTS_FAILED:
      return { ...state, error: payload, isLoading: false };
    default:
      return state;
  }
};