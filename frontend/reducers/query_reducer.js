import merge from 'lodash/merge';
import { RECEIVE_QUERY } from '../actions/query_actions';

const defaultState = {
};

const queryReducer = (state = defaultState, action) => {
  Object.freeze(state);

  switch (action.type) {
    case RECEIVE_QUERY:
      return merge({}, state, {
        query: action.query,
      });
    default:
      return state;
  }
};

export default queryReducer;
