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
})


