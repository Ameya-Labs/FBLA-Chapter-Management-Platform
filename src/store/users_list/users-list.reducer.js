import USERS_LIST_ACTION_TYPES from './users-list.types';

export const USERS_LIST_INITIAL_STATE = {
  users_list: [],
  isLoading: false,
  error: null,
};

export const usersListReducer = (
  state = USERS_LIST_INITIAL_STATE,
  action = {}
) => {
  const { type, payload } = action;

  switch (type) {
    case USERS_LIST_ACTION_TYPES.FETCH_USERS_LIST_START:
      return { ...state, isLoading: true }
    case USERS_LIST_ACTION_TYPES.FETCH_USERS_LIST_SUCCESS:
      return { ...state, users_list: payload, isLoading: false };
    case USERS_LIST_ACTION_TYPES.FETCH_USERS_LIST_FAILED:
      return { ...state, error: payload, isLoading: false };
    default:
      return state;
  }
};