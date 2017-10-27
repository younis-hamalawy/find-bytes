import React from 'react';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      map: '',
      markers: [],
      service: '',
      strictBounds: '',
      marker: '',
      infowindow: '',
      infowindowContent: '',
      place: '',
      MARKER_PATH: 'https://developers.google.com/maps/documentation/javascript/images/marker_green',
      hostnameRegexp: new RegExp('^https?://.+?/')
    };

    this.addResult = this.addResult.bind(this);
    this.dropMarker = this.dropMarker.bind(this);
    this.clearMarkers = this.clearMarkers.bind(this);
    this.clearResults = this.clearResults.bind(this);
    this.showInfoWindow = this.showInfoWindow.bind(this);
  }

  componentDidMount() {
    var card = document.getElementById('pac-card');
    var input = document.getElementById('pac-input');
    var types = document.getElementById('type-selector');
    var strictBounds = document.getElementById('strict-bounds-selector');

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

    var autocomplete = new google.maps.places.Autocomplete(input);

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();

    var infoContent = document.getElementById('infoContent');
    infowindow.setContent(infoContent);
    var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });
    let that = this;

    autocomplete.addListener('place_changed', function () {

      infowindow.close();
      marker.setVisible(false);
      var place = autocomplete.getPlace();
      if (!place.geometry) {

        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        // window.alert("No details available for input: '" + place.name + "'");
        // this.submitQuery(input)
        var request = {
          location: map.center,
          radius: '500',
          query: input.value,
          keyword: input.value,
          // type: ['restaurant']
          bounds: map.getBounds()
        };
        that.service = new google.maps.places.PlacesService(map);
        that.service.nearbySearch(request, callback);
        let then = that;

        function callback(results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            then.clearResults();
            then.clearMarkers();
            // Create a marker for each hotel found, and
            // assign a letter of the alphabetic to each marker icon.
            for (var i = 0; i < results.length; i++) {
              var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
              var markerIcon = then.state.MARKER_PATH + markerLetter + '.png';
              // Use marker animation to drop the icons incrementally on the map.
              then.state.markers[i] = new google.maps.Marker({
                position: results[i].geometry.location,
                animation: google.maps.Animation.DROP,
                icon: markerIcon
              });
              // If the user clicks a hotel marker, show the details of that hotel
              // in an info window.
              then.state.markers[i].placeResult = results[i];
              google.maps.event.addListener(then.state.markers[i], 'click', then.showInfoWindow(i));
              setTimeout(then.dropMarker(i), i * 100);
              then.addResult(results[i], i);
            }
          }
        };
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

      infoContent.children['place-icon'].src = place.icon;
      infoContent.children['place-name'].textContent = place.name;
      infoContent.children['place-address'].textContent = address;
      infowindow.open(map, marker);
    });

    document.getElementById('use-strict-bounds')
      .addEventListener('click', function () {
        console.log('Checkbox clicked! New state=' + this.checked);
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


  addResult(result, i) {
    // console.log("XXXX")
    var results = document.getElementById('results');
    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
    var markerIcon = this.state.MARKER_PATH + markerLetter + '.png';

    var tr = document.createElement('tr');
    tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
    let that = this;
    tr.onclick = function () {
      google.maps.event.trigger(that.state.marker, 'click');
    };

    var iconTd = document.createElement('td');
    var nameTd = document.createElement('td');
    var icon = document.createElement('img');
    icon.src = markerIcon;
    icon.setAttribute('class', 'placeIcon');
    icon.setAttribute('className', 'placeIcon');
    var name = document.createTextNode(result.name);
    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    results.appendChild(tr);
  }


  // Get the place details for a hotel. Show the information in an info window,
  // anchored on the marker for the hotel that the user selected.
  showInfoWindow(i) {
    var then = this;
    // console.log(marker.service.getDetails)
    this.service.getDetails({
        placeId: this.state.markers[i].placeResult.place_id
      },
      function (place, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          return;
        }
        let infoWindow = new google.maps.InfoWindow;
        infoWindow.open(map, then.state.markers[i]);
        then.buildIWContent(place);
      });
  }

  // Load the place information into the HTML elements used by the info window.
  buildIWContent(place) {
    console.log(place.name)
    document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
      'src="' + place.icon + '"/>';
    document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
      '">' + place.name + '</a></b>';
    document.getElementById('iw-address').textContent = place.vicinity;

    if (place.formatted_phone_number) {
      document.getElementById('iw-phone-row').style.display = '';
      document.getElementById('iw-phone').textContent =
        "place.formatted_phone_number";
    } else {
      document.getElementById('iw-phone-row').style.display = 'none';
    }

    // Assign a five-star rating to the hotel, using a black star ('&#10029;')
    // to indicate the rating the hotel has earned, and a white star ('&#10025;')
    // for the rating points not achieved.
    if (place.rating) {
      var ratingHtml = '';
      for (var i = 0; i < 5; i++) {
        if (place.rating < (i + 0.5)) {
          ratingHtml += '&#10025;';
        } else {
          ratingHtml += '&#10029;';
        }
        document.getElementById('iw-rating-row').style.display = '';
        document.getElementById('iw-rating').innerHTML = ratingHtml;
      }
    } else {
      document.getElementById('iw-rating-row').style.display = 'none';
    }

    // The regexp isolates the first part of the URL (domain plus subdomain)
    // to give a short URL for displaying in the info window.
    if (place.website) {
      var fullUrl = place.website;
      var website = this.state.hostnameRegexp.exec(place.website);
      if (website === null) {
        website = 'http://' + place.website + '/';
        fullUrl = website;
      }
      document.getElementById('iw-website-row').style.display = '';
      document.getElementById('iw-website').textContent = website;
    } else {
      document.getElementById('iw-website-row').style.display = 'none';
    }
  }

  // onPlaceChanged() {
  //   let place = autocomplete.getPlace();
  //   if (place.geometry) {
  //     map.panTo(place.geometry.location);
  //     map.setZoom(15);
  //     search();
  //   } else {
  //     document.getElementById('autocomplete').placeholder = '';
  //   };
  // }

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
        <div id="info">
          <div id="info-content">
            <table>
              <tr id="iw-url-row" className="iw_table_row">
                <td id="iw-icon" className="iw_table_icon"></td>
                <td id="iw-url"></td>
              </tr>
              <tr id="iw-address-row" className="iw_table_row">
                <td className="iw_attribute_name">Address:</td>
                <td id="iw-address"></td>
              </tr>
              <tr id="iw-phone-row" className="iw_table_row">
                <td className="iw_attribute_name">Telephone:</td>
                <td id="iw-phone"></td>
              </tr>
              <tr id="iw-rating-row" className="iw_table_row">
                <td className="iw_attribute_name">Rating:</td>
                <td id="iw-rating"></td>
              </tr>
              <tr id="iw-website-row" className="iw_table_row">
                <td className="iw_attribute_name">Website:</td>
                <td id="iw-website"></td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default Main;