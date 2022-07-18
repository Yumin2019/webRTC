function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

	clone() {
		return new Point(this.x, this.y)
	}

	add(vector) {
		return new Point(this.x + vector.x, this.y + vector.y);
	}

	subtract(vector) {
		return new Point(this.x - vector.x, this.y - vector.y);
	}

	scale(scalar) {
		return new Point(this.x * scalar, this.y * scalar);
	}

	dot(vector) {
		return (this.x * vector.x + this.y + vector.y);
	}

	moveTowards(vector, t) {
		// Linearly interpolates between vectors A and B by t.
		// t = 0 returns A, t = 1 returns B
		t = Math.min(t, 1); // still allow negative t
		var diff = vector.subtract(this);
		return this.add(diff.scale(t));
	}

	magnitude() {
		return Math.sqrt(this.magnitudeSqr());
	}

	magnitudeSqr() {
		return (this.x * this.x + this.y * this.y);
	}

	distance (vector) {
		return Math.sqrt(this.distanceSqr(vector));
	}

	distanceSqr (vector) {
		var deltaX = this.x - vector.x;
		var deltaY = this.y - vector.y;
		return (deltaX * deltaX + deltaY * deltaY);
	}

	normalize() {
		var mag = this.magnitude();
		var vector = this.clone();
		if(Math.abs(mag) < 1e-9) {
			vector.x = 0;
			vector.y = 0;
		} else {
			vector.x /= mag;
			vector.y /= mag;
		}
		return vector;
	}

	angle() {
		return Math.atan2(this.y, this.x);
	}

	rotate(alpha) {
		var cos = Math.cos(alpha);
		var sin = Math.sin(alpha);
		var vector = new Point();
		vector.x = this.x * cos - this.y * sin;
		vector.y = this.x * sin + this.y * cos;
		return vector;
	}

	toString() {
		return ("[" + this.x + "; " + this.y + "]");
	}
}

class DrawingShape {
  constructor(shape, color, isFilled, isDashed, thicknessIdx) {
    this.shape = shape;
    this.color = color;
    this.isFilled = isFilled;
    this.isDashed = isDashed;
    this.thicknessIdx = thicknessIdx;
  }

  toString() {
    console.log("shape : " + this.shape + " color : " + this.color + " isFilled : " + this.isFilled + " isDashed : " + this.isDashed + " thickness : " + this.thicknessIdx);
  }

  setColor(color) {
    this.color = color;
  }

  setFilling(isEnabled) { 
    this.isFilled = isEnabled;
  }

  setDashed(isEnabled) {
    this.isDashed = isEnabled;
  }

  setThickness(thicknessidx) {
    this.thicknessIdx = thicknessidx;
  }

  init() {
    context.lineWidth = arrLineWidth[this.thicknessIdx];
    context.strokeStyle = this.color;
    context.fillStyle = this.color;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.setLineDash([]);
  
    if(this.isDashed) {
      context.setLineDash([10 * (this.thicknessIdx + 1)]); 
    } 
  }
}

class DrawingShapeEraser extends DrawingShape {
  constructor(point) {
    super(SHAPE_TYPE_ERASER, COLOR_TYPE_BLACK, false, false, 0);
    this.point = point;
  }

  setPoint(point) {
    this.point = point;
  }

  draw() {

  }

  clone() {
    return new DrawingShapeEraser(this.point.clone());
  }
}

class DrawingShapeLine extends DrawingShape {
  constructor(color, isFilled, isDashed, thicknessIdx, startPos, endPos = startPos.clone()) {
    let shape = SHAPE_TYPE_LINE;
    if(isDashed) {
      shape = SHAPE_TYPE_DAHSED_LINE;
    }
    super(shape, color, isFilled, isDashed, thicknessIdx);
    this.startPos = startPos;
    this.endPos = endPos;
  }

  setStartPos(point) {
    this.startPos = point;
  }
  
  setEndPos(point) {
    this.endPos = point;
  }

  width() {
    return Math.abs(this.endPos.x - this.startPos.x);
  }

  height() {
    return Math.abs(this.endPos.y - this.startPos.y);
  }

  draw() {
    super.init();
    context.beginPath();
    drawLine(this.startPos.x, this.startPos.y, this.endPos.x, this.endPos.y);
    context.stroke();
  }

