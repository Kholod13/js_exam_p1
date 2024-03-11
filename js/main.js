// Отримання посилань на елементи
const tabToday = document.querySelector('.tab-today');
const contentToday = document.querySelector('.content--today');
const tab5day = document.querySelector('.tab-5-day');
const content5Days = document.querySelector('.content--five-days');
const contentNonLocation = document.querySelector('.content--non-location');
const form_control = document.querySelector('.form-control');
const btn_search = document.querySelector('.btn-outline-secondary');
let cities = []; // Пустий масив для зберігання міст

// API ключ OpenWeatherMap
const apiKey = "ecb45209976ad5f0e9e39ee2e77cf00b";
let locationName;
let locationData;


// Завантаження списку міст після завантаження сторінки
form_control.value = "";
loadCityList();
getLocation();


function uploadWetherData(locationName){
   const url = `https://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=${apiKey}`;

    // Виконання запиту за допомогою fetch
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Отримання погодних даних
            console.log('Weather Data:', data);
            // Тут ви можете обробити отримані дані, наприклад, вивести температуру
            const temperature = data.main.temp;
            console.log('Temperature:', temperature);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

// Отримання локації користувача
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

function checkLocation(locationName) {
   const city = findCityByName(locationName); // Знаходимо об'єкт міста за іменем
   if (city !== null) {
       // Місто в списку
       locationData = { name: locationName, id: city.id }; // Записуємо ім'я та id міста у глобальну змінну locationData
       openTabLocation();
       console.log("City Name:", locationName);
       form_control.value = locationName;
       uploadWetherData(locationName); // Передача назви міста у функцію uploadWetherData()
   } else {
       alert("Incorrect name location, please input again");
   }
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
