// Отримання посилань на елементи
const tabToday = document.querySelector('.tab-today');
const contentToday = document.querySelector('.content--today');
const tab5day = document.querySelector('.tab-5-day');
const content5Days = document.querySelector('.content--five-days');
const contentNonLocation = document.querySelector('.content--non-location');
let userLocation;

// Виклик функції отримання локації
getLocation();

// Отримання локації користувача
function getLocation() {
   if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(showPosition, showError);
   } else {
       openTabNonLocation();
   }
}

// Показ локації
function showPosition(position) {
   userLocation = {
       latitude: position.coords.latitude,
       longitude: position.coords.longitude
   };
   
   // Виведення локації для перевірки
   console.log("Location:", userLocation);
   // Перевірка наявності локації для відображення вмісту
   if (userLocation !== undefined) {
       openTabLocation();

   } else {
       openTabNonLocation();
   }
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
   if (userLocation !== undefined) {
       openTabLocation();
   } else {
       openTabNonLocation();
   }
});

tab5day.addEventListener('click', function() {
   if (userLocation !== undefined) {
       content5Days.classList.add('content--active');
       contentToday.classList.remove('content--active');
       contentNonLocation.classList.remove('content--active');
   } else {
       openTabNonLocation();
   }
});

// Відкриття вкладки без локації
function openTabNonLocation() {
   contentNonLocation.classList.add('content--active');
   content5Days.classList.remove('content--active');
   contentToday.classList.remove('content--active');
}
