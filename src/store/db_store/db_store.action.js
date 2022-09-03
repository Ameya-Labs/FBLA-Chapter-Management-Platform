import DB_STORE_ACTION_TYPES from './db_store.types';
import { createAction } from '../../utils/reducer/reducer.utils';

import { getDBStore } from '../../utils/firebase/firebase.utils';

export const fetchDBStoreStart = () =>
  createAction(DB_STORE_ACTION_TYPES.FETCH_DB_STORE_START);

export const fetchDBStoreSuccess = (db_store) => 
  createAction(
    DB_STORE_ACTION_TYPES.FETCH_DB_STORE_SUCCESS,
    db_store
  );
  
export const fetchDBStoreFailure = (error) =>
  createAction(DB_STORE_ACTION_TYPES.FETCH_DB_STORE_FAILED, error);

export const fetchDBStoreStartAsync = () => {
  return async (dispatch) => {
    dispatch(fetchDBStoreStart());
    try {
      const db_store = await getDBStore();

      dispatch(fetchDBStoreSuccess({ db_store }));
    } catch (error) {
      dispatch(fetchDBStoreFailure(error));
    }
  };
};