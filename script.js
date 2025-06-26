// API Keys
const WEATHER_API_KEY = '8ea0e63b9fabf18cdc828fb55cb49fe8';
const OPENCAGE_API_KEY = 'c4e8f3e2f8434f8687886b5ef023f59e';

// State variables
let map, currentMarker, currentCoords;

// Initialize map and events
function initMap(lat, lon) {
  map = L.map('map').setView([lat, lon], 10);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  addMarker(lat, lon);

  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    currentCoords = [lat, lng];
    addMarker(lat, lng);
    fetchHumanLocation(lat, lng);
    fetchWeather(lat, lng);
    fetchForecast(lat, lng);
  });
}

// Add or update the marker on the map
function addMarker(lat, lon) {
  if (currentMarker) map.removeLayer(currentMarker);
  currentMarker = L.marker([lat, lon]).addTo(map).bindPopup("Selected location").openPopup();
}

// Fetch city/state/country based on coordinates
function fetchHumanLocation(lat, lon) {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const components = data.results[0].components;
      const city = components.city || components.town || components.village || "Unknown city";
      const state = components.state || "Unknown state";
      const country = components.country || "Unknown country";
      document.getElementById("location-box").innerText = `📌 ${city}, ${state}, ${country}`;
    });
}

// Get current weather data from OpenWeatherMap
function fetchWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const temp = data.main.temp;
      const desc = data.weather[0].description;
      const iconCode = data.weather[0].icon;
      const iconURL = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

      document.getElementById("weather-icon").innerHTML = `<img src='${iconURL}' alt='${desc}' />`;
      document.getElementById("weather-info").innerText = `${temp}°C — ${desc}`;
    });
}

// Fetch 5-day forecast (at noon) from OpenWeatherMap
function fetchForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const forecastEl = document.getElementById("forecast-slider");
      forecastEl.innerHTML = '';
      let daily = {};

      data.list.forEach(item => {
        if (item.dt_txt.includes("12:00:00")) {
          const date = new Date(item.dt_txt);
          const day = date.toLocaleDateString('en-US', { weekday: 'short' });
          const icon = item.weather[0].icon;
          const temp = Math.round(item.main.temp);

          daily[day] = `
            <div class="forecast-card">
              <div>${day}</div>
              <img src="https://openweathermap.org/img/wn/${icon}.png" />
              <div>${temp}°C</div>
            </div>
          `;
        }
      });

      Object.values(daily).forEach(card => forecastEl.innerHTML += card);
    });
}

// Get user’s current location or fallback
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        currentCoords = [latitude, longitude];
        initMap(latitude, longitude);
        fetchHumanLocation(latitude, longitude);
        fetchWeather(latitude, longitude);
        fetchForecast(latitude, longitude);
        localStorage.setItem('lastLat', latitude);
        localStorage.setItem('lastLon', longitude);
      },
      () => useSavedOrDefaultLocation()
    );
  } else {
    useSavedOrDefaultLocation();
  }
}

// Use previous location or fallback to a default
function useSavedOrDefaultLocation() {
  const lat = localStorage.getItem('lastLat') || 17.385;
  const lon = localStorage.getItem('lastLon') || 78.4867;
  currentCoords = [lat, lon];
  initMap(lat, lon);
  fetchHumanLocation(lat, lon);
  fetchWeather(lat, lon);
  fetchForecast(lat, lon);
}

// Handle user search and update map + data
function handleSearch() {
  const query = document.getElementById("search-box").value;
  if (!query) return alert("Please type a location.");

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${OPENCAGE_API_KEY}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const loc = data.results[0].geometry;
      currentCoords = [loc.lat, loc.lng];
      map.setView([loc.lat, loc.lng], 10);
      addMarker(loc.lat, loc.lng);
      fetchHumanLocation(loc.lat, loc.lng);
      fetchWeather(loc.lat, loc.lng);
      fetchForecast(loc.lat, loc.lng);
    });
}

// Return map and weather to current coordinates
function resetToCurrentLocation() {
  if (currentCoords) {
    const [lat, lon] = currentCoords;
    map.setView([lat, lon], 10);
    fetchWeather(lat, lon);
    fetchForecast(lat, lon);
    fetchHumanLocation(lat, lon);
  }
}

// Load everything on start
getLocation();
