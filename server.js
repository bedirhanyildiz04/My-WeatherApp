const http = require('http');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { parse } = require('querystring');

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/weather')) {
    handleWeatherRequest(req, res);
  } else if (req.url.startsWith('/forecast')) {
    handleForecastRequest(req, res);
  } else {
    serveStaticFile(req, res);
  }
});

const handleWeatherRequest = async (req, res) => {
  const { city, apiKey } = parseUrlParams(req.url);
  console.log('City:', city);

  try {
    const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
    const response = await axios.get(apiUrl);
    console.log('API Response:', response.data);

    const weatherData = {
      city: response.data.location.name,
      country: response.data.location.country,
      description: response.data.current.condition.text,
      temperature: response.data.current.temp_c,
      humidity: response.data.current.humidity,
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(weatherData));
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Error fetching weather data' }));
  }
};

const handleForecastRequest = async (req, res) => {
  const { city, apiKey } = parseUrlParams(req.url);
  console.log('City (Forecast):', city);

  try {
    const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=5`;
    const response = await axios.get(apiUrl);
    console.log('Forecast API Response:', response.data);

    const forecastData = response.data.forecast.forecastday.map(item => ({
      date: item.date_epoch,
      maxTemp: item.day.maxtemp_c,
      minTemp: item.day.mintemp_c,
      icon: `https:${item.day.condition.icon}`,
    }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(forecastData));
  } catch (error) {
    console.error('Error fetching weather forecast data:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Error fetching weather forecast data' }));
  }
};

const parseUrlParams = (url) => {
  const urlParams = new URLSearchParams(url.split('?')[1]);
  return {
    city: urlParams.get('city'),
    apiKey: urlParams.get('apiKey'),
  };
};

const serveStaticFile = (req, res) => {
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  let extname = path.extname(filePath);
  let contentType = 'text/html';

  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    default:
      break;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
};

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
