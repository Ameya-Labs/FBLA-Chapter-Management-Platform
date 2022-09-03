import { combineReducers } from 'redux';

import { userReducer } from './user/user.reducer';
import { eventsReducer } from './events/events.reducer';
import { usersListReducer } from './users_list/users-list.reducer';
import { dbStoreReducer } from './db_store/db_store.reducer';
import { signupsReducer } from './signups/signups.reducer';
import { paidMembersReducer } from './paid_members/paid_members.reducer';
import { meetingsReducer } from './meetings/meetings.reducer';

export const rootReducer = combineReducers({
  user: userReducer,
  events: eventsReducer,
  users_list: usersListReducer,
  db_store: dbStoreReducer,
  signups: signupsReducer,
  paid_members: paidMembersReducer,
  meetings: meetingsReducer,
}); 