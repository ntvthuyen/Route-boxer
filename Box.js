
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
      return '#8f0096';
    }
    static MERGECOLOR(){
      return '#4284f5';
    }
    IsMarked(){
      return this.isMarked;
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
    MarkExpanded(){
      if(!this.isMarked){
        this.rectangle.setOptions({
          strokeColor: Box.EMARKEDCOLOR(),
          fillColor: Box.EMARKEDCOLOR(),
        });
        this.isExpanded = true;
        this.isMarked = true;
      }
    }
    DrawBox(gmap, color = '#8f0096'){
      this.isDraw = true;
      this.rectangle = new google.maps.Rectangle({
        strokeColor: color,
        strokeOpacity: 0.9,
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
      if(this.bounds.north == box.GetBounds().north
        && this.bounds.south == box.GetBounds().south
        && ((this.bounds.west == box.GetBounds().east) || (this.bounds.east == box.GetBounds().west))
      ){
        resultBox = {
          north: this.bounds.north,
          south: this.bounds.south,
          east: (this.bounds.east > box.GetBounds().east)?this.bounds.east:box.GetBounds().east,
          west: (this.bounds.west < box.GetBounds().west)?this.bounds.west:box.GetBounds().west ,
        }
      }
      else if(this.bounds.east == box.GetBounds().east
        && this.bounds.west == box.GetBounds().west
        && ((this.bounds.north == box.GetBounds().south) || (this.bounds.south == box.GetBounds().north))
      ){
        resultBox = {
          north: (this.bounds.north > box.GetBounds().north)?this.bounds.north:box.GetBounds().north,
          south: (this.bounds.south < box.GetBounds().south)?this.bounds.south:box.GetBounds().south,
          east: this.bounds.east,
          west: this.bounds.west,
        }
      }
      else return false;
      this.bounds = resultBox;
      return true;
    }
  }
  