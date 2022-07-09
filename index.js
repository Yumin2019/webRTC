function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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