  clone() {
    return new DrawingShapeLine(this.color, this.isFilled, this.isDashed, this.thicknessIdx, this.startPos.clone(), this.endPos.clone());
  } 
}

class DrawingShapeFreeLine extends DrawingShape {
  constructor(color, isFilled, isDashed, thicknessIdx, posList) {
    let shape = SHAPE_TYPE_FREE_LINE;
    if(isDashed) {
      shape = SHAPE_TYPE_DASHED_FREE_LINE;
    }
    super(shape, color, isFilled, isDashed, thicknessIdx);
    this.posList = posList;
  }

  addPos(point) {
    this.posList.push(point);
  }

  draw() {
    super.init();
    context.beginPath();
    context.moveTo(this.posList[0].x, this.posList[0].y);
    if(this.posList.length < 3) {
      for(var i = 1; i < this.posList.length; ++i) {
        let point = this.posList[i];
        context.lineTo(point.x, point.y);
      }
    } else {
      var i;
      for (i = 1; i < this.posList.length - 2; ++i) {
        var c = (this.posList[i].x + this.posList[i + 1].x) / 2;
        var d = (this.posList[i].y + this.posList[i + 1].y) / 2;
        context.quadraticCurveTo(this.posList[i].x, this.posList[i].y, c, d);
      }

      let point = this.posList[i];
      let nextPoint = this.posList[i + 1];
       context.quadraticCurveTo(point.x, point.y, nextPoint.x, nextPoint.y);
    }
   
    context.stroke();
  }

  clone() {
    return new DrawingShapeFreeLine(this.color, this.isFilled, this.isDashed, this.thicknessIdx, this.posList.slice());
  } 
}

class DrawingShapeEllipse extends DrawingShapeLine {
  constructor(color, isFilled, isDashed, thicknessIdx, startPos, endPos = startPos.clone()) {
    super(color, isFilled, isDashed, thicknessIdx, startPos, endPos);
    let shape = SHAPE_TYPE_EMPTY_ELLIPSE;
    if(isFilled) {
      shape = SHAPE_TYPE_ELLIPSE;
    }
    this.shape = shape;
  }

  draw() {
    super.init();
    let centerX = getCenterPos(this.startPos.x, this.endPos.x);
    let centerY = getCenterPos(this.startPos.y, this.endPos.y);

    context.beginPath();
    ellipse(context, centerX, centerY, super.width() / 2.0, super.height() / 2.0);
    if (this.isFilled) {
      context.fill();
    }
  }

  clone() {
    return new DrawingShapeEllipse(this.color, this.isFilled, this.isDashed, this.thicknessIdx, this.startPos.clone(), this.endPos.clone());
  } 
}

class DrawingShapeRectangle extends DrawingShapeLine {
  constructor(color, isFilled, isDashed, thicknessIdx, startPos, endPos = startPos.clone()) {
    super(color, isFilled, isDashed, thicknessIdx, startPos, endPos);
    let shape = SHAPE_TYPE_EMPTY_RECTANGLE;
    if(isFilled) {
      shape = SHAPE_TYPE_RECTANGLE;
    }
    this.shape = shape;
  }

  draw() {
    super.init();
    context.beginPath();
    context.rect(this.startPos.x, this.startPos.y, this.endPos.x - this.startPos.x, this.endPos.y - this.startPos.y);
    context.stroke();
    if(this.isFilled) {
      context.fill();
    }
  }

  clone() {
    return new DrawingShapeRectangle(this.color, this.isFilled, this.isDashed, this.thicknessIdx, this.startPos.clone(), this.endPos.clone());
  } 
}

const SHAPE_TYPE_FREE_LINE = 0;
const SHAPE_TYPE_LINE = 1;
const SHAPE_TYPE_ELLIPSE = 2;
const SHAPE_TYPE_RECTANGLE = 3;
const SHAPE_TYPE_DASHED_FREE_LINE=  4;
const SHAPE_TYPE_DAHSED_LINE = 5;
const SHAPE_TYPE_EMPTY_ELLIPSE = 6;
const SHAPE_TYPE_EMPTY_RECTANGLE = 7;
const SHAPE_TYPE_ERASER = 20;

