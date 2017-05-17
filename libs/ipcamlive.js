const request = require('request');
const crypto = require('crypto');
const FileCookieStore = require('tough-cookie-filestore');
const cheerio = require('cheerio');
const async = require('async');

class IPCamLive {
  
  constructor(config) {
    this.cookie = null;
    this.config = config || {user: '', pass: ''};
    this.request = this.createRequest();
  }
  
  createRequest() {
    var j = request.jar(new FileCookieStore('cookies.json'))
    return request.defaults({jar : j});
  }
  
  getCameras(callback) {
    var self = this;
    this.request(`https://ipcamlive.com/ajax/getcameras.php`, function (err, response, body) {
      if (err) return callback(err);
      // login again
      if (!body.trim()) {
        return self.login(function () {
          self.getCameras(callback);
        });
      }
      try {
        const response = JSON.parse(body);
        return callback(null, JSON.parse(body));  
      } catch (e) {
        return callback({error: e, body: body});
      }
    });
  }
  
  getCameraToken(camId, callback) {
    this.request(`https://ipcamlive.com/camerapage?id=${camId}`, function (err, response, body) {
      if (err) return callback(err);
      const matchToken = body.match(/var token = '([a-z0-9]+)'/i);
      if (matchToken && matchToken[1]) return callback(null, matchToken[1]);
      return callback({error: 'Cannot parse token', debug: body});
    });
  }
  
  getCamerasWithToken(callback) {
    var self = this;
    this.getCameras(function (err, cams) {
      if (err) return callback(err);
      async.mapLimit(cams, 4, function (cam, done) {
        self.getCameraToken(cam.id, function (err, token) {
          if (err) return done(err);
          cam.token = token;
          cam.iframe = `https://ipcamlive.com/player/player.php?alias=${cam.alias}&autoplay=1&disablevideofit=1&token=${token}`;
          done(null, cam);
        });
      }, callback);
    });
  }
  
  login(callback) {
    const md5 = crypto.createHash('md5').update(this.config.pass).digest("hex");
    this.request(`https://ipcamlive.com/ajax/login.php?loginname=${this.config.user}&password=${md5}`, function (err, response, body) {
      console.log('response', response.headers);
      if (err) return callback(err);
      callback(body);
    });
  }
  
}

module.exports = IPCamLive;