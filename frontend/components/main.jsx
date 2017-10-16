import React from 'react';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      map: '',
      query: '',
      latitude: '',
      longitude: '',
    };

    this.setQuery = this.setQuery.bind(this);
    this.submitQuery = this.submitQuery.bind(this);
    this.createMarker = this.createMarker.bind(this);
    // google.maps.event.addListener(map,'bounds_changed', function() {
    //   autocomplete.bindTo(map, 'bounds');
    // });
  }

  componentDidMount() {
    const currentLocation = navigator.geolocation;
    currentLocation.getCurrentPosition(position => {
      this.setState({ latitude: position.coords.latitude });
      this.setState({ longitude: position.coords.longitude });

      let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      this.setState({map: new google.maps.Map(document.getElementById('map'), {
        center: { lat: position.coords.latitude, lng: position.coords.longitude },
        zoom: 14,
      })})
    });
  }

  setQuery(e) {
    e.preventDefault();
    const query = e.currentTarget.value ? e.currentTarget.value : '';
    this.setState({ query });
  }

  createMarker(result, map) {
    let marker = new google.maps.Marker({
      position: result.geometry.location,
      // label: {
      //   color: "black",
      //   fontFamily: "Helvetica",
      //   text: "$"+String(home.price),
      //   fontSize: "15px",
      //   fontWeight: "600"
      // },
      anchor: new google.maps.Point(500, 10),
      // icon: {url: image, origin: new google.maps.Point(0,-3)},
      animation: google.maps.Animation.DROP,
      map: map
    });
  }

  submitQuery(e) {
    e.preventDefault();
    var map;
    var service;
    var infowindow;
    let that = this;
    initialize();
    function initialize() {
      var pyrmont = new google.maps.LatLng(that.state.latitude,that.state.longitude);

      map = new google.maps.Map(document.getElementById('map'), {
          center: pyrmont,
          zoom: 15
        });

      var request = {
        location: pyrmont,
        radius: '500',
        query: that.state.query,
          keyword: that.state.query,
        // type: ['restaurant']
      };

      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);
    }

    function callback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          var place = results[i];
          that.createMarker(results[i], map);
        }
      }
    }
  }


  render() {
    return (
      <div>
        <h1>Welcome to Find Bytes!</h1>
        <form onSubmit={this.submitQuery}>
          <label>
            <input onChange={this.setQuery} type="text" value={this.state.query} />
          </label>

          <input type="submit" value="Search" />
        </form>
      </div>
    );
  }
}

export default Main;
