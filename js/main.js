// Отримання посилань на елементи
const tabToday = document.querySelector('.tab-today');
const contentToday = document.querySelector('.content--today');
const tab5day = document.querySelector('.tab-5-day');
const content5Days = document.querySelector('.content--five-days');
const contentNonLocation = document.querySelector('.content--non-location');
const form_control = document.querySelector('.form-control');
const btn_search = document.querySelector('.btn-outline-secondary');
let cities = []; // Пустий масив для зберігання міст
//tab today
weatherData = [];
const itemBlocks = document.querySelectorAll('.row-items .item:not(:first-child)');

// API ключ OpenWeatherMap
const apiKey = "ecb45209976ad5f0e9e39ee2e77cf00b";
let locationName;
let locationData;


// Завантаження списку міст після завантаження сторінки
form_control.value = "";
loadCityList();
getLocation();

function setWeatherImage(forecast, selector) {
   const imgBlock = document.querySelector(selector);
   let imagePath = '';

   // Обробляємо різні випадки опису погоди
   switch (forecast) {
       case 'Clear':
       case 'clear sky':
           imagePath = 'img/sun.png';
           break;
       case 'Clouds':
       case 'scattered clouds':
       case 'broken clouds':
       case 'overcast clouds':
           imagePath = 'img/clouds.png';
           break;
       case 'Rain':
           imagePath = 'img/rain.png';
           break;
       case 'Snow':
           imagePath = 'img/snow.png';
           break;
       // Додайте інші випадки, якщо потрібно
       default:
           imagePath = 'img/default.png';
           break;
   }

   // Присвоюємо шлях до картинки зображенню
   imgBlock.src = imagePath;
}

function getLocation() {
   if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(showPosition, showError);
   } else {
       openTabNonLocation();
   }
}

function getLocationName(latitude, longitude) {
   const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

   fetch(url)
       .then(response => response.json())
       .then(data => {
            locationName = data.name;
            checkLocation(locationName); // Перевірка наявності міста в списку
       })
       .catch(error => {
           console.error("Error fetching location:", error);
           alert("Please input your city");
       });
}

function showPosition(position) {
   getLocationName(position.coords.latitude, position.coords.longitude);
}

function checkLocation(locationName) {
   const city = findCityByName(locationName);
   if (city !== null) {
       locationData = { name: locationName, id: city.id };
       openTabLocation();
       console.log("City Name:", locationName);
       form_control.value = locationName;
       uploadWeatherDataHourly(locationName);
       uploadWeatherDataCurrent(locationName);

   } else {
       alert("Incorrect name location, please input again");
   }
}

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
               const temp = (data.main.temp - 273.15).toFixed(1);
               const realFeel = (data.main.feels_like - 273.15).toFixed(1);
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
                   const temp = (hourlyForecast.main.temp - 273.15).toFixed(1);
                   const realFeel = (hourlyForecast.main.feels_like - 273.15).toFixed(1);
                   const wind = hourlyForecast.wind.speed;

                   // Додаємо дані до масиву weatherData
                   weatherData.push({ time, forecast, temp, realFeel, wind });
               });

               // Відображаємо дані на екрані
               itemBlocks.forEach((block, index) => {
                   const currentData = weatherData[index];
                   const timeElement = block.querySelector('.time');
                   const forecastElement = block.querySelector('.forecast');
                   const tempElement = block.querySelector('.temp');
                   const realFeelElement = block.querySelector('.realFeel');
                   const windElement = block.querySelector('.wind');

                   timeElement.textContent = currentData.time;
                   forecastElement.textContent = currentData.forecast;
                   tempElement.textContent = `${currentData.temp}°C`;
                   realFeelElement.textContent = `${currentData.realFeel}°C`;
                   windElement.textContent = `${currentData.wind} m/s`;
               });
           } else {
               console.error('Error fetching weather data: No weather information available');
           }
       })
       .catch(error => {
           console.error('Error fetching weather data:', error);
       });
}



// Завантаження файлу city.list.json та обробка його даних
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


function findCityByName(cityName) {
   return cities.find(city => city.name === cityName); // Пошук міста за іменем у масиві cities
}

// Обробка помилок отримання локації
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

// Відкриття вкладки з локацією
function openTabLocation() {
   contentToday.classList.add('content--active');
   content5Days.classList.remove('content--active');
   contentNonLocation.classList.remove('content--active');
}

// Обробка кліків на вкладки
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

btn_search.addEventListener('click', function(){
   locationName = form_control.value;
   if (findCityByName(locationName)) {
       // Місто в списку
       checkLocation(locationName);
   } else {
       alert("Incorrect name location, please input again");
   }
});

// Відкриття вкладки без локації
function openTabNonLocation() {
   contentNonLocation.classList.add('content--active');
   content5Days.classList.remove('content--active');
   contentToday.classList.remove('content--active');
}
