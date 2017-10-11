 test('should initialize with an empty object as the default state', () => {
    expect(QueryReducer(undefined, {})).toEqual({});
  });