import { createSelector } from 'reselect';

const selectPaidMembersReducer = (state) => state.paid_members;

export const selectPaidMembersList = createSelector(
  [selectPaidMembersReducer],
  (paidMembersSlice) => paidMembersSlice.paid_members
);

export const selectPaidMembersListIsLoading = createSelector(
  [selectPaidMembersReducer],
  (paidMembersSlice) => paidMembersSlice.isLoading
);