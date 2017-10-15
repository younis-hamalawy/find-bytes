import ReactDOM from 'react-dom';

describe('entry', () => {
  let Entry,
      Root,
      renderedRoot;

  beforeAll(() => {
    document.addEventListener = jest.fn();
    document.getElementById = jest.fn(id => id);
    ReactDOM.render = jest.fn();

    Root = require('../components/root');
    Entry = require('../find_bytes.jsx');

    // invoke the callback passed to document.addEventListener
    document.addEventListener.mock.calls[0][1]();
  });

  it('sets a listener for the DOMContentLoaded event', () => {
    const eventListenerCalls = document.addEventListener.mock.calls;

    expect(document.addEventListener).toBeCalled();
    expect(eventListenerCalls[0][0]).toEqual('DOMContentLoaded');
  });

  it('renders the Root component', () => {
    // testing that the first argument passed to `render` is the Root component
    renderedRoot = ReactDOM.render.mock.calls[0][0];
    expect(renderedRoot.type).toEqual(Root.default);
  });

  it('queries for and renders into the root div', () => {
    expect(document.getElementById).toBeCalledWith("root");

    // testing that the second arugument passed to `render` is the root div
    expect(ReactDOM.render.mock.calls[0][1]).toEqual("root");
  });
});