var map;
// initMap function create a google map view 
// and move the camera to Ho Chi Minh city University of Science 
function initMap() {
  var directionsService = new google.maps.DirectionsService();
  var directionsRenderer = new google.maps.DirectionsRenderer();
  var iconBase =
    'https://developers.google.com/maps/documentation/javascript/examples/full/images/';

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 18,
    center: {lat: 10.762666, lng: 106.682352},
    mapTypeId: google.maps.MapTypeId.HYBRID
  });
  var khtnMaker = new google.maps.Marker({
    position:{lat:  10.762666, lng: 106.682352},
    map: map,
    icon: iconBase + 'beachflag.png',
    title: "University Of Science :^)",
  })

  directionsRenderer.setMap(map);

  var onChangeHandler = function() {
    calculateAndDisplayRoute(map,directionsService, directionsRenderer);
  };
  document.getElementById('btn').addEventListener('click', onChangeHandler);
}

// After we recieve the data from google map apis.
// We get a string that was encoded from a list of geopoints
// each contains latitude and longitude.
// This function helps to decode this list back to a list of geopoints.
function decodePolyline(encoded) {
  if (!encoded) {
    return [];
  }
  var poly = [];
  var index = 0, len = encoded.length;
  var _lat = 0, _lng = 0;

  while (index < len) {
    var b, shift = 0, result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result = result | ((b & 0x1f) << shift);
      shift += 5;
    } while (b >= 0x20);

    var dlat = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
    _lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result = result | ((b & 0x1f) << shift);
      shift += 5;
    } while (b >= 0x20);

    var dlng = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
    _lng += dlng;

    var p = {
      lat: _lat / 1e5,
      lng: _lng / 1e5,
    };
    poly.push(p);
  }
  return poly;
}

// Function to send requests to google api 
// and receive data of polyline lists and paths
function calculateAndDisplayRoute(map, directionsService, directionsRenderer) {
  var route = directionsService.route(
    {
      origin: {query: document.getElementById('origin').value},
      destination: {query: document.getElementById('destination').value},
      travelMode: 'DRIVING'
    },
    function(response, status) {
      if (status === 'OK') {
        var boxcheckingmethod = document.getElementById('method').value;
        var mode = document.getElementById('mode').value;
        var polyline = decodePolyline(response.routes[0].overview_polyline);
        directionsRenderer.setDirections(response);
        console.log(polyline);
        var distance = document.getElementById('distance').value;
        var routeboxer = new RouteBoxer(map, polyline, distance, boxcheckingmethod);
        if(mode == 'visualization')
          routeboxer.VisualizeRouteBoxerAlgorithm(3);
        if(mode == 'horizontal')
          routeboxer.RouteBoxerAlgorithm(mode);
        if(mode == 'vertical')
          routeboxer.RouteBoxerAlgorithm(mode);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
}
