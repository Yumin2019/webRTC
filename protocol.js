var socket = io.connect("/");

const SUCCESS = "success";
const FAIL = "fail";

var chatList = [];
var chatListDiv = document.getElementById('chatListDiv');

function onEventSendMessage() {
    let message = document.getElementById("input-text").value;
    if(message.length == 0) {
        return;
    } 
    let data = {name: myName.name, message: document.getElementById("input-text").value, date: new Date().toLocaleTimeString()}
    //console.log("onEventSendMessage data: " + JSON.stringify(data));
    socket.emit("onEventSendMessage", data, (response) => {
        //console.log("repsonse : " + response);
        document.getElementById("input-text").value = "";

        // add my message on list
        let htmlElement = '<div class="myMsg"><span class="date">' + data.date + '</span><p class="msg">' + data.message + '</p></div>';
        //console.log(htmlElement);
        chatList.push(htmlElement);
        chatListDiv.insertAdjacentHTML('beforeend', htmlElement);
        
        let scroll = document.getElementById("sidebar");
        //console.log(scroll);
        scroll.scrollTop = scroll.scrollHeight;
    });
}


socket.on("onEventReceiveMessage", (data) => {
    console.log("onEventReceiveMessage data: " + JSON.stringify(data));

    // add other's message on list
    let htmlElement = '<div class="anotherMsg"><span class="anotherName">' + data.name + '</span><span class="msg">' + data.message + '</span><span class="date">' + data.date + '</span></div>';
    //console.log(htmlElement);
    chatList.push(htmlElement);
    chatListDiv.insertAdjacentHTML('beforeend', htmlElement);

    let scroll = document.getElementById("sidebar");
    //console.log(scroll);
    scroll.scrollTop = scroll.scrollHeight;
});

socket.on("onEventAddDrawingShape", (json) => {
    console.log("onEventAddDrawingShape json: " + JSON.stringify(json));

    let shape;
    switch (json.shape) {
        case "SHAPE_TYPE_FREE_LINE":
        case "SHAPE_TYPE_DASHED_FREE_LINE": {
            shape = new DrawingShapeFreeLine(curColor, isFilled, isDashed, thicknessIdx, []);
        }
            break;
        case "SHAPE_TYPE_LINE":
        case "SHAPE_TYPE_DAHSED_LINE": {
            shape = new DrawingShapeLine(curColor, isFilled, isDashed, thicknessIdx, new Point(startX, startY));
        }
            break;
        case "SHAPE_TYPE_ELLIPSE":
        case "SHAPE_TYPE_EMPTY_ELLIPSE": {
            shape = new DrawingShapeEllipse(curColor, isFilled, isDashed, thicknessIdx, new Point(startX, startY));
        }
            break;
        case "SHAPE_TYPE_RECTANGLE":
        case "SHAPE_TYPE_EMPTY_RECTANGLE": {
            shape = new DrawingShapeRectangle(curColor, isFilled, isDashed, thicknessIdx, new Point(startX, startY));
        }
            break;
        case "SHAPE_TYPE_ERASER": {
            shape = new DrawingShapeEraser(startX, startY);
        }
            break;
        case "SHAPE_TYPE_STAMP": {
            shape = new DrawingShapeStamp(stampIdx, new Point(startX, startY));
        }
            break;
        default: {
            return;
        }
    }

    shape.loadJson(json);
    console.log("onEventAddDrawingShape loadJson : " + shape.toString());
    shapeList.push(shape);
    redraw();
});

socket.on("onEventDeleteDrawingShape", (json) => {
    console.log("onEventDeleteDrawingShape json: " + JSON.stringify(json));

    for(var i = 0; i < shapeList.length; ++i) {
        if(json.uuid == shapeList[i].uuid) {
            removeShapeInList(i);
            redraw();
            break;
        }
    }
});

socket.on("onEventDeleteDrawingShapeAll", (json) => {
    console.log("onEventDeleteDrawingShapeAll json: " + JSON.stringify(json));
    shapeList = [];
    redraw();
});

socket.on("onEventDeleteMyDrawingShapeAll", (json) => {
    console.log("onEventDeleteMyDrawingShapeAll json: " + JSON.stringify(json));
    for(var i = 0; i < shapeList.length; ++i) {
        if(json.owner == shapeList[i].owner) {
            removeShapeInList(i);
            --i;
        }
    }
    redraw();
});

socket.on("onEventJoinConf", (json) => {
    console.log("onEventJoinConf json: " + JSON.stringify(json));

    for(var i = 0; i < json.shapeList.length; ++i) {
        let shape;
        switch (json.shapeList[i].shape) {
            case "SHAPE_TYPE_FREE_LINE":
            case "SHAPE_TYPE_DASHED_FREE_LINE": {
                shape = new DrawingShapeFreeLine(curColor, isFilled, isDashed, thicknessIdx, []);
            }
                break;
            case "SHAPE_TYPE_LINE":
            case "SHAPE_TYPE_DAHSED_LINE": {
                shape = new DrawingShapeLine(curColor, isFilled, isDashed, thicknessIdx, new Point(startX, startY));
            }
                break;
            case "SHAPE_TYPE_ELLIPSE":
            case "SHAPE_TYPE_EMPTY_ELLIPSE": {
                shape = new DrawingShapeEllipse(curColor, isFilled, isDashed, thicknessIdx, new Point(startX, startY));
            }
                break;
            case "SHAPE_TYPE_RECTANGLE":
            case "SHAPE_TYPE_EMPTY_RECTANGLE": {
                shape = new DrawingShapeRectangle(curColor, isFilled, isDashed, thicknessIdx, new Point(startX, startY));
            }
                break;
            case "SHAPE_TYPE_ERASER": {
                shape = new DrawingShapeEraser(startX, startY);
            }
                break;
            case "SHAPE_TYPE_STAMP": {
                shape = new DrawingShapeStamp(stampIdx, new Point(startX, startY));
            }
                break;
            default: {
                continue;
            }
        }
    
        shape.loadJson(json.shapeList[i]);
        console.log("json.shapeList[i] loadJson : " + shape.toString());
        shapeList.push(shape);
    }

    for(var i = 0; i < json.chattingList.length; ++i) {
        let htmlElement = '<div class="anotherMsg"><span class="anotherName">' + json.chattingList[i].name + '</span><span class="msg">' + json.chattingList[i].message + '</span><span class="date">' + json.chattingList[i].date + '</span></div>';
        chatList.push(htmlElement);
        chatListDiv.insertAdjacentHTML('beforeend', htmlElement);
    }
    
    let scroll = document.getElementById("sidebar");
    scroll.scrollTop = scroll.scrollHeight;
    redraw();
});
