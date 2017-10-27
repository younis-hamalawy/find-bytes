import React from 'react';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      map: '',
      location: '',
      latitude: '',
      longitude: '',
      card: '',
      input: '',
      strictBounds: '',
      marker: '',
      infowindow: '',
      infowindowContent: '',
      place: '',
      MARKER_PATH: 'https://developers.google.com/maps/documentation/javascript/images/marker_green',
      hostnameRegexp: new RegExp('^https?://.+?/')
    };

    this.setQuery = this.setQuery.bind(this);
    // this.submitQuery = this.submitQuery.bind(this);
    this.createMarker = this.createMarker.bind(this);
    this.onPlaceChanged = this.onPlaceChanged.bind(this);
    // this.callback = this.callback.bind(this);
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

    var infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);
    var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });
        let that = this;

    autocomplete.addListener('place_changed', function() {

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
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, callback);
        let then = that;

        function callback(results, status) {

          if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < results.length; i++) {
              let place = results[i];
              then.createMarker(results[i], map, i);
            }
          }
        }
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(15);  // Why 15? Because it looks good.
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

      infowindowContent.children['place-icon'].src = place.icon;
      infowindowContent.children['place-name'].textContent = place.name;
      infowindowContent.children['place-address'].textContent = address;
      infowindow.open(map, marker);
    });

    document.getElementById('use-strict-bounds')
      .addEventListener('click', function() {
        console.log('Checkbox clicked! New state=' + this.checked);
        autocomplete.setOptions({strictBounds: this.checked});
      });
  }

  setQuery(e) {
    e.preventDefault();
    const query = e.currentTarget.value ? e.currentTarget.value : '';
    this.setState({ query });
  }

  createMarker(result, map, i) {
    // let marker = new google.maps.Marker({
    //   position: result.geometry.location,
    //   // label: {
    //   //   color: "black",
    //   //   fontFamily: "Helvetica",
    //   //   text: "$"+Stbodying(home.price),
    //   //   fontSize: "15px",
    //   //   fontWeight: "600"
    //   // },
    //   anchor: new google.maps.Point(500, 10),
    //   // icon: {url: image, origin: new google.maps.Point(0,-3)},
    //   animation: google.maps.Animation.DROP,
    //   map: map
    // });
    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
    var markerIcon = this.state.MARKER_PATH + markerLetter + '.png';
    // Use marker animation to drop the icons incrementally on the map.
    let marker = new google.maps.Marker({
      position: result.geometry.location,
      animation: google.maps.Animation.DROP,
      icon: markerIcon,
      map: map
    });
    // If the user clicks a hotel marker, show the details of that hotel
    // in an info window.
    marker.placeResult = this.state.result;
    google.maps.event.addListener(marker, 'click', this.showInfoWindow);
    // setTimeout(dropMarker(i), i * 100);
    this.addResult(result, i);
  }
  addResult(result, i) {
    var results = document.getElementById('results');
    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
    var markerIcon = this.state.MARKER_PATH + markerLetter + '.png';

    var tr = document.createElement('tr');
    tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
    tr.onclick = function() {
      google.maps.event.trigger(markers[i], 'click');
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

  onPlaceChanged() {
    let place = autocomplete.getPlace();
    if (place.geometry) {
      map.panTo(place.geometry.location);
      map.setZoom(15);
      search();
    } else {
      document.getElementById('autocomplete').placeholder = '';
    };
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
        <div id="infowindow-content">
          <img src="" width={16} height={16} id="place-icon" />
          <span id="place-name" className="title" /><br />
          <span id="place-address" />
        </div>
      </div>
    );
  }
}

export default Main;
