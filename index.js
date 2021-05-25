require('dotenv').config();
const path = require('path');
const { app, Menu, Tray } = require('electron');
const axios = require('axios');
const publicIp = require('public-ip');
const geoip = require('geoip-lite');

let ip = null;
let tray = null;
let myMenu = null;
let lat = null;
let lon = null;

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

  let { icon, description } = res.data.weather[0];
  description =
    description[0].toUpperCase() + description.substring(1, description.length);

  return {
    icon,
    description,
  };
};

// get a icon name by weather api, then change icon and menu
const changeWeather = async () => {
  const { icon, description } = await fetchWeather(lat, lon);

  myMenu = Menu.buildFromTemplate([
    {
      label: description,
      type: 'normal',
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit',
      type: 'normal',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setImage(defaultDir + icon + '.png');
  tray.setContextMenu(myMenu);
};

app.dock.hide();

app
  .whenReady()
  .then(() => {
    // initialize tray
    tray = new Tray(path.join(defaultDir, defaultImg));
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
    changeWeather();
  });

// fetch weather and change icon every 10 min
setInterval(changeWeather, 600000);
