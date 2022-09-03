import { createSelector } from 'reselect';

const selectSignupsReducer = (state) => state.signups;

export const selectSignups = createSelector(
  [selectSignupsReducer],
  (signupsSlice) => signupsSlice.signups
);

export const selectSignupsIsLoading = createSelector(
  [selectSignupsReducer],
  (signupsSlice) => signupsSlice.isLoading
)