const COLOR_TYPE_RED = "rgb(237, 28, 36)";
const COLOR_TYPE_ORANGE = "rgb(255, 127, 39)";
const COLOR_TYPE_YELLOW = "rgb(255, 242, 0)";
const COLOR_TYPE_GREEN = "rgb(34, 177, 76)";
const COLOR_TYPE_BLUE = "rgb(0, 162, 232)"
const COLOR_TYPE_INDIGO = "rgb(63, 72, 204)";
const COLOR_TYPE_JAJU = "rgb(163, 73, 164)";
const COLOR_TYPE_PURPLE = "rgb(128, 0, 255)";
const COLOR_TYPE_BLACK = "rgb(0, 0, 0)"
const COLOR_TYPE_DARKER_GREY = "rgb(127, 127, 127)";
const COLOR_TYPE_GREY = "rgb(195, 195, 195)";
const COLOR_TYPE_WHITE = "rgb(255, 255, 255)";


var arrLineWidth = [1, 5, 10, 20];
var thicknessIdx = 1;

const canvas = document.getElementById('canvas');
const pos = document.getElementById('pos');
const context = canvas.getContext('2d');

var currentShape = null;
var curShape = SHAPE_TYPE_FREE_LINE;
var curColor = COLOR_TYPE_BLACK;
var isFilled = true;
var isDashed = false;

var curPosX;
var curPosY;
var startX;
var startY;

var shapeList = [];
canvas.addEventListener("mousedown", function (offset) {
  onStartShape(offset)
}, false);
canvas.addEventListener("mousemove", function (offset) {
  onMoveShape(offset)
}, false);
canvas.addEventListener("mouseup", function (offset) {
  onEndShape(offset)
}, false);
canvas.addEventListener("mouseout", function (offset) {
  onEndShape(offset)
}, false);

function getCenterPos(left, right) {
  return (left + right) / 2.0;
}

function onStartShape (offset) {
  startX = offset.offsetX;
  startY = offset.offsetY;

  switch (curShape) {
    case SHAPE_TYPE_FREE_LINE:
    case SHAPE_TYPE_DASHED_FREE_LINE: {
      currentShape = new DrawingShapeFreeLine(curColor, isFilled, isDashed, thicknessIdx, [new Point(startX, startY)]);
    }
      break;
    case SHAPE_TYPE_LINE:
    case SHAPE_TYPE_DAHSED_LINE: {
      currentShape = new DrawingShapeLine(curColor, isFilled, isDashed, thicknessIdx, new Point(startX, startY));
    }
      break;
    case SHAPE_TYPE_ELLIPSE:
    case SHAPE_TYPE_EMPTY_ELLIPSE: {
      currentShape = new DrawingShapeEllipse(curColor, isFilled, isDashed, thicknessIdx, new Point(startX, startY));
    }
      break;
    case SHAPE_TYPE_RECTANGLE: 
    case SHAPE_TYPE_EMPTY_RECTANGLE: {
      currentShape = new DrawingShapeRectangle(curColor, isFilled, isDashed, thicknessIdx, new Point(startX, startY));
    }
      break;
    case SHAPE_TYPE_ERASER: {
      currentShape = new DrawingShapeEraser(startX, startY);
    }
    break;
    default: {
    }
      break;
  }
  console.log(currentShape);
}

