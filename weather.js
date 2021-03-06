require('dotenv').config();
const axios = require('axios');
const { app, Menu, nativeImage } = require('electron');

let myMenu = null;

const getTime = () => {
  const today = new Date();
  return today.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
};
// fetching weather data
const fetchWeather = async (lat, lon) => {
  const res = await axios.get(process.env.API_URL, {
    params: {
      appid: process.env.API_KEY,
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
  const updatedTime = getTime();

  myMenu = Menu.buildFromTemplate([
    {
      label: description,
      type: 'normal',
    },
    {
      type: 'separator',
    },
    {
      label: 'Last Update Time',
      type: 'normal',
    },
    {
      label: updatedTime,
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
