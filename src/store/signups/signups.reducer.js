import SIGNUPS_ACTION_TYPES from './signups.types';

export const SIGNUPS_INITIAL_STATE = {
  signups: [],
  isLoading: false,
  error: null,
};

export const signupsReducer = (
  state = SIGNUPS_INITIAL_STATE,
  action = {}
) => {
  const { type, payload } = action;

  switch (type) {
    case SIGNUPS_ACTION_TYPES.FETCH_SIGNUPS_START:
      return {...state, isLoading: true}
    case SIGNUPS_ACTION_TYPES.FETCH_SIGNUPS_SUCCESS:
      return { ...state, signups: payload, isLoading: false };
    case SIGNUPS_ACTION_TYPES.FETCH_SIGNUPS_FAILED:
      return { ...state, error: payload, isLoading: false };
    default:
      return state;
  }
};