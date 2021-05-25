require('dotenv').config();
const path = require('path');
const { app, Tray } = require('electron');
const publicIp = require('public-ip');
const geoip = require('geoip-lite');
const changeWeather = require('./weather');

let ip = null;
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
    tray = new Tray(path.join(resourcesDir, 'loading.png'));
    tray.setToolTip('WeatherMenu');
  })
  .then(async () => {
    // get a current location by public ip
    ip = await publicIp.v4();
    const geo = geoip.lookup(ip);
    lat = geo.ll[0];
    lon = geo.ll[1];
  })
  .then(() => {
    // intialize icon
    changeWeather(tray, lat, lon, resourcesDir);
  });

// fetch weather and change icon every 10 min
setInterval(() => {
  changeWeather(tray, lat, lon, resourcesDir);
}, 600000);
