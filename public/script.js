const apiKey = 'MY_API_KEY';

async function getWeather() {
  const city = document.getElementById('cityInput').value;
  if (!city) {
    alert('Please enter a city.');
    return;
  }

  try {
    const response = await axios.get(`http://localhost:3000/weather?city=${city}&apiKey=${apiKey}`);
    const weatherData = response.data;
    displayWeather(weatherData);
    animateCard(); 
    getForecast(city);
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

function displayWeather(data) {
  const weatherInfo = document.getElementById('weatherInfo');
  const temperature = convertTemperature(data.temperature, 'C');
  const weatherIcon = getWeatherIcon(data.description);
  const isDayTime = isDay(data.description);

  const weatherContainer = document.querySelector('.weather-container');
  weatherContainer.className = isDayTime ? 'weather-container day card rounded' : 'weather-container night card text-white rounded';

  weatherInfo.innerHTML = `
    <h2 class="mb-3">${data.city}, ${data.country}</h2>
    <p class="mb-2 weather-description">${data.description}</p>
    <img src="${weatherIcon.icon}" alt="Weather Icon" class="weather-icon ${weatherIcon.class}">
    <p class="mb-1">Temperature: ${temperature.value} ${temperature.unit}</p>
    <p>Humidity: ${data.humidity}%</p>
  `;
}

async function getForecast(city) {
  try {
    const response = await axios.get(`http://localhost:3000/forecast?city=${city}&apiKey=${apiKey}`);
    const forecastData = response.data;
    displayForecast(forecastData);
  } catch (error) {
    console.log('Error fetching weather forecast data:', error);
  }
}


function displayForecast(data) {
  const forecastContainer = document.getElementById('forecastContainer');
  forecastContainer.innerHTML = '';

  if (data.length === 0) {
    return; 
  }

  const forecastList = document.createElement('ul');
  forecastList.classList.add('forecast-list');

  data.forEach(item => {
    const date = new Date(item.date * 1000);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const maxTemp = convertTemperature(item.maxTemp, 'C');
    const minTemp = convertTemperature(item.minTemp, 'C');

    const forecastItem = document.createElement('li');
    forecastItem.classList.add('forecast-item', 'card', 'rounded');
    forecastItem.innerHTML = `
      <p>${day}</p>
      <img src="${item.icon}" alt="Weather Icon" class="forecast-icon">
      <p>${maxTemp.value} ${maxTemp.unit} / ${minTemp.value} ${minTemp.unit}</p>
    `;

    forecastList.appendChild(forecastItem);
  });

  forecastContainer.appendChild(forecastList);
  animateCard();
}

function convertTemperature(value, unit) {
  if (unit === 'C') {
    return { value: value.toFixed(1), unit: '°C' };
  } else if (unit === 'F') {
    const fahrenheit = (value * 9 / 5) + 32;
    return { value: fahrenheit.toFixed(1), unit: '°F' };
  } else {
    return { value: value.toFixed(1), unit: '°C' };
  }
}

function getWeatherIcon(description) {
  const defaultIcon = {
    'clear': 'https://bdryazilim.com/dersler/proje_dosyalari/weather-api/images/clear.png',
    'cloud': 'https://uxwing.com/wp-content/themes/uxwing/download/weather/weather-icon.png',
    'rain': 'https://images.unsplash.com/photo-1705090669849-883c9430d712?q=80&w=1709&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'snow': 'https://static.vecteezy.com/system/resources/previews/007/488/951/original/light-snow-color-icon-winter-snowy-weather-cloud-and-snowflake-weather-forecast-isolated-illustration-vector.jpg',
    'sunny': 'https://bdryazilim.com/dersler/proje_dosyalari/weather-api/images/clear.png',
    'partly cloud': 'https://uxwing.com/wp-content/themes/uxwing/download/weather/weather-icon.png',
    'light rain': 'https://p7.hiclipart.com/preview/808/125/264/weather-forecasting-severe-weather-rain-storm-light-rain.jpg',
  };

  const iconUrl = defaultIcon[description.toLowerCase()];

  return { icon: iconUrl, class: description.toLowerCase() };
}

function isDay(description) {
  return description.toLowerCase().includes('clear') || description.toLowerCase().includes('cloud');
}

function animateCard() {
  const weatherCard = document.querySelector('.weather-container');

  weatherCard.classList.add('animate__animated', 'animate__slideInUp');

  weatherCard.addEventListener('animationend', () => {
    weatherCard.classList.remove('animate__animated', 'animate__slideInUp');
  }, { once: true });
}
