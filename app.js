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
    center: {lat: 10.762666, lng: 106.682352}
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
        var polyline = decodePolyline(response.routes[0].overview_polyline);
        directionsRenderer.setDirections(response);
        console.log(polyline);
        var distance = document.getElementById('distance').value;
        var routeboxer = new RouteBoxer(polyline, distance);
        _bounds = routeboxer.FindBoundedBox().bounds;
        console.log(_bounds);
        /*
        for(var okay = 0; okay < polyline.length;++okay){
          var khtnMaker = new google.maps.Marker({
            position:{lat:  polyline[okay].lat, lng: polyline[okay].lng},
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          })
        }*/
        /*var rectangle = new google.maps.Rectangle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          map: map,
          bounds: _bounds,
        });*/
        routeboxer.RouteBoxerAlgorithm(map,3); 
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
}

class Box{
  constructor(x,y,bounds){
    this.x = x;
    this.y = y;
    this.isMarked = false; //  boolean
    this.isMerged = false; // boolean
    this.isExpanded = false;
    this.bounds = bounds; // bounds 
    this.isDraw = false;
    this.rectangle = null;
  }

  static MARKEDCOLOR(){
    return '#008c3a';
  }
  static  EMARKEDCOLOR(){
    return '#fcba03';
  }
  static UNMARKEDCOLOR(){
    return '#000000';
  }
  static MERGECOLOR(){
    return '#4284f5';
  }
  GetBounds(){
    return this.bounds;
  }
  Mark(point1, point2){
    if(this.IsCrossOrContainALine(point1,point2)){
      this.isMarked = true;
      if(this.rectangle !== null){
        this.rectangle.setOptions({
          strokeColor: Box.MARKEDCOLOR(),
          fillColor: Box.MARKEDCOLOR(),
        });
        return true;
      }}
    return false;
  }
  Unmark(){
    this.isMarked = false;
  }
  MarkExpanded(){
    if(!this.isMarked){
      this.rectangle.setOptions({
        strokeColor: Box.EMARKEDCOLOR(),
        fillColor: Box.EMARKEDCOLOR(),
      });
      this.isExpanded = true;
    }
  }
  DrawBox(gmap){
    this.isDraw = true;
    var color = Box.UNMARKEDCOLOR(); 
    this.rectangle = new google.maps.Rectangle({
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.2,
      map: gmap,
      bounds: this.bounds,
    });
  }
  ClearBoxOnMap(){
    this.isDraw = false;
    this.rectangle.setMap(null);
  }
  // This function will return a boolean variable.
  // I'm using Cohen Sutherland line clipping algorithm to check it.
  // This is algorithm to check if a line is on the screen or outside the screen using in Computer Graphic.
  IsCrossOrContainALine(point1, point2){
    return this.CohenSutherlandAlgorithm(point1, point2);
  }
  CohenSutherlandAlgorithm(point1, point2){
    var x1 = point1.lng;
    var y1 = point1.lat;
    var x2 = point2.lng;
    var y2 = point2.lat;
    var xmax = this.bounds.east;
    var xmin = this.bounds.west;
    var ymax = this.bounds.north;
    var ymin = this.bounds.south;
    // Regions:
    // 1001 1000 1010
    // 0001 0000 0010
    // 0101 0100 0110
    var p1 = 0;
    if(x1 < xmin) p1 = p1 + 1;
    if(x1 > xmax) p1 = p1 + 2;
    if(y1 < ymin) p1 = p1 + 4
    if(y1 > ymax) p1 = p1 + 8;
    var p2 = 0;
    if(x2 < xmin) p2 = p2 + 1;
    if(x2 > xmax) p2 = p2 + 2;
    if(y2 < ymin) p2 = p2 + 4
    if(y2 > ymax) p2 = p2 + 8;
    if((p1 == 0) || (p2 == 0)){
      return true;
    } else if ((p1 & p2) != 0){
      return false;
    } else if ((p1 & p2) == 0){
      var x;
      var y;
      var p = 0;
      var cx = false;
      var cy = false;
      if((p1 & 8) == 8){
        x = x1 + (x2 - x1)*((ymax - y1)/(y2 - y1));
        cx = true;
      }else if((p1 & 4) == 4){
        x = x1 + (x2 - x1)*((ymin - y1)/(y2 - y1));
        cx = true;
      }else if((p1 & 2) == 2 ){
        y = y1 + (y2 - y1)*((xmax - x1)/(x2 - x1));
        cy = true;
      }else if((p1 & 1) == 1){
        y = y1 + (y2 - y1)*((xmin - x1)/(x2 - x1));
        cy= true;
      }
      if(cx){
        if(x < xmin) p = p + 1;
        if(x > xmax) p = p + 2;
      }
      if(cy){
        if(y < ymin) p = p + 4;
        if(y > ymax) p = p + 8;
      }  
      if((p2 & p) != 0) return false;
      return true;
    }
  }
  LiangBarskyAlgorithm(point1, point2){
    var x1 = point1.lng;
    var y1 = point1.lat;
    var x2 = point2.lng;
    var x2 = point2.lat;
    var xmax = this.bounds.east;
    var xmin = this.bounds.west;
    var ymax = this.bounds.north;
    var ymin = this.bounds.south;
  }
  CyrusBeckAlgorithm(point1, point2){

  }
  Merge(box){
    var resultBox = null;
    if(this.bounds.north === box.GetBounds().north
      && this.bounds.south === box.GetBounds().south
    ){t
      resultBox = {
        north: this.bounds.north,
        south: this.bounds.south,
        east: (this.bounds.east < box.GetBounds().east)?this.bounds.east:box.GetBounds().east,
        west: (this.bounds.west > box.GetBounds().west)?this.bounds.west:box.GetBounds().west ,
      }
    }
    else if(this.bounds.east === box.GetBounds().east
      && this.bounds.west === box.GetBounds().west
    ){
      resultBox = {
        north: (this.bounds.north < box.GetBounds().north)?this.bounds.north:box.GetBounds().north,
        south: (this.bounds.south < box.GetBounds().south)?this.bounds.south:box.GetBounds().south,
        east: this.bounds.east,
        west: this.bounds.west,
      }
    }
    return resultBox;
  }
}

