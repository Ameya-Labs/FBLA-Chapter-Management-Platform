import USERS_LIST_ACTION_TYPES from './users-list.types';
import { createAction } from '../../utils/reducer/reducer.utils';

import { getUsersList } from '../../utils/firebase/firebase.utils';

export const fetchUsersListStart = () =>
  createAction(USERS_LIST_ACTION_TYPES.FETCH_USERS_LIST_START);

export const fetchUsersListSuccess = (usersArray) =>
  createAction(
    USERS_LIST_ACTION_TYPES.FETCH_USERS_LIST_SUCCESS,
    usersArray
  );

export const fetchUsersListFailure = (error) =>
  createAction(USERS_LIST_ACTION_TYPES.FETCH_USERS_LIST_FAILED, error);

export const fetchUsersListStartAsync = () => {
  return async (dispatch) => {
    dispatch(fetchUsersListStart());
    try {
      const usersArray = await getUsersList();
      dispatch(fetchUsersListSuccess(usersArray));
    } catch (error) {
      dispatch(fetchUsersListFailure(error));
    }
  };
};