import DB_STORE_ACTION_TYPES from './db_store.types';

export const DB_STORE_INITIAL_STATE = {
  signupToggle: false,
  signupConf: "",
  signupDate: "",
  calendar_events: [],
  otherCompetitorsVisible: false,
  eventResourcesURL: "",
  isLoading: false,
  error: null,
};

export const dbStoreReducer = (
  state = DB_STORE_INITIAL_STATE,
  action = {}
) => {
  const { type, payload } = action;

  switch (type) {
    case DB_STORE_ACTION_TYPES.FETCH_DB_STORE_START:
      return {...state, isLoading: true}
    case DB_STORE_ACTION_TYPES.FETCH_DB_STORE_SUCCESS:
      const {signupConf, signupToggle, signupDate, calendar_events, otherCompetitorsVisible, eventResourcesURL} = payload.db_store
      return { ...state, signupToggle: signupToggle, signupConf: signupConf, signupDate: signupDate, calendar_events: calendar_events, otherCompetitorsVisible: otherCompetitorsVisible, eventResourcesURL: eventResourcesURL, isLoading: false };
    case DB_STORE_ACTION_TYPES.FETCH_DB_STORE_FAILED:
      return { ...state, error: payload, isLoading: false };
    default:
      return state;
  }
};