function onMoveShape(offset) {
  if (!currentShape) {
    return;
  }

  curPosX = offset.offsetX;
  curPosY = offset.offsetY;

  switch (currentShape.shape) {
    case SHAPE_TYPE_FREE_LINE:
    case SHAPE_TYPE_DASHED_FREE_LINE: {
      currentShape.addPos(new Point(curPosX, curPosY));
    }
      break;
    case SHAPE_TYPE_LINE:
    case SHAPE_TYPE_DAHSED_LINE: {
      currentShape.setEndPos(new Point(curPosX, curPosY));
    }
      break;

    case SHAPE_TYPE_RECTANGLE:
    case SHAPE_TYPE_EMPTY_RECTANGLE:
    case SHAPE_TYPE_ELLIPSE:
    case SHAPE_TYPE_EMPTY_ELLIPSE: {
      currentShape.setEndPos(new Point(curPosX, curPosY));
    }
      break;

    case SHAPE_TYPE_ERASER: {
      currentShape.setPoint(new Point(curPosX, curPosY));
    }
      break;
    default: {

    }
      break;
  }

  // draw background
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  console.log(offset);
  console.log("curPosX : " + curPosX);
  console.log("curPosY : " + curPosY);

  for(var i = 0; i < shapeList.length; ++i) {
    shapeList[i].draw();

    // 지우개 작업해야 한다.
    if(currentShape.shape === SHAPE_TYPE_ERASER) {

      switch (shapeList[i].shape) {
        case SHAPE_TYPE_EMPTY_RECTANGLE:
        case SHAPE_TYPE_EMPTY_ELLIPSE:
        case SHAPE_TYPE_LINE:
        case SHAPE_TYPE_DAHSED_LINE:
        case SHAPE_TYPE_FREE_LINE:
        case SHAPE_TYPE_DASHED_FREE_LINE: {
          if (context.isPointInStroke(curPosX, curPosY)) {
            deleteShape(i);
            return;
          }
        }
          break;
        case SHAPE_TYPE_RECTANGLE:
        case SHAPE_TYPE_ELLIPSE:
          {
            if (context.isPointInPath(curPosX, curPosY)) {
              deleteShape(i);
              return;
            }
          }
          break;
        default: {

        }
          break;
      }
    }

    console.log("shapeList[" + i + "]  : " + shapeList[i].toString());
  }

  // draw current shape
  currentShape.draw();
}

function onEndShape(offset) {
  if (!currentShape) {
    return;
  }

  switch (currentShape.shape) {
    case SHAPE_TYPE_FREE_LINE:
    case SHAPE_TYPE_DASHED_FREE_LINE: {
     // shapeList
    }
      break;
    case SHAPE_TYPE_LINE:
    case SHAPE_TYPE_DAHSED_LINE: {

    }
      break;
    case SHAPE_TYPE_ELLIPSE:
    case SHAPE_TYPE_EMPTY_ELLIPSE: {

    }
      break;
    case SHAPE_TYPE_RECTANGLE:
    case SHAPE_TYPE_EMPTY_RECTANGLE: {

    }
      break;

    case SHAPE_TYPE_ERASER: {
      currentShape = null;
      return;
    }

    default: {

    }
      break;
  }

  shapeList.push(currentShape.clone());
  currentShape = null;
}

function drawLine(sx, sy, ex, ey) {
  // context.beginPath();
  context.moveTo(sx, sy);
  context.lineTo(ex, ey);
}

function ellipse(context, cx, cy, rx, ry){
  context.save(); // save state
  context.beginPath();

  context.translate(cx-rx, cy-ry); // 좌표 이동 start 좌표에 영향을 준다. 
  context.scale(rx, ry); // scale이 뒤에 좌표에 영향을 주는 듯. 행렬을 셋팅을 할 것이다.
  context.arc(1, 1, 1, 0, 2 * Math.PI, false);

  context.restore(); // restore to original state
  context.stroke();
}
  // context.clearRect(0, 0, context.canvas.width, context.canvas.height)

function resize() {
  let canvasRatio = canvas.height / canvas.width;
  let windowRatio = window.innerHeight / window.innerWidth;
  let width;
  let height;

  // console.log(" ======= resize ======== " );
  // console.log("canvas.height : " + canvas.height);
  // console.log("canvas.width : " + canvas.width);
  // console.log("window.innerHeight : " + window.innerHeight);
  // console.log("window.innerWidth : " +  window.innerWidth);

  // console.log("canvasRatio : " + canvasRatio);
  // console.log("windowRatio : " + windowRatio);

  // leftToolbar width 72, top toolbar height 52
  if (windowRatio < canvasRatio) {
      height = window.innerHeight - 52;
      width = height / canvasRatio;
  } else {
      width = window.innerWidth - 72;
      height = width * canvasRatio;
  }

  //console.log("width : " + width);
  //console.log("height : " + height);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
};

window.addEventListener('resize', resize, false);

function sendButton() {
  console.log(window.event.keyCode);
  if(window.event.keyCode == 13) {
    onEventSendMessage()
   } else if(window.event.keyCode == 27) {
  document.getElementById("chatImg").dispatchEvent(new MouseEvent("click"));

    //chattingKeyUp();
   }
}

