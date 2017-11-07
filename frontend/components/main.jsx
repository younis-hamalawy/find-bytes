import React from 'react';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: [],
      MARKER_PATH: 'https://developers.google.com/maps/documentation/javascript/images/marker_green',
      hostnameRegexp: new RegExp('^https?://.+?/'),
    };

    this.dropMarker = this.dropMarker.bind(this);
    this.clearMarkers = this.clearMarkers.bind(this);
    this.clearResults = this.clearResults.bind(this);
  }

  componentDidMount() {
    let card = document.getElementById('pac-card');
    let input = document.getElementById('pac-input');
    let strictBounds = document.getElementById('strict-bounds-selector');
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
    let autocomplete = new google.maps.places.Autocomplete(input);

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete.bindTo('bounds', map);
    let infoWindow = new google.maps.InfoWindow();
    let infoCont = document.getElementById('infoContent');
    this.setState({ infoCont: document.getElementById('infoContent') });
    infoWindow.setContent(infoCont);
    let marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29),
    });
    let directionsService = new google.maps.DirectionsService();
    let directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });
    let infowindow2 = new google.maps.InfoWindow();

    let that = this;

    autocomplete.addListener('place_changed', () => {
      infoWindow.close();
      let place = autocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        infowindow2.close();
        directionsDisplay.setDirections({ routes: [] });
        directionsDisplay.setMap(map);
        let request = {
          location: map.center,
          radius: '500',
          query: input.value,
          keyword: input.value,
          bounds: map.getBounds(),
        };
        that.service = new google.maps.places.PlacesService(map);
        const callback = (results, status) => {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            that.clearResults();
            that.clearMarkers();
            let markers = [];
            marker.setVisible(false);
            // Create a marker for each establishment found, and
            // assign a letter of the alphabetic to each marker icon.
            for (let i = 0; i < results.length; i++) {
              let markerLetter = String.fromCharCode('A'.charCodeAt(0) + i % 26);
              let markerIcon = that.state.MARKER_PATH + markerLetter + '.png';
              // Use marker animation to drop the icons incrementally on the map.
              let infowindow = new google.maps.InfoWindow({
                content: '',
              });
              markers[i] = new google.maps.Marker({
                position: results[i].geometry.location,
                animation: google.maps.Animation.DROP,
                icon: markerIcon,
              });
              let marker = markers[i];
              if (marker) {
                let listing = document.getElementById('listing');
                listing.style.padding = '15px 0 15px 15px';
                listing.style.border = '1px solid #626962';
                listing.style.boxShadow = 'inset 0 0 0 1px #272727';
                listing.style.width = '488px';
                listing.style.background = '#ffffffa3';
              }
              // If the user clicks an establishment marker, show the details of that place
              // in an info window.
              google.maps.event.addListener(marker, 'click', () => {
                infoWindow.close();
                let infoCont = document.getElementById('infoContent') || this.state.infoCont;
                infoWindow.setContent(infoCont);
                infoCont.children['place-icon'].src = marker.placeResult.icon || results[i].icon;
                infoCont.children['place-name'].textContent = marker.placeResult.name || results[i].name;
                let address = '';
                if (marker.placeResult.vicinity) {
                  address = [marker.placeResult.vicinity.split(',')[0] || ''].join(' ');
                } else if (results[i].vicinity) {
                  address = [results[i].vicinity.split(',')[0] || ''].join(' ');
                }
                infoCont.children['place-address'].textContent = address;

                directionsService.route(
                  {
                    origin: pos,
                    destination: new google.maps.LatLng(
                      marker.placeResult.geometry.location.lat(),
                      marker.placeResult.geometry.location.lng(),
                    ),
                    travelMode: 'BICYCLING',
                  },
                  function(response, status) {
                    if (status === 'OK') {
                      directionsDisplay.setDirections(response);
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
                      let inBetween = google.maps.geometry.spherical.interpolate(
                        new google.maps.LatLng(startLatlng[0], startLatlng[1]),
                        new google.maps.LatLng(endLatlng[0], endLatlng[1]),
                        0.5,
                      );
                      infowindow2.setPosition(inBetween);
                      infowindow2.setContent(
                        response.routes[0].legs[0].distance.text +
                          '<br>' +
                          response.routes[0].legs[0].duration.text +
                          ' ',
                      );
                      infowindow2.open(map);
                    } else {
                      window.alert('Directions request failed due to ' + status);
                    }
                  },
                );
                infoWindow.open(map, marker);
                google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
                  if (this.getZoom() > 15) {
                    this.setZoom(15);
                    this.setCenter(infowindow2.getPosition());
                    map.panBy(0, -200);
                  }
                });
              });

              markers[i].placeResult = results[i];

              let results1 = document.getElementById('results');
              markerLetter = String.fromCharCode('A'.charCodeAt(0) + i % 26);
              markerIcon = this.state.MARKER_PATH + markerLetter + '.png';
              let tr = document.createElement('tr');

              // If the user clicks an establishment marker, show the details of that place
              // in an info window.
              tr.onclick = () => {
                infoWindow.close();
                let infoCont = document.getElementById('infoContent') || this.state.infoCont;
                infoWindow.setContent(infoCont);
                infoCont.children['place-icon'].src = marker.placeResult.icon || results[i].icon;
                infoCont.children['place-name'].textContent = marker.placeResult.name || results[i].name;
                let address = '';
                if (marker.placeResult.vicinity) {
                  address = [marker.placeResult.vicinity.split(',')[0] || ''].join(' ');
                } else if (results[i].vicinity) {
                  address = [results[i].vicinity.split(',')[0] || ''].join(' ');
                }
                infoCont.children['place-address'].textContent = address;

                if (pos) {
                  directionsService.route(
                    {
                      origin: pos,
                      destination: new google.maps.LatLng(
                        marker.placeResult.geometry.location.lat(),
                        marker.placeResult.geometry.location.lng(),
                      ),
                      travelMode: 'BICYCLING',
                    },
                    function(response, status) {
                      if (status === 'OK') {
                        directionsDisplay.setDirections(response);
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
                        let inBetween = google.maps.geometry.spherical.interpolate(
                          new google.maps.LatLng(startLatlng[0], startLatlng[1]),
                          new google.maps.LatLng(endLatlng[0], endLatlng[1]),
                          0.5,
                        );
                        infowindow2.setPosition(inBetween);
                        infowindow2.setContent(
                          response.routes[0].legs[0].distance.text +
                            '<br>' +
                            response.routes[0].legs[0].duration.text +
                            ' ',
                        );
                        infowindow2.open(map);
                      } else {
                        window.alert('Directions request failed due to ' + status);
                      }
                    },
                  );
                }
                infoWindow.open(map, marker);
                google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
                  if (this.getZoom() > 15) {
                    this.setZoom(15);
                    this.setCenter(infowindow2.getPosition());
                    map.panBy(0, -200);
                  }
                });
              };

              let iconTd = document.createElement('td');
              let nameTd = document.createElement('td');
              let icon = document.createElement('img');
              let addressTd = document.createElement('td');
              let ratingTd = document.createElement('td');
              let distanceTd = document.createElement('td');
              let timeTd = document.createElement('td');
              let distance = document.createTextNode('');
              let time = document.createTextNode('');
              let name = document.createTextNode(results[i].name);

              icon.src = markerIcon;
              icon.setAttribute('class', 'placeIcon');
              icon.setAttribute('className', 'placeIcon');
              ratingTd.setAttribute('id', `iw-rating${i}`);
              timeTd.setAttribute('id', `iw-time${i}`);
              distanceTd.setAttribute('id', `iw-distance${i}`);
              let service = new google.maps.DistanceMatrixService();
              let date = new Date();
              let DrivingOptions = {
                departureTime: date,
                trafficModel: 'pessimistic',
              };
              let address = '';
              if (results[i].vicinity) {
                address = document.createTextNode(results[i].vicinity.split(',')[0]);
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
              if (results[i].rating) {
                let ratingHtml = '';
                for (let j = 0; j < 5; j++) {
                  if (results[i].rating < j + 0.5) {
                    ratingHtml += '&#10025;';
                  } else {
                    ratingHtml += '&#10029;';
                  }
                  document.getElementById(`iw-rating${i}`).innerHTML = ratingHtml;
                }
              }

              let x = i;
              const response_data = (responseDis, status) => {
                if (status !== google.maps.DistanceMatrixStatus.OK || status != 'OK') {
                  console.log('Error:', status);
                } else {
                  time = responseDis.rows[0].elements[0].duration.text;
                  distance =
                    (parseFloat(responseDis.rows[0].elements[0].distance.text.split(' ')[0]) / 1.6).toFixed(1) +
                    ' mile';
                  document.getElementById(`iw-time${x}`).innerHTML = time;
                  document.getElementById(`iw-distance${x}`).innerHTML = distance;
                }
              };
              if (pos) {
                service.getDistanceMatrix(
                  {
                    origins: [pos],
                    destinations: [
                      new google.maps.LatLng(results[i].geometry.location.lat(), results[i].geometry.location.lng()),
                    ],
                    travelMode: 'BICYCLING',
                    drivingOptions: DrivingOptions,
                    unitSystem: google.maps.UnitSystem.Imperical,
                    // duration_in_traffic: true,
                    avoidHighways: false,
                    avoidTolls: false,
                  },
                  response_data,
                );
              }
            }
            that.setState({ markers });
            for (let i = 0; i < results.length; i++) {
              setTimeout(that.dropMarker(i), i * 100);
            }
          }
        };
        that.service.nearbySearch(request, callback);
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        that.clearResults();
        that.clearMarkers();
        let listing = document.getElementById('listing');
        listing.style.padding = '0';
        listing.style.border = 'none';
        listing.style.boxShadow = 'none';
        listing.style.width = '518px';
        listing.style.background = 'transparent';
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(15); // Why 15? Because it looks good.
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
        directionsService.route(
          {
            origin: pos,
            destination: new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()),
            travelMode: 'BICYCLING',
          },
          function(response, status) {
            if (status === 'OK') {
              directionsDisplay.setMap(map);
              directionsDisplay.setDirections(response);
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
              let inBetween = google.maps.geometry.spherical.interpolate(
                new google.maps.LatLng(startLatlng[0], startLatlng[1]),
                new google.maps.LatLng(endLatlng[0], endLatlng[1]),
                0.5,
              );
              infowindow2.setPosition(inBetween);
              infowindow2.setContent(
                response.routes[0].legs[0].distance.text + '<br>' + response.routes[0].legs[0].duration.text + ' ',
              );
              infowindow2.open(map);
            } else {
              window.alert('Directions request failed due to ' + status);
            }
          },
        );
      }

      infoWindow.open(map, marker);
      google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
        if (this.getZoom() > 15) {
          this.setZoom(15);
          this.setCenter(infowindow2.getPosition());
          map.panBy(0, -200);
        }
      });
    });

    document.getElementById('use-strict-bounds').addEventListener('click', function() {
      autocomplete.setOptions({
        strictBounds: this.checked,
      });
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
    let results = document.getElementById('results');
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
