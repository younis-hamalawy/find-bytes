import React from 'react';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: [],
      MARKER_PATH: 'https://developers.google.com/maps/documentation/javascript/images/marker_green',
      hostnameRegexp: new RegExp('^https?://.+?/'),
      directionsService: '',
      directionsDisplay: '',
      service: '',
    };

    this.dropMarker = this.dropMarker.bind(this);
    this.clearMarkers = this.clearMarkers.bind(this);
    this.clearResults = this.clearResults.bind(this);
    this.getRoute = this.getRoute.bind(this);
    this.markerClick = this.markerClick.bind(this);
    this.manualSearch = this.manualSearch.bind(this);
    this.makeDetail = this.makeDetail.bind(this);
  }

  componentDidMount() {
    const card = document.getElementById('pac-card');
    const input = document.getElementById('pac-input');
    const strictBounds = document.getElementById('strict-bounds-selector');
    map.controls[google.maps.ControlPosition.TOP].push(card);
    const autocomplete = new google.maps.places.Autocomplete(input);

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete.bindTo('bounds', map);
    const infoWindow = new google.maps.InfoWindow();
    const infoCont = document.getElementById('infoContent');
    this.setState({ infoCont: document.getElementById('infoContent') });
    infoWindow.setContent(infoCont);
    const marker = new google.maps.Marker({
      map,
      anchorPoint: new google.maps.Point(0, -29),
    });

    // Use Google direction service to get routes,
    // and draw them on the map when the user clicks a marker.
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });
    const infoWindow2 = new google.maps.InfoWindow();

    autocomplete.addListener('place_changed', () => {
      infoWindow.close();
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        this.manualSearch(infoWindow, infoWindow2, input, marker);
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry) {
        this.clearResults();
        this.clearMarkers();
        const listing = document.getElementById('listing');
        listing.style.padding = '0';
        listing.style.border = 'none';
        listing.style.boxShadow = 'none';
        listing.style.width = '42em';
        listing.style.background = 'transparent';
      }

      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      let address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name) || '',
          (place.address_components[1] && place.address_components[1].short_name) || '',
          (place.address_components[2] && place.address_components[2].short_name) || '',
        ].join(' ');
      }

      infoCont.children['place-icon'].src = place.icon;
      infoCont.children['place-name'].textContent = place.name;
      infoCont.children['place-address'].textContent = address;
      if (pos) {
        this.getRoute(place, infoWindow2);
      }
      infoWindow.open(map, marker);
    });

    document.getElementById('use-strict-bounds').addEventListener('click', () => {
      console.log(autocomplete);
      if (autocomplete.strictBounds === true) {
        autocomplete.setOptions({
          strictBounds: false,
        });
      } else {
        autocomplete.setOptions({
          strictBounds: true,
        });
      }
      console.log(autocomplete);
    });
  }

  getRoute(place, infoWindow2) {
    this.directionsService.route(
      {
        origin: pos,
        destination: new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()),
        travelMode: 'BICYCLING',
      },
      (response, status) => {
        if (status === 'OK') {
          this.directionsDisplay.setMap(map);
          this.directionsDisplay.setDirections(response);
          if (response.routes[0].legs[0].steps.length === 0) {
            return;
          }
          let startLatlng = 0,
            endLatlng = 0,
            distance = 0;
          for (let j = 0; j < response.routes[0].legs[0].steps.length; j++) {
            if (response.routes[0].legs[0].steps[j].distance.value > distance) {
              distance = response.routes[0].legs[0].steps[j].distance.value;
              startLatlng = [
                response.routes[0].legs[0].steps[j].start_point.lat(),
                response.routes[0].legs[0].steps[j].start_point.lng(),
              ];
              endLatlng = [
                response.routes[0].legs[0].steps[j].end_point.lat(),
                response.routes[0].legs[0].steps[j].end_point.lng(),
              ];
            }
          }
          const inBetween = google.maps.geometry.spherical.interpolate(
            new google.maps.LatLng(startLatlng[0], startLatlng[1]),
            new google.maps.LatLng(endLatlng[0], endLatlng[1]),
            0.5,
          );
          infoWindow2.setPosition(inBetween);
          infoWindow2.setContent(`${response.routes[0].legs[0].distance.text}<br>${response.routes[0].legs[0].duration.text} `,);
          infoWindow2.open(map);
        } else {
          window.alert(`Directions request failed due to ${status}`);
        }
      },
    );
  }

  getDistance(result, i) {
    const service = new google.maps.DistanceMatrixService();
    const date = new Date();
    const DrivingOptions = {
      departureTime: date,
      trafficModel: 'pessimistic',
    };
    const responseData = (responseDis, status) => {
      if (status !== google.maps.DistanceMatrixStatus.OK || status != 'OK') {
        console.log('Error:', status);
      } else {
        const time = responseDis.rows[0].elements[0].duration.text;
        const distance = `${(parseFloat(responseDis.rows[0].elements[0].distance.text.split(' ')[0]) / 1.6).toFixed(1,)} mile`;
        document.getElementById(`iw-time${i}`).innerHTML = time;
        document.getElementById(`iw-distance${i}`).innerHTML = distance;
      }
    };
    if (pos) {
      service.getDistanceMatrix(
        {
          origins: [pos],
          destinations: [new google.maps.LatLng(result.geometry.location.lat(), result.geometry.location.lng())],
          travelMode: 'BICYCLING',
          drivingOptions: DrivingOptions,
          unitSystem: google.maps.UnitSystem.Imperical,
          // duration_in_traffic: true,
          avoidHighways: false,
          avoidTolls: false,
        },
        responseData,
      );
    }
  }

  manualSearch(infoWindow, infoWindow2, input, marker) {
    infoWindow2.close();
    this.directionsDisplay.setDirections({ routes: [] });
    this.directionsDisplay.setMap(map);
    const request = {
      location: map.center,
      radius: '500',
      query: input.value,
      keyword: input.value,
      bounds: map.getBounds(),
    };
    this.service = new google.maps.places.PlacesService(map);
    const callback = (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        this.clearResults();
        this.clearMarkers();
        const markers = [];
        marker.setVisible(false);
        // Create a marker for each establishment found, and
        // assign a letter of the alphabetic to each marker icon.
        for (let i = 0; i < results.length; i++) {
          let markerLetter = String.fromCharCode('A'.charCodeAt(0) + i % 26);
          let markerIcon = `${this.state.MARKER_PATH + markerLetter}.png`;
          const infowindow = new google.maps.InfoWindow({
            content: '',
          });
          markers[i] = new google.maps.Marker({
            position: results[i].geometry.location,
            animation: google.maps.Animation.DROP,
            icon: markerIcon,
          });
          const oneMarker = markers[i];
          if (oneMarker) {
            const listing = document.getElementById('listing');
            listing.style.padding = '1em 0.5em 1em 1em';
            listing.style.border = '0.1em solid #626962';
            listing.style.boxShadow = 'inset 0 0 0 0.1em #272727';
            listing.style.width = '40em';
            listing.style.background = 'rgba(255, 255, 255, 0.7)';
          }
          // If the user clicks an establishment marker, show the details of that place
          // in an info window.
          google.maps.event.addListener(oneMarker, 'click', () => {
            this.markerClick(infoWindow, infoWindow2, oneMarker);
            if (pos) {
              this.getRoute(results[i], infoWindow2);
            }
          });

          markers[i].placeResult = results[i];
          markerLetter = String.fromCharCode('A'.charCodeAt(0) + i % 26);
          markerIcon = `${this.state.MARKER_PATH + markerLetter}.png`;
          const tr = document.createElement('tr');

          // If the user clicks an establishment marker, show the details of that place
          // in an info window.
          tr.onclick = () => {
            this.markerClick(infoWindow, infoWindow2, oneMarker);
            if (pos) {
              this.getRoute(results[i], infoWindow2);
            }
          };

          this.makeDetail(results[i], i, tr, markerIcon);
        }
        this.setState({ markers });
        // Use marker animation to drop the icons incrementally on the map.
        for (let i = 0; i < results.length; i++) {
          setTimeout(this.dropMarker(i), i * 100);
        }
      }
    };
    this.service.nearbySearch(request, callback);
  }

  makeDetail(result, i, tr, markerIcon) {
    const results1 = document.getElementById('results');
    const iconTd = document.createElement('td');
    const nameTd = document.createElement('td');
    const icon = document.createElement('img');
    const addressTd = document.createElement('td');
    const ratingTd = document.createElement('td');
    const distanceTd = document.createElement('td');
    const timeTd = document.createElement('td');
    const distance = document.createTextNode('');
    const time = document.createTextNode('');
    const name = document.createTextNode(result.name);

    icon.src = markerIcon;
    icon.setAttribute('class', 'placeIcon');
    icon.setAttribute('className', 'placeIcon');
    ratingTd.setAttribute('id', `iw-rating${i}`);
    timeTd.setAttribute('id', `iw-time${i}`);
    distanceTd.setAttribute('id', `iw-distance${i}`);
    let address = '';
    if (result.vicinity) {
      address = document.createTextNode(result.vicinity.split(',')[0]);
    }
    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    addressTd.appendChild(address);
    distanceTd.appendChild(distance);
    timeTd.appendChild(time);
    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    tr.appendChild(addressTd);
    tr.appendChild(ratingTd);
    tr.appendChild(distanceTd);
    tr.appendChild(timeTd);
    results1.appendChild(tr);
    if (result.rating) {
      let ratingHtml = '';
      for (let j = 0; j < 5; j++) {
        if (result.rating < j + 0.5) {
          ratingHtml += '&#10025;';
        } else {
          ratingHtml += '&#10029;';
        }
        document.getElementById(`iw-rating${i}`).innerHTML = ratingHtml;
      }
    }
    this.getDistance(result, i);
  }

  markerClick(infoWindow, infoWindow2, oneMarker) {
    infoWindow.close();
    const infoCont = document.getElementById('infoContent') || this.state.infoCont;
    infoWindow.setContent(infoCont);
    infoCont.children['place-icon'].src = oneMarker.placeResult.icon || results[i].icon;
    infoCont.children['place-name'].textContent = oneMarker.placeResult.name || results[i].name;
    let address = '';
    if (oneMarker.placeResult.vicinity) {
      address = [oneMarker.placeResult.vicinity.split(',')[0] || ''].join(' ');
    } else if (results[i].vicinity) {
      address = [results[i].vicinity.split(',')[0] || ''].join(' ');
    }
    infoCont.children['place-address'].textContent = address;
    infoWindow.open(map, oneMarker);
    google.maps.event.addListenerOnce(map, 'bounds_changed', (event) => {
      if (map.getZoom() > 15) {
        map.setZoom(15);
        map.setCenter(infoWindow2.getPosition());
        map.panBy(0, -200);
      }
    });
  }

  dropMarker(i) {
    return () => {
      this.state.markers[i].setMap(map);
    };
  }

  clearMarkers() {
    for (let i = 0; i < this.state.markers.length; i++) {
      if (this.state.markers[i]) {
        this.state.markers[i].setMap(null);
      }
    }
    this.state.markers = [];
  }

  clearResults() {
    const results = document.getElementById('results');
    while (results.childNodes[0]) {
      results.removeChild(results.childNodes[0]);
    }
  }

  render() {
    return (
      <div>
        <div id="pac-card">
          <div id="title">
            <p id="para">goFind!</p>
          </div>
          <div id="pac-container">
            <input id="pac-input" type="text" placeholder="What are you looking for?" />
            <p>Search within</p>
            <input type="checkbox" id="use-strict-bounds" />
          </div>
          <div id="listing">
            <table id="resultsTable">
              <tbody id="results" />
            </table>
          </div>
        </div>
        <div id="infoContent">
          <img src="" width={16} height={16} id="place-icon" />
          <span id="place-name" className="title" />
          <br />
          <span id="place-address" />
        </div>
      </div>
    );
  }
}

export default Main;
