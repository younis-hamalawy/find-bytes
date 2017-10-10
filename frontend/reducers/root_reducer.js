import { combineReducers } from 'redux';
import queryReducer from './query_reducer';
import errorsReducer from './errors_reducer';

const rootReducer = combineReducers({
  query: queryReducer,
  errors: errorsReducer,
});

export default rootReducer;
