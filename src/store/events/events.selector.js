import { createSelector } from 'reselect';

const selectEventsReducer = (state) => state.events;

export const selectEvents = createSelector(
  [selectEventsReducer],
  (eventsSlice) => eventsSlice.events
);

export const selectEventsIsLoading = createSelector(
  [selectEventsReducer],
  (eventsSlice) => eventsSlice.isLoading
)