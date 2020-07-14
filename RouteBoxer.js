class RouteBoxer {
  constructor(map, path, distance, method) {
    this.boxes = null; // the list of boxes/
    this.distance = distance; //in KM the distance that we want to find along the path.
    this.marklist = new Array();
    this.verticalBoxes = new Array();
    this.horizontalBoxes = new Array();
    this.path = path;
    this.map = map;
    this.boxcheckingmethod = method;
  }
  GetVerticalResult() {
    return this.resultVerticalBoxes;
  }
  GetHorizontalResult() {
    return this.resultHorizontalBoxes;
  }
  GetDistanceFromLatLonInKm(lat1, lng1, lat2, lng2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    var dLng = this.deg2rad(lng2 - lng1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }
  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }
  // This function found the bounded box of the path google direction api has found
  // The idea to found the bouneded box is simple.
  // I try to find the largest latitude, the largest longitude,
  // the smallest latitude and the smallest longitude in the list of geopoints.
  // These 4 values from a bound of the bounded box of the path.
  FindCoverBox() {
    var pointList = this.path;
    var maxLat = -190;
    var maxLng = -190;
    var minLat = 190;
    var minLng = 190;
    for (var i = 0; i < pointList.length; ++i) {
      var point = pointList[i];
      if (point.lat > maxLat) maxLat = point.lat;
      if (point.lat < minLat) minLat = point.lat;
      if (point.lng > maxLng) maxLng = point.lng;
      if (point.lng < minLng) minLng = point.lng;
    }
    var _height = this.GetDistanceFromLatLonInKm(minLat, 0, maxLat, 0);
    var _width = this.GetDistanceFromLatLonInKm(0, minLng, 0, maxLng);
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
        height: _height,
        width: _width,
      }

    }
  }
  //Generate box list and display on the map
  GenerateBoxes(draw = true) {
    if (distance === 0) return;
    var boundedBox = this.FindCoverBox();
    var dLat = this.distance / 110.574;
    var dLng = this.distance / 111.320;
    var currentRightBound = boundedBox.bounds.west - 3 * dLng;
    var currentBottomBound = boundedBox.bounds.north + 3 * dLat;
    var stopLng = boundedBox.bounds.east + 2 * dLng;
    var stopLat = boundedBox.bounds.south - 2 * dLat;
    var latList = new Array();
    var lngList = new Array();
    while (currentBottomBound > stopLat) {
      currentBottomBound = currentBottomBound - dLat;
      latList.push(currentBottomBound);
    }
    while (currentRightBound < stopLng) {
      currentRightBound = currentRightBound + dLng;
      lngList.push(currentRightBound);
    }
    this.boxes = new Array();
    for (var i = 0; i < latList.length - 1; ++i) {
      this.boxes.push(new Array());
      for (var j = 0; j < lngList.length - 1; ++j) {
        var bound = { north: latList[i], south: latList[i + 1], west: lngList[j], east: lngList[j + 1] };
        this.boxes[i].push(new Box(i, j, bound));
        if(draw)this.boxes[i][j].DrawBox(this.map);
      }
    }
  }
  //Mark all boxes that are crossed by the path.
  MarkBoxes() {
    var r = this.boxes.length;
    var c = this.boxes[0].length;
    var pathLength = this.path.length - 1;
    for (var i = 1; i < r - 1; ++i) {
      for (var j = 1; j < c - 1; ++j) {
        for (var k = 0; k < pathLength; ++k) {
          var isMarked = this.boxes[i][j].Mark(this.path[k], this.path[k + 1], this.boxcheckingmethod);
          if (isMarked) {
            this.marklist.push({ x: i, y: j });
          }
        }
      }
    }
  }
  // Add neighbours of marked boxes in markboxes step
  // Also add them to marklist
  Expanded() {
    var r = this.boxes.length;
    var c = this.boxes[0].length;
    var length = this.marklist.length;
    for (var i = 0; i < length; ++i) {
      var x = this.marklist[i].x;
      var y = this.marklist[i].y;
      this.boxes[x - 1][y + 1].MarkExpanded();
      this.marklist.push({ x: x - 1, y: y + 1 });
      this.boxes[x + 1][y + 1].MarkExpanded();
      this.marklist.push({ x: x + 1, y: y + 1 });
      this.boxes[x][y + 1].MarkExpanded();
      this.marklist.push({ x: x, y: y + 1 });
      this.boxes[x - 1][y - 1].MarkExpanded();
      this.marklist.push({ x: x - 1, y: y - 1 });
      this.boxes[x + 1][y - 1].MarkExpanded();
      this.marklist.push({ x: x + 1, y: y - 1 });
      this.boxes[x][y - 1].MarkExpanded();
      this.marklist.push({ x: x, y: y - 1 });
      this.boxes[x - 1][y].MarkExpanded();
      this.marklist.push({ x: x - 1, y: y });
      this.boxes[x + 1][y].MarkExpanded();
      this.marklist.push({ x: x + 1, y: y });
    }
  }
  // Clear all box on the map.
  ClearGeneratedBoxesOnMap(clearmemory) {
    for (var i = 0; i < this.boxes.length; ++i) {
      for (var j = 0; j < this.boxes[i].length; ++j) {
        this.boxes[i][j].ClearBoxOnMap();
      }
    }
    if (clearmemory) {
      this.boxes = null;
    }
  }
  //sleep function
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  RouteBoxerAlgorithm(mode){
    if(mode == 'horizontal'){
      this.GenerateBoxes(this.map);
      this.MarkBoxes();
      this.Expanded();
      var temp = this.HorizontalMerge(this.boxes);
      this.horizontalBoxes = this.GetResult(temp); 
      this.DrawBoxes(this.horizontalBoxes, Box.MERGECOLOR()); 
    } else {
      this.GenerateBoxes(this.map);
      this.MarkBoxes();
      this.Expanded();
      var temp = this.VerticalMerge(this.boxes);
      this.verticalBoxes = this.GetResult(temp); 
      this.DrawBoxes(this.verticalBoxes, Box.MERGECOLOR()); 

    }
  }
  // The main function of routeboxer algorithm
  // map is the google map object
  // sleeptime in second
  async VisualizeRouteBoxerAlgorithm(sleeptime) {
    sleeptime = sleeptime * 1000;
    await this.sleep(sleeptime);
    this.GenerateBoxes(this.map);
    await this.sleep(sleeptime);
    this.MarkBoxes();
    await this.sleep(sleeptime);
    this.Expanded();
    await this.sleep(sleeptime);
    this.ClearGeneratedBoxesOnMap(false);
    var temp = this.HorizontalMerge(this.boxes);
    this.DrawBoxes(temp);
    await this.sleep(sleeptime);
    this.horizontalBoxes = this.GetResult(temp); 
    this.ClearBoxesOfTheListOnMap(temp);
    this.DrawBoxes(this.horizontalBoxes, Box.MERGECOLOR());
    await this.sleep(sleeptime);
    this.ClearBoxesOfTheListOnMap(this.horizontalBoxes);
    this.boxes = new Array();
    this.marklist = new Array();
    this.GenerateBoxes(this.map);
    await this.sleep(sleeptime);
    this.MarkBoxes();
    await this.sleep(sleeptime);
    this.Expanded();
    await this.sleep(sleeptime);
    this.ClearGeneratedBoxesOnMap(false);
    temp = this.VerticalMerge(this.boxes);
    this.ClearBoxesOfTheListOnMap(this.horizontalBoxes);
    this.DrawBoxes(temp);
    await this.sleep(sleeptime);
    this.ClearBoxesOfTheListOnMap(temp);
    this.verticalBoxes = this.GetResult(temp);
    this.DrawBoxes(this.verticalBoxes, Box.MERGECOLOR());
  }
  HorizontalMerge(boxes) {
    var r = boxes.length;
    var c = boxes[0].length;
    var current_box_index = -1;
    var result = new Array();
    for (var i = 0; i < r; ++i) {
      for (var j = 0; j < c; ++j) {
        if (boxes[i][j].IsMarked()) {
          if (current_box_index == -1) {
            var t = boxes[i][j];
            result.push(t);
            current_box_index = result.length - 1;
          }
          else {
            result[current_box_index].Merge(boxes[i][j]);
          }
        } else {
          current_box_index = -1;
        }
      }
    }
    return result;
  }

  VerticalMerge(boxes) {
    var r = boxes.length;
    var c = boxes[0].length;
    var current_box_index = -1;
    var result = new Array();
    for (var j = 0; j < c; ++j) {
      for (var i = 0; i < r; ++i) {
        if (boxes[i][j].IsMarked()) {
          if (current_box_index == -1) {
            var t = boxes[i][j];
            result.push(t);
            current_box_index = result.length - 1;
          }
          else {
            result[current_box_index].Merge(boxes[i][j]);
          }
        } else {
          current_box_index = -1;
        }
      }
    }
    return result;
  }
  ClearBoxesOfTheListOnMap(boxes, clearmemory = false) {
    var length = boxes.length;
    for (var i = 0; i < length; ++i) {
      boxes[i].ClearBoxOnMap(this.map);
    }
    if (clearmemory) {
      boxes = null;
    }
  }
  DrawBoxes(boxes, color = null) {
    var length = boxes.length;
    if (color != null) {
      for (var i = 0; i < length; ++i) {
        boxes[i].DrawBox(this.map, color);
      }
    } else {
      for (var i = 0; i < length; ++i) {
        boxes[i].DrawBox(this.map);
      }
    }
  }
  GetResult(boxes) {
    var result = new Array();
    var length = boxes.length;
    result.push(boxes[0]);
    var isAbleToMerge = false;
    var current_box_index = 0;
    for (var i = 1; i < length; ++i) {
      isAbleToMerge = result[current_box_index].Merge(boxes[i]);
      if (!isAbleToMerge) {
        ++current_box_index;
        result.push(boxes[i]);
      }
    }
    return result;
  }
}
