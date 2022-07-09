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

io.on('connection', socket => {
    socket.on("onEventSendMessage", (arg, callback) => {
        console.log(arg);
        // send message except for sender
        socket.broadcast.emit("onEventReceiveMessage", arg);
        // io.sockets.emit("onEventReceiveMessage", arg);
        // send success event to sender
        callback(SUCCESS);
      });
});

server.listen(3000, () => {
    console.log(`Server running on 3000`);
});


