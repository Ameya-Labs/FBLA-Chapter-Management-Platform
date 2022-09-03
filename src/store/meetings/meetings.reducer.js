import MEETINGS_ACTION_TYPES from './meetings.types';

export const MEETINGS_INITIAL_STATE = {
  meetings: [],
  isLoading: false,
  error: null,
};

export const meetingsReducer = (
  state = MEETINGS_INITIAL_STATE,
  action = {}
) => {
  const { type, payload } = action;

  switch (type) {
    case MEETINGS_ACTION_TYPES.FETCH_MEETINGS_START:
      return {...state, isLoading: true}
    case MEETINGS_ACTION_TYPES.FETCH_MEETINGS_SUCCESS:
      return { ...state, meetings: payload, isLoading: false };
    case MEETINGS_ACTION_TYPES.FETCH_MEETINGS_FAILED:
      return { ...state, error: payload, isLoading: false };
    default:
      return state;
  }
};