//app.js
const API_KEY = "fe2e0987d3ede21679cdbf748d879be5";
const weatherInfo = document.getElementById("weather-info");
const cityInput = document.getElementById("city-input");
const searchForm = document.getElementById("search-form");
const forecastTable = document
    .getElementById("forecast-table")
    .querySelector("tbody");
const unitRadios = document.querySelectorAll('input[name="units"]');

// Fetch weather data based on user's location
function fetchWeatherByLocation(units) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
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
            displayForecastData(data);
        })
        .catch((error) => {
            console.log("Error:", error);
            alert("Failed to fetch forecast data. Please try again.");
        });
}

// Display forecast data in table
function displayForecastData(data) {
    const forecastList = data.list;
    const dailyForecasts = getDailyForecasts(forecastList);

    forecastTable.innerHTML = "";

    dailyForecasts.forEach((forecast) => {
        const row = document.createElement("tr");
        const dateCell = document.createElement("td");
        const tempCell = document.createElement("td");
        const descCell = document.createElement("td");

        const date = new Date(forecast.dt * 1000);
        const temperatureMin = forecast.main.temp_min.toFixed(1);
        const temperatureMax = forecast.main.temp_max.toFixed(1);
        const description = forecast.weather[0].description;

        dateCell.textContent = formatDate(date);
        tempCell.textContent = `${temperatureMin} - ${temperatureMax} °${getUnitSymbol()}`;
        descCell.textContent = description;

        row.appendChild(dateCell);
        row.appendChild(tempCell);
        row.appendChild(descCell);

        forecastTable.appendChild(row);
    });
}

// Get daily forecasts from forecast list for the next 7 days
function getDailyForecasts(forecastList) {
    const dailyForecasts = [];
    let currentDate = "";

    forecastList.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const dateString = formatDate(date);

        if (dateString !== currentDate) {
            currentDate = dateString;
            dailyForecasts.push(forecast);

            if (dailyForecasts.length === 7) {
                return dailyForecasts;
            }
        }
    });

    return dailyForecasts;
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
        fetchWeatherData(city, units);
    });
});

// Fetch weather data for user's location on page load
document.addEventListener("DOMContentLoaded", () => {
    const units = getSelectedUnit();
    fetchWeatherByLocation(units);
});
// Autocomplete functionality
$(function() {
    $.getJSON("city.list.json", function(cityList) {
        $("#city-input")
            .autocomplete({
                source: function(request, response) {
                    if (request.term.length < 3) {
                        return;
                    }
                    const matcher = new RegExp(
                        $.ui.autocomplete.escapeRegex(request.term),
                        "i"
                    );
                    response(
                        $.grep(cityList, function(city) {
                            return matcher.test(city.name);
                        })
                    );
                },
                select: function(event, ui) {
                    $("#city-input").val(ui.item.name);
                    fetchWeatherData(ui.item.name, getSelectedUnit());
                    return false;
                },
            })
            .autocomplete("instance")._renderItem = function(ul, item) {
                return $("<li>")
                    .append("<div>" + item.name + ", " + item.country + "</div>")
                    .appendTo(ul);
            };
    });
});

// Helper function to get the selected unit
function getSelectedUnit() {
    const selectedUnit = document.querySelector('input[name="units"]:checked');
    return selectedUnit ? selectedUnit.value : "metric";
}