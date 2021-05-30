require('dotenv').config();
const path = require('path');
const { app, Tray, nativeImage } = require('electron');
const changeWeather = require('./weather');
const wifiLocation = require('./wifi_location');

let tray = null;
let lat = null;
let lon = null;

const resourcesDir =
  process.env.NODE_ENV === 'dev'
    ? './resources/'
    : path.join(process.resourcesPath + '/resources/');

app.dock.hide();

app
  .whenReady()
  .then(() => {
    // initialize tray
    const loading = nativeImage
      .createFromPath(resourcesDir + 'loading.png')
      .resize({ width: 32, height: 32 });
    tray = new Tray(loading);
    tray.setToolTip('WeatherMenu');
  })
  .then(() => {
    // get a current location and get weather
    wifiLocation.location(function (err, val) {
      lat = val.lat;
      lon = val.lng;
      changeWeather(tray, lat, lon, resourcesDir);
    });
  });

// fetch weather and change icon every 10 min
setInterval(() => {
  changeWeather(tray, lat, lon, resourcesDir);
}, 600000);
