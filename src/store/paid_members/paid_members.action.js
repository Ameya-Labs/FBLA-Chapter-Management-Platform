import PAID_MEMBERS_ACTION_TYPES from './paid_members.types';
import { createAction } from '../../utils/reducer/reducer.utils';

import { getPaidMembersList } from '../../utils/firebase/firebase.utils';

export const fetchPaidMembersStart = () =>
  createAction(PAID_MEMBERS_ACTION_TYPES.FETCH_PAID_MEMBERS_START);

export const fetchPaidMembersSuccess = (paidMembersArray) =>
  createAction(
    PAID_MEMBERS_ACTION_TYPES.FETCH_PAID_MEMBERS_SUCCESS,
    paidMembersArray
  );

export const fetchPaidMembersFailure = (error) =>
  createAction(PAID_MEMBERS_ACTION_TYPES.FETCH_PAID_MEMBERS_FAILED, error);

export const fetchPaidMembersStartAsync = () => {
  return async (dispatch) => {
    dispatch(fetchPaidMembersStart());
    try {
      const paidMembersArray = await getPaidMembersList('paid_members');
      dispatch(fetchPaidMembersSuccess(paidMembersArray));
    } catch (error) {
      dispatch(fetchPaidMembersFailure(error));
    }
  };
};