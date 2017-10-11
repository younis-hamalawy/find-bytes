import React from 'react';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      latitude: '',
      longitude: '',
    };

    this.setQuery = this.setQuery.bind(this);
    this.submitQuery = this.submitQuery.bind(this);
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

  setQuery(e) {
    e.preventDefault();
    const query = e.target.value ? e.target.value : '';
    this.setState({ query });
    setTimeout(() => console.log(this.state.query), 0);
  }

  submitQuery(e) {
    e.preventDefault();
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
