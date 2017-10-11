import rootReducer from '../reducers/root_reducer';
import { createStore } from 'redux';

describe('Reducers', () => {
  describe('rootReducer', () => {
    let testStore;

    beforeAll(() => {
      testStore = createStore(rootReducer);
    });

    it('exports a function', () => {
      expect(typeof rootReducer).toEqual('function');
    });

    // it('includes the PostsReducer under the key `posts`', () => {
    //   const post = { id: 1, title: 'Root Reducer', content: 'Testing' };
    //   const action = { type: 'RECEIVE_POST', post };
    //   testStore.dispatch(action);

    //   expect(testStore.getState().posts).toEqual(PostsReducer({ [post.id]: post }, action));
    // });
  });
});