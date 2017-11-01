import React from 'react';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: [],
      MARKER_PATH: 'https://developers.google.com/maps/documentation/javascript/images/marker_green',
      hostnameRegexp: new RegExp('^https?://.+?/')
    };

    this.dropMarker = this.dropMarker.bind(this);
    this.clearMarkers = this.clearMarkers.bind(this);
    this.clearResults = this.clearResults.bind(this);
    this.showInfoWindow = this.showInfoWindow.bind(this);
  }

  componentDidMount() {
    var card = document.getElementById('pac-card');
    var input = document.getElementById('pac-input');
    var strictBounds = document.getElementById('strict-bounds-selector');
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
    var autocomplete = new google.maps.places.Autocomplete(input);

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete.bindTo('bounds', map);

    let that = this;

    autocomplete.addListener('place_changed', () => {
      var infoWindow = new google.maps.InfoWindow();
      let infoCont = document.getElementById('infoContent');
      this.setState({infoCont: document.getElementById('infoContent')});
      infoWindow.setContent(infoCont);
      var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
      });
      infoWindow.close();
      marker.setVisible(false);
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        var request = {
          location: map.center,
          radius: '500',
          query: input.value,
          keyword: input.value,
          bounds: map.getBounds()
        };
        that.service = new google.maps.places.PlacesService(map);
        const callback = (results, status) => {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            that.clearResults();
            that.clearMarkers();
            // Create a marker for each establishment found, and
            // assign a letter of the alphabetic to each marker icon.
            let markers =[];

            for (var i = 0; i < results.length; i++) {
              var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
              var markerIcon = that.state.MARKER_PATH + markerLetter + '.png';
              // Use marker animation to drop the icons incrementally on the map.

              markers[i] = new google.maps.Marker({
                position: results[i].geometry.location,
                animation: google.maps.Animation.DROP,
                icon: markerIcon
              });
              let marker = markers[i];
              google.maps.event.addListener(marker, 'click', () => {
                infoWindow.close();
                console.log(infoWindow);
                that.showInfoWindow(i, results[i], marker)
              });
              // If the user clicks an establishment marker, show the details of that place
              // in an info window.
              markers[i].placeResult = results[i];
              setTimeout(that.dropMarker(i), i * 100);
              var results1 = document.getElementById('results');
              var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
              var markerIcon = this.state.MARKER_PATH + markerLetter + '.png';
              var tr = document.createElement('tr');
              tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
              // google.maps.event.addListener(result, 'click', that.showInfoWindow(x, marker, mark));

              tr.onclick = ()  => {
                infoWindow.close();
                google.maps.event.trigger(that.showInfoWindow(i, results[i], marker));
              };

              var iconTd = document.createElement('td');
              var nameTd = document.createElement('td');
              var icon = document.createElement('img');
              var addressTd = document.createElement('td');
              var ratingTd = document.createElement('td');
              var distanceTd = document.createElement('td');
              var timeTd = document.createElement('td');
              var distance = document.createTextNode('');
              var time = document.createTextNode('');
              var name = document.createTextNode(results[i].name);

              icon.src = markerIcon;
              icon.setAttribute('class', 'placeIcon');
              icon.setAttribute('className', 'placeIcon');
              ratingTd.setAttribute('id', `iw-rating${i}`)
              timeTd.setAttribute('id', `iw-time${i}`)
              distanceTd.setAttribute('id', `iw-distance${i}`)
              var service = new google.maps.DistanceMatrixService();
              var date = new Date();
              var DrivingOptions = {
                departureTime: date,
                trafficModel: 'pessimistic'
                };
              var address = '';
              if (results[i].vicinity) {
                address = document.createTextNode(results[i].vicinity.split(',')[0]);
              };
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
              tr.appendChild(timeTd)
              results1.appendChild(tr);
              if (results[i].rating) {
                var ratingHtml = '';
                for (var j = 0; j < 5; j++) {
                  if (results[i].rating < (j + 0.5)) {
                    ratingHtml += '&#10025;';
                  } else {
                    ratingHtml += '&#10029;';
                  }
                  document.getElementById(`iw-rating${i}`).innerHTML = ratingHtml;
                }
              }
              let x = i;
              const response_data = (responseDis, status) => {
              if (status !== google.maps.DistanceMatrixStatus.OK || status != "OK"){
                console.log('Error:', status);
              }else{
                  time = (responseDis.rows[0].elements[0].duration_in_traffic.text);
                  distance = (parseFloat((responseDis.rows[0].elements[0].distance.text).split(' ')[0])/1.6).toFixed(1) + ' mile';
                  document.getElementById(`iw-time${x}`).innerHTML = time;
                  document.getElementById(`iw-distance${x}`).innerHTML = distance;
              }};
              service.getDistanceMatrix(
                {
                  origins: [pos],
                  destinations: [new google.maps.LatLng(results[i].geometry.location.lat(), results[i].geometry.location.lng())],
                  travelMode: 'DRIVING',
                  drivingOptions : DrivingOptions,
                  unitSystem: google.maps.UnitSystem.Imperical,
                  durationInTraffic: true,
                  avoidHighways: false,
                  avoidTolls: false
                }, response_data);
            }
            that.setState({markers});
          }
        };
        that.service.nearbySearch(request, callback);
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        that.clearResults();
        that.clearMarkers();
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(15); // Why 15? Because it looks good.
      }
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }

      infoCont.children['place-icon'].src = place.icon;
      infoCont.children['place-name'].textContent = place.name;
      infoCont.children['place-address'].textContent = address;
      infoWindow.open(map, marker);
    });

    document.getElementById('use-strict-bounds')
      .addEventListener('click', function () {
        autocomplete.setOptions({
          strictBounds: this.checked
        });
      });
  }

  dropMarker(i) {
    let that = this;
    return function () {
      that.state.markers[i].setMap(map);
    };
  }

  clearMarkers() {
    for (var i = 0; i < this.state.markers.length; i++) {
      if (this.state.markers[i]) {
        this.state.markers[i].setMap(null);
      }
    }
    this.state.markers = [];
  }

  clearResults() {
    var results = document.getElementById('results');
    while (results.childNodes[0]) {
      results.removeChild(results.childNodes[0]);
    }
  }

  // Get the place details for a hotel. Show the information in an info window,
  // anchored on the marker for the hotel that the user selected.
  showInfoWindow(i, result, marker) {
    var infoWindow = new google.maps.InfoWindow();
    infoWindow.close();

    let infoCont = document.getElementById('infoContent') || this.state.infoCont;
    infoWindow.setContent(infoCont);
    console.log(infoCont);
    infoCont.children['place-icon'].src = marker.placeResult.icon || result.icon;
    infoCont.children['place-name'].textContent = marker.placeResult.name || result.name;
    infoCont.children['place-address'].textContent = marker.placeResult.vicinity || result.vicinity;
    var address = '';
      // if (place) {
      //   address = [
      //     (place.vicinity || '')
      //   ].join(' ');
      // }
    infoWindow.open(map, marker);
  }

  render() {
    return (
      <div>
        <div className="pac-card" id="pac-card">
          <div>
            <div id="title">
              Welcome to Find Bytes!
            </div>
            <div id="strict-bounds-selector" className="pac-controls">
              <input type="checkbox" id="use-strict-bounds" defaultValue />
              <label htmlFor="use-strict-bounds">Search within window</label>
            </div>
          </div>
          <div id="pac-container">
            <input id="pac-input" type="text" placeholder="Enter a location" />
          </div>
          <div id="listing">
            <table id="resultsTable">
              <tbody id="results"></tbody>
            </table>
          </div>
        </div>
        <div id="infoContent">
          <img src="" width={16} height={16} id="place-icon" />
          <span id="place-name" className="title" /><br />
          <span id="place-address" />
        </div>

      </div>
    );
  }
}

export default Main;