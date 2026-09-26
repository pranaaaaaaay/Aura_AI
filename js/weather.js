import { showToast } from "./utils.js";

/*
  Weather API setup:
  1. Create a free API key at https://openweathermap.org/api
  2. Put the key in WEATHER_API_KEY below for a local demo.
  3. For production, call your own backend so the key is not exposed.
*/
const WEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY";

export function renderWeather(container) {
  container.innerHTML = `
    <div class="view-card">
      <h3>Live Weather</h3>
      <p class="sub">Uses OpenWeatherMap. Enter a city or use browser geolocation.</p>
      <form id="weatherForm" class="chat-composer">
        <input id="cityInput" placeholder="Enter city — e.g. Pune" value="Pune" />
        <button class="send-btn" type="submit"><i class="icon icon-search"></i></button>
      </form>
      <div class="control-row" style="margin-top:10px">
        <button class="outline-btn" id="geoWeather"><i class="icon icon-navigation"></i> Use my location</button>
      </div>
    </div>

    <div id="weatherResult" style="margin-top:15px"></div>
  `;

  document.getElementById("weatherForm").addEventListener("submit", e => {
    e.preventDefault();
    fetchWeather(document.getElementById("cityInput").value.trim());
  });

  document.getElementById("geoWeather").onclick = () => {
    if (!navigator.geolocation) return showToast("Geolocation is not supported.");
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => showToast("Location permission was blocked.")
    );
  };

  fetchWeather("Pune");
}

async function fetchWeather(city) {
  if (!city) return;
  if (WEATHER_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
    renderDemoWeather(city);
    return;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found or API request failed.");
    const data = await response.json();
    renderWeatherData(data);
  } catch (error) {
    document.getElementById("weatherResult").innerHTML = `<div class="view-card result-box">${error.message}</div>`;
  }
}

async function fetchWeatherByCoords(lat, lon) {
  if (WEATHER_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
    renderDemoWeather("Your location");
    return;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Unable to get weather.");
    renderWeatherData(await response.json());
  } catch (error) {
    document.getElementById("weatherResult").innerHTML = `<div class="view-card result-box">${error.message}</div>`;
  }
}

function renderWeatherData(data) {
  const condition = data.weather?.[0]?.main || "Weather";
  document.getElementById("weatherResult").innerHTML = `
    <div class="weather-main">
      <div class="view-card weather-hero">
        <div>
          <div class="weather-meta">${data.name}, ${data.sys?.country || ""}</div>
          <div class="temp">${Math.round(data.main.temp)}°</div>
          <div class="weather-meta">${condition} • Feels like ${Math.round(data.main.feels_like)}°</div>
        </div>
        <i class="icon icon-cloud-sun weather-icon"></i>
      </div>
      <div class="stat-grid">
        <div class="stat"><small>Humidity</small><strong>${data.main.humidity}%</strong></div>
        <div class="stat"><small>Wind</small><strong>${data.wind.speed} m/s</strong></div>
        <div class="stat"><small>Pressure</small><strong>${data.main.pressure} hPa</strong></div>
        <div class="stat"><small>Visibility</small><strong>${(data.visibility / 1000).toFixed(1)} km</strong></div>
      </div>
    </div>
  `;
}

function renderDemoWeather(city) {
  document.getElementById("weatherResult").innerHTML = `
    <div class="weather-main">
      <div class="view-card weather-hero">
        <div>
          <div class="weather-meta">${city}</div>
          <div class="temp">27°</div>
          <div class="weather-meta">Demo weather • Add API key for live data</div>
        </div>
        <i class="icon icon-cloud-sun weather-icon"></i>
      </div>
      <div class="stat-grid">
        <div class="stat"><small>Humidity</small><strong>64%</strong></div>
        <div class="stat"><small>Wind</small><strong>3.2 m/s</strong></div>
        <div class="stat"><small>Pressure</small><strong>1012 hPa</strong></div>
        <div class="stat"><small>Status</small><strong>API OFF</strong></div>
      </div>
    </div>
    <div class="view-card" style="margin-top:15px">
      <strong>Connect live data:</strong> replace WEATHER_API_KEY in <code>js/weather.js</code>.
    </div>
  `;
}
