// server.js
const app = require('express')();
var express = require('express');
const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, options);

app.use(express.static(__dirname));
app.get("", (req, res) => {
    res.sendFile(__dirname + "/index.html")
});

const SUCCESS = "success";
const FAIL = "fail";

function printLog(event, json) {
  console.log("============================== " + new Date().toTimeString().split(" ")[0].toString() + ": " + event + " ==============================");
  console.log(json);
}

var shapeList = [];
var chattingList = [];

function removeShapeInList(idx) {
  if(shapeList.length == 0) {
    return;
  }
  
  for(var i = idx; i < shapeList.length - 1; ++i) {
    shapeList[i] = shapeList[i + 1]; 
  }
  shapeList.pop();
}

io.on('connection', socket => {
    socket.on("onEventJoinConf", (callback) => {
      socket.emit("onEventJoinConf", {shapeList: shapeList, chattingList: chattingList});
    });

    socket.on("onEventSendMessage", (json, callback) => {
      printLog("onEventSendMessage", json);
      // send message except for sender
      socket.broadcast.emit("onEventReceiveMessage", json);
      chattingList.push(json);
      // io.sockets.emit("onEventReceiveMessage", arg);
      // send success event to sender
      callback(SUCCESS);
    });

      socket.on("onEventAddDrawingShape", (json, callback) => {
        printLog("onEventAddDrawingShape", json);
        socket.broadcast.emit("onEventAddDrawingShape", json);
        shapeList.push(json);
        callback(SUCCESS);
      });

      socket.on("onEventDeleteDrawingShape", (json, callback) => {
        printLog("onEventDeleteDrawingShape", json);
        socket.broadcast.emit("onEventDeleteDrawingShape", json);
        for(var i = 0; i < shapeList.length; ++i) {
          if(shapeList[i].uuid === json.uuid) {
            removeShapeInList(i);
            break;
          }
        }
        
        callback(SUCCESS);
      });

      socket.on("onEventDeleteDrawingShapeAll", (json, callback) => {
        printLog("onEventDeleteDrawingShapeAll", json);
        socket.broadcast.emit("onEventDeleteDrawingShapeAll", json);
        shapeList = [];
        callback(SUCCESS);
      });

      socket.on("onEventDeleteMyDrawingShapeAll", (json, callback) => {
        printLog("onEventDeleteMyDrawingShapeAll", json);
        socket.broadcast.emit("onEventDeleteMyDrawingShapeAll", json);
        for(var i = 0; i < shapeList.length; ++i) {
          if(shapeList[i].owner === json.owner) {
            removeShapeInList(i);
            --i;
          }
        }
        callback(SUCCESS);
      });
});

server.listen(3000, () => {
    console.log(`Server running on 3000`);
});


