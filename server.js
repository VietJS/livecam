// server.js
// where your node app starts

// init project
var IPCamLive = require('./libs/ipcamlive');
var express = require('express');
var app = express();

var ipcamlive = new IPCamLive({
  user: process.env.IPCAMLIVE_USER,
  pass: process.env.IPCAMLIVE_PASS
});

var CACHED = {};

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/cameras', function (request, response) {
  if (!CACHED.cameras || request.query.refresh) {
    ipcamlive.getCamerasWithToken(function (err, cams) {
      CACHED.cameras = cams;
      response.send(cams);
    });     
  } else {
    response.send(CACHED.cameras);
  }
});

app.get("/dreams", function (request, response) {
  response.send(dreams);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