function chattingKeyUp() {
  if(window.event.keyCode == 27) {
    document.getElementById("chatImg").dispatchEvent(new MouseEvent("click"));
  }
}

var undoList = [];

function deleteShape(idx) {
  if(idx < 0 || idx >= shapeList.length) {
    return;
  }

  var shape = shapeList.at(idx);
  undoList.push(shape);
  for(var i = idx; i < shapeList.length - 1; ++i) {
    shapeList[i] = shapeList[i + 1]; 
  }

  shapeList.pop();
  redraw();
}

function redo() {
  if(undoList.length == 0) {
    return;
  }

  //addShapeEvent(EVENT_ADD_SHAPE, 1);
  var shape = undoList.at(undoList.length - 1);
  shapeList.push(shape);
  undoList.pop();
  redraw();
}

function undo() {
  if(shapeList.length == 0) {
    return;
  } 

  var shape = shapeList.at(shapeList.length - 1);
  undoList.push(shape);
  shapeList.pop();
  redraw();
}

function redraw() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  for(var i = 0; i < shapeList.length; ++i) {
    shapeList[i].draw();
    console.log("shapeList[" + i + "]  : " + shapeList[i].toString());
  }
}

function clearMyShape() {
  undoList.push(shapeList);
  shapeList = [];
  redraw();
}

function clearShapeAll() {
  undoList.push(shapeList);
  shapeList = [];
  redraw();
}

