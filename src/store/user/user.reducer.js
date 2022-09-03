import { USER_ACTION_TYPES } from './user.types';

const INITIAL_STATE = {
  currentUser: {
    user: null,
    role: 'member',
    name: '',
    grade: '',
    email: '',
    phoneNo: '',
    studentNum: '',
    uid: '',
    paidMember: false,
}
};

export const userReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;

  switch(type){
    case USER_ACTION_TYPES.SET_CURRENT_USER:
      return { ...state, currentUser: payload };
    default:
      return state;
  }
};