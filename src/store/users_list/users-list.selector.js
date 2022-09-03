import { createSelector } from 'reselect';

const selectUsersListReducer = (state) => state.users_list;

export const selectUsersList = createSelector(
  [selectUsersListReducer],
  (usersListSlice) => usersListSlice.users_list
);

export const selectUsersListIsLoading = createSelector(
  [selectUsersListReducer],
  (usersListSlice) => usersListSlice.isLoading
)