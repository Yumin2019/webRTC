// server.js
const app = require('express')();
var express = require('express');
const { SocketAddress } = require('net');
const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, options);

app.use(express.static(__dirname));
app.get("", (req, res) => {
  res.sendFile(__dirname + "/index.html")
});

const SUCCESS = "success";
const FAIL = "fail";
var socketList = [];

var presenterName = "";
var presenterUUID = "";
var usePresenterDialog = false;
var presenterRquestUUID = "";

function printLog(event, json) {
  console.log("============================== " + new Date().toTimeString().split(" ")[0].toString() + ": " + event + " ==============================");
  console.log(json);
}

var shapeList = [];
var chattingList = [];
var userList = [];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function printSocketList() {
  console.log("================= SocketList ====================");
  for (var i = 0; i < socketList.length; ++i) {
    console.log("socket[" + i + "].uuid = " + socketList[i].uuid);
  }
}

function getSocketUUID(socket) {
  for (var i = 0; i < socketList.length; ++i) {
    if (socketList[i].socket == socket) {
      return socketList[i].uuid;
    }
  }
  return "";
}

function findSocket(uuid) {
  for (var i = 0; i < socketList.length; ++i) {
    if (socketList[i].uuid == uuid) {
      return socketList[i].socket;
    }
  }
  return null;
}

function findUserName(uuid) {
  for (var i = 0; i < userList.length; ++i) {
    if (userList[i].uuid == uuid) {
      return userList[i].name;
    }
  }
  return "";
}

function removeShapeInList(idx) {
  if (shapeList.length == 0) {
    return;
  }

  shapeList.splice(idx, 1);
}

server.listen(3000, () => {
  console.log(`Server running on 3000`);
});


io.on('connection', socket => {
  socketList.push({ socket: socket, uuid: rand(10000, 99999).toString() });
  printSocketList();

  socket.on("onEventJoinConf", (callback) => {
    let uuid = getSocketUUID(socket);
    let name = "GUEST " + uuid;
    userList.push({ name: name, uuid: uuid });
    var json = {
      shapeList: shapeList, chattingList: chattingList, userList: userList, givenName: name, givenUUID: uuid,
      presenterName: presenterName, presenterUUID: presenterUUID,
    };

    // ????????? ????????? ???????????? ????????????. 
    socket.emit("onEventJoinConf", json);

    // ?????? ?????????????????? ?????? ????????? ????????? ?????????.
    socket.broadcast.emit("onEventUserListChanged", { userList: userList });
    printLog("onEventJoinConf", json);
  });

  socket.on("disconnect", s => {
    // ????????? ????????? ??????, socketList??? userList?????? ????????????. 
    let uuid = getSocketUUID(socket);
    for (var i = 0; i < socketList.length; ++i) {
      if (socketList[i].uuid === uuid) {
        uuid = socketList[i].uuid;
        socketList.splice(i, 1);
        break;
      }
    }
    printSocketList();

    if (uuid != "") {
      for (var i = 0; i < userList.length; ++i) {
        if (userList[i].uuid === uuid) {
          userList.splice(i, 1);
          socket.broadcast.emit("onEventUserListChanged", { userList: userList });

          // ????????? ????????? ?????? ?????? ?????? ???????????? ??????, ?????? ?????? ??????.
          if(usePresenterDialog && (presenterRquestUUID == uuid || presenterUUID == uuid)) {
            let socketA = findSocket(presenterRquestUUID);
            let socketB = findSocket(presenterUUID);
      
            if(socketA != null) {
              socketA.emit("onEventPresenterDialogCallback", {value: false, comment: "exited user " + uuid});
            }
            if(socketB != null) {
              socketB.emit("onEventPresenterDialogCallback", {value: false, comment: "exited user " + uuid});
            }

            usePresenterDialog = false;
            presenterRquestUUID = "";
          }

          // ???????????? ????????? ????????? ??????
          if (uuid == presenterUUID) {
            presenterName = "";
            presenterUUID = "";
            socket.broadcast.emit("onEventPresenterChanged", { presenterName: presenterName, presenterUUID: presenterUUID });
          }

          break;
        }
      }
    }

    console.log(userList);
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
    for (var i = 0; i < shapeList.length; ++i) {
      if (shapeList[i].uuid === json.uuid) {
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
    for (var i = 0; i < shapeList.length; ++i) {
      if (shapeList[i].owner === json.owner) {
        removeShapeInList(i);
        --i;
      }
    }
    callback(SUCCESS);
  });

  socket.on("onEventRequestPresenterPermission", (json, callback) => {
    printLog("onEventRequestPresenterPermission", json);
    // ????????? ????????? ?????? ????????? ?????? ???????????? ????????? ???????????? ???????????? ?????????. 
    if (presenterUUID == "") {
      presenterName = json.name;
      presenterUUID = json.uuid;
      io.sockets.emit("onEventPresenterChanged", { presenterName: presenterName, presenterUUID: presenterUUID });
    } else if (presenterUUID != json.uuid) {
      // ????????? ????????? ????????? ?????? ???????????? ????????? ????????????.
      if(!usePresenterDialog) {
        usePresenterDialog = true;
        let socket = findSocket(presenterUUID);
        presenterRquestUUID = json.uuid;
        socket.emit("onEventRequestPresenterPermission", json);
      } else {
        // ?????? ????????? ?????? ????????? ?????? ?????? ???????????? ???????????? ?????????.
        callback(FAIL);
        return;
      }
    }

    callback(SUCCESS);
  });


  socket.on("onEventRevokePresenterPermission", (json, callback) => {
    printLog("onEventRevokePresenterPermission", json);
    // ????????? ????????? ????????????.
    if (presenterUUID == json.uuid) {
      presenterName = "";
      presenterUUID = "";
      io.sockets.emit("onEventPresenterChanged", { presenterName: presenterName, presenterUUID: presenterUUID });
      callback(SUCCESS);
    }
  });

  // ????????? ?????? dialog ?????? callback??? ????????????.
  socket.on("onEventPresenterDialogCallback", (json) => {
    printLog("onEventPresenterDialogCallback", json);
    // ??? ?????? ????????? ?????? ?????? ????????? ?????????, ????????? ????????? ????????????. 
    if (usePresenterDialog) {
      usePresenterDialog = false;
      var value = json.value;
      let from = json.from;
      let to = json.to;
      presenterRquestUUID = "";

      let socketA = findSocket(from);
      let socketB = findSocket(to);

      if(socketA != null) {
        socketA.emit("onEventPresenterDialogCallback", {value: value, from: from, to: to});
      }
      if(socketB != null) {
        socketB.emit("onEventPresenterDialogCallback", {value: value, from: from, to: to});
      }

      if(value) { 
        // ????????? ?????? ????????? ????????? ?????? ????????? ????????? ??????
        presenterName = findUserName(json.from);
        presenterUUID = json.from;
        io.sockets.emit("onEventPresenterChanged", { presenterName: presenterName, presenterUUID: presenterUUID });
      }
    }
  });

});

