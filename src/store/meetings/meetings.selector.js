import { createSelector } from 'reselect';

const selectMeetingsReducer = (state) => state.meetings;

export const selectMeetingsList = createSelector(
  [selectMeetingsReducer],
  (meetingsSlice) => meetingsSlice.meetings
);

export const selectMeetingsListIsLoading = createSelector(
  [selectMeetingsReducer],
  (meetingsSlice) => meetingsSlice.isLoading
);