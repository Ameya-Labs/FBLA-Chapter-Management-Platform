import PAID_MEMBERS_ACTION_TYPES from './paid_members.types';

export const EVENTS_INITIAL_STATE = {
  paid_members: [],
  isLoading: false,
  error: null,
};

export const paidMembersReducer = (
  state = EVENTS_INITIAL_STATE,
  action = {}
) => {
  const { type, payload } = action;

  switch (type) {
    case PAID_MEMBERS_ACTION_TYPES.FETCH_PAID_MEMBERS_START:
      return {...state, isLoading: true}
    case PAID_MEMBERS_ACTION_TYPES.FETCH_PAID_MEMBERS_SUCCESS:
      return { ...state, paid_members: payload, isLoading: false };
    case PAID_MEMBERS_ACTION_TYPES.FETCH_PAID_MEMBERS_FAILED:
      return { ...state, error: payload, isLoading: false };
    default:
      return state;
  }
};