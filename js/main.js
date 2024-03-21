// links to tabs
const tabToday = document.querySelector('.tab-today');
const contentToday = document.querySelector('.content--today');
const tab5day = document.querySelector('.tab-5-day');
const content5Days = document.querySelector('.content--five-days');
const contentNonLocation = document.querySelector('.content--non-location');
//search form
const form_control = document.querySelector('.form-control');
const btn_search = document.querySelector('.btn-outline-secondary');
//empty array for save cities
let cities = [];
//tab today
weatherData = [];
const itemBlocks = document.querySelectorAll('.row-items .item:not(:first-child)');
const nearbyPlacesBlock = document.querySelector('.places-item .items-block');
// API key OpenWeatherMap
const apiKey = "ecb45209976ad5f0e9e39ee2e77cf00b";
let locationName;
let locationData;
// start processes
form_control.value = "";
loadCityList();
getLocation();


//update info for nearest cities
async function getNearestCities(latitude, longitude) {
   const apiKey = "ecb45209976ad5f0e9e39ee2e77cf00b";
   const response = await fetch(`https://api.openweathermap.org/data/2.5/find?lat=${latitude}&lon=${longitude}&cnt=4&appid=${apiKey}`);
   const data = await response.json();

   if (data && data.list && data.list.length > 0) {
       const nearestCitiesWeather = data.list.map(city => ({
           name: city.name,
           temperature: (city.main.temp - 273.15).toFixed(0),
           weatherIcon: getWeatherIcon(city.weather[0].icon)
       }));
       const itemsBlock = document.querySelector('.places-item .items-block');
       itemsBlock.innerHTML = '';

       nearestCitiesWeather.forEach(cityWeather => {
           const item = document.createElement('div');
           item.classList.add('item');

           const cityName = document.createElement('p');
           cityName.classList.add('city');
           cityName.textContent = cityWeather.name;

           const info = document.createElement('div');
           info.classList.add('info');

           const img = document.createElement('img');
           img.classList.add('mini-img-block');
           img.src = cityWeather.weatherIcon;
           img.alt = 'Weather icon';

           const temp = document.createElement('p');
           temp.classList.add('temp');
           temp.textContent = `${cityWeather.temperature}°C`;

           info.appendChild(img);
           info.appendChild(temp);

           item.appendChild(cityName);
           item.appendChild(info);

           itemsBlock.appendChild(item);
       });

       console.log(nearestCitiesWeather);
   } else {
       throw new Error('No nearest cities found');
   }
}
// func change weather icon from openWeather
function getWeatherIcon(weatherCode) {
    return `https://openweathermap.org/img/w/${weatherCode}.png`;
}
// func change weather icon
function setWeatherImage(forecast, selector) {
   const imgBlock = document.querySelector(selector);
   let imagePath = '';

   // Обробляємо різні випадки опису погоди
   switch (forecast) {
       case 'clear':
       case 'clear sky':
           imagePath = 'img/sun.png';
           break;
       case 'clouds':
       case 'scattered clouds':
       case 'broken clouds':
       case 'overcast clouds':
       case 'few clouds':
           imagePath = 'img/clouds.png';
           break;
       case 'rain':
       case 'light rain':
           imagePath = 'img/rain.png';
           break;
       case 'snow':
       case 'light snow':
           imagePath = 'img/snowy.png';
           break;
       // Додайте інші випадки, якщо потрібно
       default:
           imagePath = 'img/sun.png';
           break;
   }

   // Присвоюємо шлях до картинки зображенню
   imgBlock.src = imagePath;
}
//get browser location
function getLocation() {
   if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(showPosition, showError);
   } else {
       openTabNonLocation();
   }

   async function showPosition(position) {
       getLocationName(position.coords.latitude, position.coords.longitude);
       const { latitude, longitude } = position.coords;
       try {
           const nearestCities = await getNearestCities(latitude, longitude);
       } catch (error) {
           console.error('Error:', error);
       }
   }
}
//show current user position
async function showPosition(position) {
   getLocationName(position.coords.latitude, position.coords.longitude);
   const { latitude, longitude } = position.coords;

   // Викликаємо функції, що вимагають значень latitude і longitude
   try {
       const nearestCities = await getNearestCities(latitude, longitude);
       console.log('Nearest cities:', nearestCities);
   } catch (error) {
       console.error('Error:', error);
   }
}
//get location name
function getLocationName(latitude, longitude) {
   const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
 
   fetch(url)
       .then(response => response.json())
       .then(data => {
            locationName = data.name;
            checkLocation(locationName); // Call the function that depends on locationName here
            // Or move the code that depends on locationName here
       })
       .catch(error => {
           console.error("Error fetching location:", error);
           alert("Please input your city");
       });
}
//func check location
function checkLocation(locationName) {
   const city = findCityByName(locationName);
   if (city !== null) {
       locationData = { name: locationName, id: city.id, };
       openTabLocation();
       console.log("City Name:", locationName);
       form_control.value = locationName;
       uploadWeatherDataHourly(locationName);
       uploadWeatherDataCurrent(locationName);

   } else {
       alert("Incorrect name location, please input again");
   }
}
//current weather
function uploadWeatherDataCurrent(locationName) {
   const apiKey = 'ecb45209976ad5f0e9e39ee2e77cf00b';
   const url = `https://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=${apiKey}`;

   fetch(url)
       .then(response => response.json())
       .then(data => {
           if (data.weather && data.weather.length > 0) {
               const date = new Date(data.dt * 1000);
               const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
               const forecast = data.weather[0].description;
               setWeatherImage(forecast, '.main-item .img-block');
               const temp = (data.main.temp - 273.15).toFixed(0);
               const realFeel = (data.main.feels_like - 273.15).toFixed(0);
               const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
               const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
               const duration = new Date((data.sys.sunset - data.sys.sunrise) * 1000).toISOString().substr(11, 8);

               const headerDateElement = document.querySelector('.header-item .date');
               const imgTitleElement = document.querySelector('.main-item .img-title');
               const degreeElement = document.querySelector('.main-item .degree');
               const degreeFeelElement = document.querySelector('.main-item .degree-feel');
               const sunriseElement = document.querySelector('.main-item .sunrise');
               const sunsetElement = document.querySelector('.main-item .sunset');
               const durationElement = document.querySelector('.main-item .duration');

               headerDateElement.textContent = formattedDate;
               imgTitleElement.textContent = forecast;
               degreeElement.textContent = `${temp}°C`;
               degreeFeelElement.textContent = `Real Feel ${realFeel}°C`;
               sunriseElement.textContent = `Sunrise: ${sunrise}`;
               sunsetElement.textContent = `Sunset: ${sunset}`;
               durationElement.textContent = `Duration: ${duration}`;
           } else {
               console.error('Error fetching weather data: No weather information available');
           }
       })
       .catch(error => {
           console.error('Error fetching weather data:', error);
       });
}
//hourly weather
function uploadWeatherDataHourly(locationName) {
   const apiKey = 'ecb45209976ad5f0e9e39ee2e77cf00b';
   const url = `https://api.openweathermap.org/data/2.5/forecast?q=${locationName}&appid=${apiKey}`;

   fetch(url)
       .then(response => response.json())
       .then(data => {
           if (data.list && data.list.length > 0) {
               // Очищаємо масив weatherData перед додаванням нових даних
               weatherData.length = 0;

               // Перебираємо список прогнозів погоди для кожної години
               data.list.forEach(hourlyForecast => {
                  const date = new Date(hourlyForecast.dt * 1000);
                  const time = `${date.getHours()}:00`;
                  const forecast = hourlyForecast.weather[0].description;
                  const temp = (hourlyForecast.main.temp - 273.15).toFixed(0);
                  const realFeel = (hourlyForecast.main.feels_like - 273.15).toFixed(0);
                  const wind = hourlyForecast.wind.speed;
                  let imagePath = '';
              
                  // Встановлюємо шлях до зображення залежно від прогнозу погоди
                  switch (forecast) {
                      case 'clear':
                      case 'clear sky':
                          imagePath = 'img/sun.png';
                          break;
                      case 'clouds':
                      case 'scattered clouds':
                      case 'broken clouds':
                      case 'overcast clouds':
                      case 'few clouds':
                          imagePath = 'img/clouds.png';
                          break;
                      case 'rain':
                        case 'light rain':
                          imagePath = 'img/rain.png';
                          break;
                      case 'snow':
                      case 'light snow':
                          imagePath = 'img/snowy.png';
                          break;
                      // Додайте інші випадки, якщо потрібно
                      default:
                          imagePath = 'img/sun.png';
                          break;
                  }
              
                  // Додаємо дані до масиву weatherData
                  weatherData.push({ time, forecast, temp, realFeel, wind, imagePath });
              });
              
              // Відображаємо дані на екрані
              itemBlocks.forEach((block, index) => {
                  const currentData = weatherData[index];
                  const timeElement = block.querySelector('.time');
                  const forecastElement = block.querySelector('.forecast');
                  const tempElement = block.querySelector('.temp');
                  const realFeelElement = block.querySelector('.realFeel');
                  const windElement = block.querySelector('.wind');
                  const imgBlock = block.querySelector('.img-block');
              
                  timeElement.textContent = currentData.time;
                  forecastElement.textContent = currentData.forecast;
                  tempElement.textContent = `${currentData.temp}°C`;
                  realFeelElement.textContent = `${currentData.realFeel}°C`;
                  windElement.textContent = `${currentData.wind} m/s`;
              
                  // Встановлюємо шлях до зображення погоди для кожного блоку
                  imgBlock.src = currentData.imagePath;
              });
              
              

           } else {
               console.error('Error fetching weather data: No weather information available');
           }
       })
       .catch(error => {
           console.error('Error fetching weather data:', error);
       });
}
// download file city.list.json
function loadCityList() {
   fetch('../scripts/city.list.json') // Завантаження JSON-файлу
    .then(response => response.json()) // Парсинг вмісту JSON
    .then(data => {
        // Перебираємо кожен об'єкт міста і створюємо новий об'єкт з іменем та id
        cities = data.map(city => ({ id: city.id, name: city.name })); 
        console.log(cities); // Перевірка, чи додається масив міст правильно
    })
    .catch(error => {
        console.error('Помилка завантаження файлу city.list.json:', error); // Обробка помилок завантаження файлу
    });
}
//search city by name
function findCityByName(cityName) {
   return cities.find(city => city.name === cityName); // Пошук міста за іменем у масиві cities
}
//func for error
function showError(error) {
   switch(error.code) {
       case error.PERMISSION_DENIED:
           console.log("User denied the request for Geolocation.");
           break;
       case error.POSITION_UNAVAILABLE:
           console.log("Location information is unavailable.");
           break;
       case error.TIMEOUT:
           console.log("The request to get user location timed out.");
           break;
       case error.UNKNOWN_ERROR:
           console.log("An unknown error occurred.");
           break;
   }
   openTabNonLocation();
}
//tab location
function openTabLocation() {
   contentToday.classList.add('content--active');
   content5Days.classList.remove('content--active');
   contentNonLocation.classList.remove('content--active');
}
//clicks
tabToday.addEventListener('click', function() {
   if (locationName !== undefined) {
       openTabLocation();
   } else {
       openTabNonLocation();
   }
});

tab5day.addEventListener('click', function() {
   if (locationName !== undefined) {
       content5Days.classList.add('content--active');
       contentToday.classList.remove('content--active');
       contentNonLocation.classList.remove('content--active');
   } else {
       openTabNonLocation();
   }
});

btn_search.addEventListener('click', async function(){
   locationName = form_control.value;
   if (findCityByName(locationName)) {
       // Місто в списку
       checkLocation(locationName);

       // Викликаємо функцію getNearestCities з новоотриманими координатами
       try {
           const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=${apiKey}`);
           const data = await response.json();
           const latitude = data.coord.lat;
           const longitude = data.coord.lon;
           await getNearestCities(latitude, longitude);
       } catch (error) {
           console.error('Error:', error);
       }
   } else {
       alert("Incorrect name location, please input again");
   }
});
// tab non location
function openTabNonLocation() {
   contentNonLocation.classList.add('content--active');
   content5Days.classList.remove('content--active');
   contentToday.classList.remove('content--active');
}
//5 day forecast



//save search history
