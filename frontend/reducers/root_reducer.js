import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  errors: errorsReducer,
});

export default rootReducer;
