

export const RECEIVE_QUERY = 'RECEIVE_QUERY';

export const receiveQuery = query => {
  return {
    type: RECEIVE_QUERY,
    query,
  };
};
