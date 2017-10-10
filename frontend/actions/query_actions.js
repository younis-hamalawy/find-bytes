import * as QueryAPIUtil from '../util/query_api_util';

export const RECEIVE_QUERY = 'RECEIVE_QUERY';
export const RECEIVE_ERRORS = 'RECEIVE_ERRORS';
export const CLEAR_ERRORS = 'CLEAR_ERRORS';

export const receiveQuery = query => ({
  type: RECEIVE_QUERY,
  query,
});

export const receiveErrors = errors => ({
  type: RECEIVE_ERRORS,
  errors,
});

export const clearErrors = () => ({
  type: CLEAR_ERRORS,
});

export const fetchQueryResults = query => dispatch =>
  QueryAPIUtil.fetchQueryResults(query).then(
    responce => (dispatch(receiveQuery(responce)), dispatch(clearErrors())),
    err => dispatch(receiveErrors(err)),
  );
