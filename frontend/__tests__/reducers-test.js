/* globals jest */

import queryReducer from '../reducers/query_reducer';
import rootReducer from '../reducers/root_reducer';
import { createStore } from 'redux';

describe('Reducers', () => {
  describe('queryReducer', () => {
    it('exports a function', () => {
      expect(typeof queryReducer).toEqual('function');
    });

    it('should initialize with an empty object as the default state', () => {
      expect(queryReducer(undefined, {})).toEqual({});
    });

    it('should return the previous state if an action is not matched', () => {
      const oldState = { 1: 'oldState' };
      const newState = queryReducer(oldState, { type: 'unmatchedtype' });
      expect(newState).toEqual(oldState);
    });
  });


  describe('handling the RECEIVE_QUERY action', () => {
    let action,
        testQuery;

    beforeEach(() => {

      action = {
        type: 'RECEIVE_QUERY',
        query: testQuery
      };
    });

    it('should replace the state with the action\'s query', () => {
      const state = queryReducer(undefined, action);
      expect(state.query).toEqual(testQuery);
    });

    it('should not modify the old state', () => {
      let oldState = { 1: 'oldState' };
      queryReducer(oldState, action);
      expect(oldState).toEqual({ 1: 'oldState' });
    });
  });

  describe('rootReducer', () => {
    let testStore;

    beforeAll(() => {
      testStore = createStore(rootReducer);
    });

    it('exports a function', () => {
      expect(typeof rootReducer).toEqual('function');
    });

    it('includes the queryReducer under the key `query`', () => {
      const query = { query: 'root Reducer', content: 'Testing' };
      const action = { type: 'RECEIVE_QUERY', query };
      testStore.dispatch(action);

      expect(testStore.getState().query).toEqual(queryReducer({ query: query }, action));
    });
  });
});