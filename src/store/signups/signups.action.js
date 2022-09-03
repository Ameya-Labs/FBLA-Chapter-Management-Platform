import SIGNUPS_ACTION_TYPES from './signups.types';
import { createAction } from '../../utils/reducer/reducer.utils';

import { getSignupsList } from '../../utils/firebase/firebase.utils';

export const fetchSignupsStart = () =>
  createAction(SIGNUPS_ACTION_TYPES.FETCH_SIGNUPS_START);

export const fetchSignupsSuccess = (signupsArray) =>
  createAction(
    SIGNUPS_ACTION_TYPES.FETCH_SIGNUPS_SUCCESS,
    signupsArray
  );

export const fetchSignupsFailure = (error) =>
  createAction(SIGNUPS_ACTION_TYPES.FETCH_SIGNUPS_FAILED, error);

export const fetchSignupsStartAsync = () => {
  return async (dispatch) => {
    dispatch(fetchSignupsStart());
    try {
      const signupsArray = await getSignupsList('signups');

      dispatch(fetchSignupsSuccess(signupsArray));
    } catch (error) {
      dispatch(fetchSignupsFailure(error));
    }
  };
};