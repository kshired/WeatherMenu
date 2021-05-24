require('dotenv').config();
const path = require('path');
const axios = require('axios');
const { app, Menu, Tray } = require('electron');
const publicIp = require('public-ip');
const geoip = require('geoip-lite');

let ip = null;
let tray = null;
let geo = null;

const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

const defaultDir =
  process.env.NODE_ENV === 'dev'
    ? './resources/'
    : path.join(process.resourcesPath + '/resources/');

const defaultImg = 'loading.png';

// fetching weather data
const fetchWeather = async (lat, lon) => {
  const res = await axios.get(API_URL, {
    params: {
      appid: process.env.API_KEY,
      units: 'metric',
      lat,
      lon,
    },
  });
  return res.data.weather[0].icon;
};

// get a icon name by weather api, then change icon
const changeIcon = async () => {
  const icon = await fetchWeather(geo.ll[0], geo.ll[1]);
  tray.setImage(defaultDir + icon + '.png');
};

app.dock.hide();

app
  .whenReady()
  .then(() => {
    // initialize tray
    tray = new Tray(path.join(defaultDir, defaultImg));
    const myMenu = Menu.buildFromTemplate([
      {
        label: 'quit',
        type: 'normal',
        click: () => {
          app.quit();
        },
      },
    ]);
    tray.setToolTip('WeatherMenu');
    tray.setContextMenu(myMenu);
  })
  .then(async () => {
    // get a current location by public ip
    ip = await publicIp.v4();
    console.log(ip);
    geo = geoip.lookup(ip);
    console.log(geo.ll);
  })
  .then(() => {
    // intialize icon
    changeIcon();
  });

// fetch weather and change icon every 10 min
setInterval(changeIcon, 600000);
