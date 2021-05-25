require('dotenv').config();
const axios = require('axios');
const { app, Menu, nativeImage } = require('electron');

let myMenu = null;

// fetching weather data
const fetchWeather = async (lat, lon) => {
  const res = await axios.get(process.env.API_URL, {
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
const changeWeather = async (tray, lat, lon, dir) => {
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
  const img = nativeImage
    .createFromPath(dir + icon + '.png')
    .resize({ width: 32, height: 32 });

  tray.setImage(img);
  tray.setContextMenu(myMenu);
};

module.exports = changeWeather;
