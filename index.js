function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'green';
ctx.fillRect(0, 0, 150, 100);

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

var uuid = 'GUEST ' + rand(10000, 99999);
console.log(uuid);
// socket.emit("onEventSetUserName", name);
var myName = new Vue({
    el: '#my-name',
    data: {
      name: uuid,
    }
  })

  var ScreenMode = {
    videoShare: { value: 0, name: "videoShare" },
    screenShare: { value: 1, name: "screenShare" },
    drawingShare: { value: 2, name: "drawingShare" },
  };

  function getDateTime() {
    return new Date().toTimeString().split(" ")[0];
  }

  var curScreenMode = ScreenMode.videoShare;

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
      isVideoShareMode: true,
      isScreenShareMode: false,
      isDrawingShareMode: false,
    },

    methods: {
      updateShareMode(mode) {
        console.log("test");
        this.isVideoShareMode = false;
        this.isScreenShareMode = false;
        this.isDrawingShareMode = false;

        switch (mode) {
          case ScreenMode.videoShare: this.isVideoShareMode = true; break;
          case ScreenMode.screenShare: this.isScreenShareMode = true; break;
          case ScreenMode.drawingShare: this.isDrawingShareMode = true; break;
        }
      }
    }
  })

  function setScreenMode(screenMode) {
    if (curScreenMode != screenMode) {
      curScreenMode = screenMode;
      console.log(curScreenMode);

      leftToolbar.updateShareMode(screenMode);
    }
  }