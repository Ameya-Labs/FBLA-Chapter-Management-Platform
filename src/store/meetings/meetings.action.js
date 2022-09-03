import MEETINGS_ACTION_TYPES from './meetings.types';
import { createAction } from '../../utils/reducer/reducer.utils';

import { getMeetingsList } from '../../utils/firebase/firebase.utils';

export const fetchMeetingsStart = () =>
  createAction(MEETINGS_ACTION_TYPES.FETCH_MEETINGS_START);

export const fetchMeetingsSuccess = (meetingsArray) =>
  createAction(
    MEETINGS_ACTION_TYPES.FETCH_MEETINGS_SUCCESS,
    meetingsArray
  );

export const fetchMeetingsFailure = (error) =>
  createAction(MEETINGS_ACTION_TYPES.FETCH_MEETINGS_FAILED, error);

export const fetchMeetingsStartAsync = () => {
  return async (dispatch) => {
    dispatch(fetchMeetingsStart());
    try {
      const meetingsArray = await getMeetingsList('meetings');
      dispatch(fetchMeetingsSuccess(meetingsArray));
    } catch (error) {
      dispatch(fetchMeetingsFailure(error));
    }
  };
};