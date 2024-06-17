// app.js

const API_KEY = "fe2e0987d3ede21679cdbf748d879be5";
const weatherInfo = document.getElementById("weather-info");
const cityInput = document.getElementById("city-input");
const searchForm = document.getElementById("search-form");
const dailyForecastTable = document
    .getElementById("daily-forecast-table")
    .querySelector("tbody");
const hourlyForecastTable = document
    .getElementById("hourly-forecast-table")
    .querySelector("tbody");
const unitRadios = document.querySelectorAll('input[name="units"]');

// Fetch weather data from API
function fetchWeatherData(city, units) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}`;
    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            displayWeatherData(data);
            fetchForecastData(data.coord.lat, data.coord.lon, units);
        })
        .catch((error) => {
            console.log("Error:", error);
            alert("Failed to fetch weather data. Please try again.");
        });
}

// Fetch weather data based on user's location
function fetchWeatherByLocation(units) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherDataByCoords(lat, lon, units);
            },
            (error) => {
                console.log("Error:", error);
                alert("Failed to retrieve location. Please allow location access.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Fetch weather data by coordinates
function fetchWeatherDataByCoords(lat, lon, units) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            displayWeatherData(data);
            fetchForecastData(lat, lon, units);
        })
        .catch((error) => {
            console.log("Error:", error);
            alert("Failed to fetch weather data. Please try again.");
        });
}

// Display current weather data
function displayWeatherData(data) {
    const cityName = data.name;
    const temperature = data.main.temp;
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

    document.getElementById("city").textContent = cityName;
    document.getElementById("temp").textContent = temperature.toFixed(1);
    document.getElementById("description").textContent = description;
    document.getElementById("icon").setAttribute("src", iconUrl);
}

// Fetch forecast data from API
function fetchForecastData(lat, lon, units) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            displayDailyForecastData(data.list);
            displayHourlyForecastData(data.list);
        })
        .catch((error) => {
            console.log("Error:", error);
            alert("Failed to fetch forecast data. Please try again.");
        });
}

// Display daily forecast data
function displayDailyForecastData(forecastList) {
    const dailyForecast = getDailyForecast(forecastList);

    dailyForecastTable.innerHTML = "";

    dailyForecast.forEach((forecast) => {
        const row = document.createElement("tr");
        const dateCell = document.createElement("td");
        const tempCell = document.createElement("td");
        const descCell = document.createElement("td");

        const date = new Date(forecast.dt * 1000);
        const temperature = forecast.main.temp.toFixed(1);
        const description = forecast.weather[0].description;

        dateCell.textContent = formatDate(date);
        tempCell.textContent = `${temperature} °${getUnitSymbol()}`;
        descCell.textContent = description;

        row.appendChild(dateCell);
        row.appendChild(tempCell);
        row.appendChild(descCell);

        dailyForecastTable.appendChild(row);
    });
}

// Display hourly forecast data
function displayHourlyForecastData(forecastList) {
    const hourlyForecast = getHourlyForecast(forecastList);

    hourlyForecastTable.innerHTML = "";

    hourlyForecast.forEach((forecast) => {
        const row = document.createElement("tr");
        const timeCell = document.createElement("td");
        const tempCell = document.createElement("td");
        const descCell = document.createElement("td");

        const time = new Date(forecast.dt * 1000);
        const temperature = forecast.main.temp.toFixed(1);
        const description = forecast.weather[0].description;

        timeCell.textContent = formatTime(time);
        tempCell.textContent = `${temperature} °${getUnitSymbol()}`;
        descCell.textContent = description;

        row.appendChild(timeCell);
        row.appendChild(tempCell);
        row.appendChild(descCell);

        hourlyForecastTable.appendChild(row);
    });
}

// Get daily forecast data
function getDailyForecast(forecastList) {
    const dailyForecast = [];
    let currentDate = "";

    forecastList.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const dateString = formatDate(date);

        if (dateString !== currentDate) {
            currentDate = dateString;
            dailyForecast.push(forecast);
        }
    });

    return dailyForecast;
}

// Get hourly forecast data
function getHourlyForecast(forecastList) {
    const hourlyForecast = [];
    let currentHour = "";

    forecastList.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const hour = date.getHours();

        if (hour !== currentHour) {
            currentHour = hour;
            hourlyForecast.push(forecast);
        }
    });

    return hourlyForecast;
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Format time as HH:mm
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

// Get temperature unit symbol
function getUnitSymbol() {
    const unit = document.querySelector('input[name="units"]:checked').value;
    return unit === "metric" ? "C" : "F";
}

// Event listener for search form submission
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    const units = document.querySelector('input[name="units"]:checked').value;
    if (city !== "") {
        fetchWeatherData(city, units);
        cityInput.value = "";
    }
});

// Event listener for unit change
unitRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
        const city = document.getElementById("city").textContent;
        const units = radio.value;
        if (city) {
            fetchWeatherData(city, units);
        } else {
            fetchWeatherByLocation(units);
        }
    });
});

// Fetch weather data for user's location on page load
document.addEventListener("DOMContentLoaded", () => {
    const units = document.querySelector('input[name="units"]:checked').value;
    fetchWeatherByLocation(units);
});