class RouteBoxer{
  constructor(path, distance){
    this.boxes = null; // the list of boxes/
    this.distance = distance; //in KM the distance that we want to find along the path.
    this.marklist = new Array();
    this.verhicalBoxes = null; 
    this.horizontalBoxes = null;
    this.path = path;
  }
  GetVerhicalResult(){
    return this.resultVerhicalBoxes;
  }
  GetHorizontalResult(){
    return this.resultHorizontalBoxes;
  }
  GetDistanceFromLatLonInKm(lat1,lng1,lat2,lng2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLng = this.deg2rad(lng2-lng1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  deg2rad(deg) {
    return deg * (Math.PI/180)
  }
  // This function found the bounded box of the path google direction api has found
  // The idea to found the bouneded box is simple.
  // I try to find the largest latitude, the largest longitude,
  // the smallest latitude and the smallest longitude in the list of geopoints.
  // These 4 values from a bound of the bounded box of the path.
  FindBoundedBox(){
    var pointList = this.path;
    var maxLat = -190;
    var maxLng = -190;
    var minLat = 190;
    var minLng = 190;
    for (var i = 0; i < pointList.length; ++i){
      var point = pointList[i];
      if(point.lat > maxLat) maxLat = point.lat;
      if(point.lat < minLat) minLat = point.lat;
      if(point.lng > maxLng) maxLng = point.lng;
      if(point.lng < minLng) minLng = point.lng;
    }
    var _height = this.GetDistanceFromLatLonInKm(minLat, 0, maxLat, 0);
    var _width = this.GetDistanceFromLatLonInKm(0,minLng,0,maxLng);
    console.log(_height);
    console.log(_width);
    return {
      bounds: {
        north: maxLat,
        south: minLat,
        east: maxLng,
        west: minLng,
      },
      edges: {
        height:_height,
        width:_width,
      }

    }
  }
  //Generate box list and display on the map
  GenerateBoxes(gmap){
    if(distance === 0) return;
    var boundedBox = this.FindBoundedBox();
    var dLat = this.distance/110.574;
    var dLng = this.distance/111.320;
    var currentRightBound = boundedBox.bounds.west - 3*dLng;
    var currentBottomBound = boundedBox.bounds.north + 3*dLat;
    var stopLng = boundedBox.bounds.east + 3*dLng;
    var stopLat = boundedBox.bounds.south - 2*dLat;
    var latList = new Array();
    var lngList = new Array();
    while(currentBottomBound > stopLat){
      currentBottomBound=currentBottomBound-dLat;
      latList.push(currentBottomBound);
    }
    while(currentRightBound < stopLng){
      currentRightBound=currentRightBound + dLng;
      lngList.push(currentRightBound);
    }
    this.boxes = new Array();
    for(var i = 0; i < latList.length - 1; ++i){
      this.boxes.push(new Array());
      for(var j = 0; j < lngList.length - 1; ++j){
        var bound = {north: latList[i], south: latList[i+1], west: lngList[j], east: lngList[j+1]};
        this.boxes[i].push(new Box(i, j, bound));
        this.boxes[i][j].DrawBox(gmap);
      }
    }
  }
  //Mark all boxes that are crossed by the path.
  MarkBoxes(){
    var r = this.boxes.length;
    var c = this.boxes[0].length;
    var pathLength = this.path.length - 1;
    for(var i = 0; i <  r; ++i){
      for(var j = 0;  j < c; ++j){
        for(var k = 0; k < pathLength; ++k){
          var isMarked = this.boxes[i][j].Mark(this.path[k],this.path[k+1]);
          if(isMarked){
            this.marklist.push({x:i, y:j});
          }
        }
      }
    }
  }
  // Add neighbours of marked boxes in markboxes step
  // Also add them to marklist
  Expanded(){
    var r = this.boxes.length;
    var c = this.boxes[0].length;
    var length = this.marklist.length;
    for(var i = 0; i < length; ++i){
      if(this.marklist[i].y < c - 1){ 
        var x = this.marklist[i].x;
        var y = this.marklist[i].y;
        if(x > 0){
          this.boxes[x - 1][y + 1].MarkExpanded();
          this.marklist.push({x: x - 1, y: y + 1});
        }
        if(x < r - 1){
          this.boxes[x + 1][y + 1].MarkExpanded();
          this.marklist.push({x: x + 1, y: y + 1});
        }
        this.boxes[x][y + 1].MarkExpanded();
        this.marklist.push({x: x, y: y + 1});
      }
      if(y > 0){
        if(x > 0){
          this.boxes[x - 1][y - 1].MarkExpanded();
          this.marklist.push({x: x - 1, y: y - 1});
        }
        if(x < r - 1){
          this.boxes[x + 1][y - 1].MarkExpanded();
          this.marklist.push({x: x + 1, y: y - 1});
        }
        this.boxes[x][y - 1].MarkExpanded();
        this.marklist.push({x: x, y: y - 1});
      }
      if(x > 0){
        this.boxes[x - 1][y].MarkExpanded();
        this.marklist.push({x: x - 1, y: y});
      }
      if(x < r - 1){
        this.boxes[x + 1][y].MarkExpanded();
        this.marklist.push({x: x + 1, y: y});
      }
    }
  }
  // Clear all box on the map.
  ClearMap(){
    for(var i = 0; i < this.boxes.length;++i){
      for(var j = 0; j < this.boxes[i].length;++j){
        this.boxes[i][j].ClearBoxOnMap();
      }
    }
    this.boxes=null;
  }
  //sleep function
  sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
  }
  // The main function of routeboxer algorithm
  // map is the google map object
  // sleeptime in second
  async RouteBoxerAlgorithm(map, sleeptime){
    sleeptime = sleeptime * 1000;
    await this.sleep(sleeptime);
    this.GenerateBoxes(map);
    await this.sleep(sleeptime);
    this.MarkBoxes();
    await this.sleep(sleeptime);
    this.Expanded();
  }
}
