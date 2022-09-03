import { createSelector } from 'reselect';

const selectDBStoreReducer = (state) => state.db_store;

export const selectSignupToggle = createSelector(
  [selectDBStoreReducer],
  (dbStoreSlice) => dbStoreSlice.signupToggle
);

export const selectSignupConf = createSelector(
  [selectDBStoreReducer],
  (dbStoreSlice) => dbStoreSlice.signupConf
);

export const selectSignupDate = createSelector(
  [selectDBStoreReducer],
  (dbStoreSlice) => dbStoreSlice.signupDate
);

export const selectCalendarEvents = createSelector(
  [selectDBStoreReducer],
  (dbStoreSlice) => dbStoreSlice.calendar_events
);

export const selectOtherCompetitorsVisible = createSelector(
  [selectDBStoreReducer],
  (dbStoreSlice) => dbStoreSlice.otherCompetitorsVisible
);

export const selectEventResourcesURL = createSelector(
  [selectDBStoreReducer],
  (dbStoreSlice) => dbStoreSlice.eventResourcesURL
);

export const selectDBStoreIsLoading = createSelector(
  [selectDBStoreReducer],
  (dbStoreSlice) => dbStoreSlice.isLoading
);
