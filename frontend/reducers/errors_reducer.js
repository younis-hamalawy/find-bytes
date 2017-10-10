import merge from 'lodash/merge';
import { RECEIVE_ERRORS, CLEAR_ERRORS } from '../actions/query_actions';

const defaultState = {};

const errorsReducer = (state = defaultState, action) => {
  Object.freeze(state);

  switch (action.type) {
    case RECEIVE_ERRORS:
      return merge({}, state, {
        errors: action.errors,
      });
    case CLEAR_ERRORS:
      return merge({}, state, {
        errors: [],
      });
    default:
      return state;
  }
};

export default errorsReducer;