var uuid = 'GUEST ' + rand(10000, 99999);
console.log(uuid);
// socket.emit("onEventSetUserName", name);
var myName = new Vue({
    el: '#my-name',
    data: {
      name: uuid,
    }
  })

  function getDateTime() {
    return new Date().toTimeString().split(" ")[0];
  }

  const SCREEN_MODE_VIDEO_SHARE = 0;
  const SCREEN_MODE_SCREEN_SHARE = 1;
  const SCREEN_MODE_DRAWING_SHARE = 2;
  var curScreenMode = SCREEN_MODE_VIDEO_SHARE;

  Vue.component('other-message', {
    props: ['name', 'message', 'date'],
    template: '<div class="anotherMsg"><span class="anotherName">{{name}}</span><span class="msg">{{message}}.</span><span class="date">{{date}}</span></div>',
  })

  Vue.component('my-message', {
    props: ['message', 'date'],
    template: '<div class="myMsg"><span class="date">{{date}}</span><p class="msg">{{message}}</p></div>',
  })

  var leftToolbar = new Vue({
    el: '#leftToolbar',
    data: {
      screenMode: SCREEN_MODE_VIDEO_SHARE
    },
    methods: {
      setScreenMode: function(mode) {
        curScreenMode = mode;
        this.screenMode = mode;
      }
    }
  })

  var isEraserMode = false;
  function eraserMode() {
    isEraserMode = !isEraserMode;
    drawingLeftToolbar.eraser_mode = isEraserMode;
    if(isEraserMode) {
      curShape = SHAPE_TYPE_ERASER;
      canvas.style.cursor = "url(assets/image/eraser.png) 0 50, auto";
    } else {
      curShape = recent_shape;
      canvas.style.cursor = "url(assets/image/pencil.png) 0 50, auto";
    }
  }

  var drawingLeftToolbar = new Vue({
    el: '#drawingLeftToolbar',
    data: {
      image_path: "assets/image/freeline.png",
      color_filter: 'filter: invert(0%) sepia(0%) saturate(8%) hue-rotate(253deg) brightness(100%) contrast(100%)',
      color_name: "black",
      thickness_path: "assets/image/16px.png",
      eraser_mode: false,
      recent_shape: 0,
    },
    methods: {
      setThickness: function(idx) {
        thicknessIdx = idx;
        if(idx == 0) {
          this.thickness_path = "assets/image/8px.png";
        } else if(idx == 1) {
          this.thickness_path = "assets/image/16px.png";
        } else if(idx == 2) {
          this.thickness_path = "assets/image/32px.png";
        } else if(idx == 3) {
          this.thickness_path = "assets/image/64px.png";
        }       
      },
      setShape: function(idx) {
        isDashed = false;
        isFilled = true;
        recent_shape = idx;
          switch (idx) {
          case SHAPE_TYPE_FREE_LINE:
            this.image_path = "assets/image/freeline.png";
            break;
          case SHAPE_TYPE_DASHED_FREE_LINE:
            this.image_path = "assets/image/dashed_freeline.png";
            isDashed = true;
            break;
          case SHAPE_TYPE_LINE:
            this.image_path = "assets/image/line.png";
            break;
          case SHAPE_TYPE_DAHSED_LINE:
            this.image_path = "assets/image/dashed_line.png";
            isDashed = true;
            break;
          case SHAPE_TYPE_ELLIPSE:
            this.image_path = "assets/image/filled_circle.png";
            break;
          case SHAPE_TYPE_EMPTY_ELLIPSE:
            this.image_path = "assets/image/circle.png";
            isFilled = false;
            break;
          case SHAPE_TYPE_RECTANGLE:
            this.image_path = "assets/image/filled_rect.png";
            break;
          case SHAPE_TYPE_EMPTY_RECTANGLE:
            this.image_path = "assets/image/rect.png";
            isFilled = false;
            break;
        }
        
        canvas.style.cursor = "url(assets/image/pencil.png) 0 50, auto";
        this.eraser_mode = false;
        curShape = idx;
        console.log("isDahsed : " + isDashed + " isFilled : " + isFilled);
      },

      setColor: function(color) {
        console.log(color);
        this.color_name = color;
        switch (color) {
          case "red":
            curColor = COLOR_TYPE_RED;
            this.color_filter = 'filter: invert(28%) sepia(95%) saturate(3158%) hue-rotate(342deg) brightness(100%) contrast(126%)';
            break;
          case "orange":
            curColor = COLOR_TYPE_ORANGE;
            this.color_filter = 'filter: invert(68%) sepia(50%) saturate(4989%) hue-rotate(341deg) brightness(103%) contrast(105%)';
            break;
          case "yellow":
            curColor = COLOR_TYPE_YELLOW;
            this.color_filter = 'filter: invert(100%) sepia(30%) saturate(7500%) hue-rotate(359deg) brightness(106%) contrast(101%)';
            break;
          case "green":
            curColor = COLOR_TYPE_GREEN;
            this.color_filter = 'filter: invert(59%) sepia(17%) saturate(1960%) hue-rotate(85deg) brightness(90%) contrast(90%)';
            break;
          case "blue":
            curColor = COLOR_TYPE_BLUE;
            this.color_filter = 'filter: invert(42%) sepia(49%) saturate(1696%) hue-rotate(167deg) brightness(102%) contrast(101%)';
            break;
          case "indigo":
            curColor = COLOR_TYPE_INDIGO;
            this.color_filter = 'filter: invert(19%) sepia(63%) saturate(3504%) hue-rotate(233deg) brightness(98%) contrast(86%)';
            break;
          case "jaju":
            curColor = COLOR_TYPE_JAJU;
            this.color_filter = 'filter: invert(42%) sepia(24%) saturate(1517%) hue-rotate(251deg) brightness(85%) contrast(89%)';
            break;

          case "purple":
            curColor = COLOR_TYPE_PURPLE;
            this.color_filter = 'filter: invert(16%) sepia(99%) saturate(7500%) hue-rotate(273deg) brightness(94%) contrast(123%)';
            break;

          case "black":
            curColor = COLOR_TYPE_BLACK;
            this.color_filter = 'filter: invert(0%) sepia(0%) saturate(8%) hue-rotate(253deg) brightness(100%) contrast(100%)';
            break;

          case "darker_grey":
            curColor = COLOR_TYPE_DARKER_GREY;
            this.color_filter = 'filter: invert(49%) sepia(0%) saturate(1276%) hue-rotate(143deg) brightness(101%) contrast(73%)';
            break;
          case "grey":
            curColor = COLOR_TYPE_GREY;
            this.color_filter = 'filter: invert(87%) sepia(3%) saturate(0%) hue-rotate(230deg) brightness(90%) contrast(91%)';
            break;

          case "white":
            curColor = COLOR_TYPE_WHITE;
            this.color_filter = 'filter: invert(100%) sepia(100%) saturate(0%) hue-rotate(34deg) brightness(105%) contrast(104%)';
            break;
        }

        console.log(curColor);
        console.log(this.color_filter);
      }
    },
  })
