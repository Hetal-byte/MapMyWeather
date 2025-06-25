// personal api key to unlock OpenWeatherMap data
const API_KEY = '8ea0e63b9fabf18cdc828fb55cb49fe8';

// This function creates a map centered at the user's location
function initMap(lat, lon) {
  // Initialize the Leaflet map and center it on your coordinates
  const map = L.map('map').setView([lat, lon], 10);

  // load the base map tiles from OpenStreetMap
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Add a weather layer from OpenWeatherMap
  const weatherTiles = `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`;
  L.tileLayer(weatherTiles, {
    attribution: '&copy; OpenWeatherMap'
  }).addTo(map);

  // Place a marker on the user's exact location
  L.marker([lat, lon]).addTo(map)
    .bindPopup("You're here! 🌍")
    .openPopup();
}

// Asks the browser for the user's location
function getLocation() {
  if (navigator.geolocation) {
    // If permission is granted, fetch the coordinates
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        initMap(latitude, longitude); // Loads the map with user's coordinates
      },
      (error) => {
        // If there's an error (denied, failed), alert the user
        alert("Oops! We couldn’t find your location: " + error.message);
      }
    );
  } else {
    // Geolocation is not supported 
    alert("Geolocation is not supported by your browser.");
  }
}

// Kick off the app as soon as the page loads
getLocation();
