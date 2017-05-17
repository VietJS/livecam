// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

new Vue({
  el: '#app',
  data: function () {
    return {
      cameras: [],
      start: 0,
      end: 6
    };
  },
  mounted: function () {
    
  },
  methods: {
    getCameras: function () {
      var vm = this;
      $.get('/cameras', function(cameras) {
        Vue.set(vm, 'cameras', cameras);
      });      
    },
    refreshCameras: function () {
      var vm = this;
      $.get('/cameras?refresh=1', function(cameras) {
        Vue.set(vm, 'cameras', cameras);
      });      
    },
    getIframe: function (camera) {
      return 'https://ipcamlive.com/player/player.php?alias='+ camera.alias +'&autoplay=1&disablevideofit=1&token=' + camera.token;
    },
    viewCameras: function (start, end) {
      console.log(this.cameras.slice(start, end));
      return this.cameras.slice(start, end);
    }
  }
});
