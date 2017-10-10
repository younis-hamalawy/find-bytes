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

  componentDidMount() {
    const location = navigator.geolocation;

    location.getCurrentPosition(position => {
      this.setState({ latitude: position.coords.latitude });
      this.setState({ longitude: position.coords.longitude });

      const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: position.coords.latitude, lng: position.coords.longitude },
        zoom: 14,
      });
    });
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
