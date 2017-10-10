import React from 'react';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      latitude: '',
      longitude: '',
    };
  }

  render() {
    return (
      <div>
        <h1>Welcome to Find Bytes!</h1>
      </div>
    );
  }
}

export default Main;
