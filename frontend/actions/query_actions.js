export const RECEIVE_QUERY = 'RECEIVE_QUERY';

export const receiveQueryY = query => {
  return {
    type: RECEIVE_QUERY,
    query,
  };
};
