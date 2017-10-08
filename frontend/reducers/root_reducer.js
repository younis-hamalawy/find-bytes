import { combineReducers } from 'redux';
import QueryReducer from './query_reducer'

const rootReducer = combineReducers({
  query: queryReducer
  errors: errorsReducer,
});

export default rootReducer;
