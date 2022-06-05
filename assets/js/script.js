// Container element for todays weather section.
var weatherTodayEl = $('#todays-report');
// Container element for forecast section
var forecastRowEl = $('#5day-forecast');
// Search Button from Nav bar.
var searchButtonEl =$('#searchBtn');
// City Input element.
var inputSearchEl = $('#searchBar');
// Container element for city history.
var cityBtnEl = $('#city-display');
// API ket for openweathermap.
const apiKey = 'a828aef6c0d6398ff3644dc49d97700f';
// Limit on results from city search API.
var locationResultLimit = 5;
// Parse city history saved in local storage in to a variable. Create empty array if it is null.
var cityHistory = JSON.parse(localStorage.getItem('city-history') || '[]');
// name of the city that is being displayed on the page.
var current_location_name;

// Display current and today's weather condition by creating necessary HTML.
function displayTodayWeather(current_weather, today_weather) {
    // Create 2 rows. One for header and one for title.
    // Header row to display the data and location.
    var headerRow = $('<div>').addClass('row justify-content-center');
    headerRow.appendTo(weatherTodayEl);
    // Content row to display the weather data.
    // This is divided in to 3 columns.
    // column 1: temprature and current conditions.
    // column 2: other weather data like wind/UVI etc
    // column 3: icon for current conditions.
    var contentRow = $('<div>').addClass('row justify-content-center');
    contentRow.appendTo(weatherTodayEl);


    // Create the heading for title and add it to the header row.
    var dateTitle = $('<h4>').addClass('col-10 card-title text-center');
    dateTitle.text(unixTimeToString(current_weather.dt) + ' in ' + current_location_name.toUpperCase());
    dateTitle.appendTo(headerRow);

    // Create a column for temperate section and add it to content row.
    var tempCol = $('<div>').addClass('col-lg-3 col-sm-5');
    tempCol.appendTo(contentRow);
    // h2 to display current temperate.
    var tempTitle = $('<h2>').addClass('card-title');
    tempTitle.text(Math.round(current_weather.temp)+' °F');
    tempTitle.appendTo(tempCol);
    // p for displaying current conditions.
    var conditionTitle = $('<p>');
    conditionTitle.text(current_weather.weather[0].description);
    conditionTitle.appendTo(tempCol);
    // p for displaying max and min temps for the day.
    maxMinTitle = $('<p>');
    maxMinTitle.text('Max: ' + Math.round(today_weather.temp.max) + ' Min: ' + Math.round(today_weather.temp.min));
    maxMinTitle.appendTo(tempCol);

    // Column for displaying other weather data and add it to content row.
    var summaryCol = $('<div>').addClass('col-lg-2 col-sm-5');
    summaryCol.appendTo(contentRow);
    // p for displaying wind info.
    var windTitle = $('<p>');
    windTitle.text('Wind: '+Math.round(current_weather.wind_speed) +' mph');
    windTitle.appendTo(summaryCol);
    // p for displaying humidity.
    var humidityTitle = $('<p>');
    humidityTitle.text('Humidity: '+current_weather.humidity);
    humidityTitle.appendTo(summaryCol);
    // p for displaying UV Index.
    var uvIndexTitle = $('<p>');
    uvIndexTitle.text('UV Index : '+Math.round(current_weather.uvi));
    uvIndexTitle.appendTo(summaryCol);
    // Construct URL for weather icon.
    var weatherIcon = current_weather.weather[0].icon;
    var iconURL = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
    // Create a column for icon and add it to content row.
    var iconCol = $('<div>').addClass('col-2');
    iconCol.appendTo(contentRow);
    // img for displaying the current weather icon.
    var iconImg = $('<img>');
    iconImg.attr('src', iconURL);
    iconImg.appendTo(iconCol);
}

// Display 5-day forecast by creating necessary HTML.
function displayFiveDayForecast(forecast_weather) {
    for (i=1; i<6; i++) {
        // Create a column for each day.
        var col = $('<div>').addClass('col-lg-2 col-md-4 col-sm-6 col-12');
        col.appendTo(forecastRowEl);
        // Create a card container.
        var card = $('<div>').addClass('card');
        card.appendTo(col);
        // Create a div for the card body.
        var cardBody = $('<div>').addClass('card-body');
        cardBody.appendTo(card);
        // Title for displaying the date.
        var dateTitle = $('<h6>').addClass('card-title');
        dateTitle.text(unixTimeToString(forecast_weather[i].dt));
        dateTitle.appendTo(cardBody);

        // ul for listing all of the weather data
        var unOrderedList = $('<ul>').addClass('list-group');
        unOrderedList.appendTo(cardBody);
        // Create an li for the weather icon.
        var iconListItem = $('<li>').addClass('list-group-item');
        iconListItem.appendTo(unOrderedList);
        var imgLi = $('<img>');
        var weatherIcon = forecast_weather[i].weather[0].icon;
        var iconURL = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
        imgLi.attr('src', iconURL);
        imgLi.appendTo(iconListItem);
        // li for temperature.
        var tempLitsItem = $('<li>').addClass('list-group-item');
        tempLitsItem.text('Max: '+ Math.round(forecast_weather[i].temp.max)+' °F');
        tempLitsItem.appendTo(unOrderedList);
        // li for wind
        var windListItem = $('<li>').addClass('list-group-item');
        windListItem.text('Wind: '+Math.round(forecast_weather[i].wind_speed)+' mph');
        windListItem.appendTo(unOrderedList);
        // li for hukidity
        var humidityListItem = $('<li>').addClass('list-group-item');
        humidityListItem.text('Humidity: '+forecast_weather[i].humidity);
        humidityListItem.appendTo(unOrderedList);
        // li for UV Index.
        var uvIndexItem = $('<li>').addClass('list-group-item');
        uvIndexItem.text('UV Index: '+Math.round(forecast_weather[i].uvi));
        uvIndexItem.appendTo(unOrderedList);
    }
}

// Display an 'location not found' error.
function displayLocationError(){
    var errorEl = $('<p>').text('Can not find that location');
    errorEl.appendTo(weatherTodayEl);
}

// Fetch the coordinates for the location_name.
// If succeeded, fetch the weather data.
// If failed, display error message.
function getLatLong(location_name) {
    // Construct the URL to fetch lat,long.
    var locationURL = `https://api.openweathermap.org/geo/1.0/direct?q=${location_name}&limit=${locationResultLimit}&appid=${apiKey}`;
    fetch(locationURL)
        .then(function(response){
            // Check if the request was success.
            if (response.status===200){
                // Convert response to json.
                response.json().then(function(results) {
                    // Check if the location is found.
                    if(results.length > 0) {
                        // Location is found. save the city to history and fetch weather.
                        current_location_name = location_name;
                        saveCityToHistory(location_name);
                        getWeatherData(results[0].lat, results[0].lon);
                    } else {
                        // Location not found. Display an error.
                        displayLocationError();
                    }
                });
            }
        });
}

// Fetch weather data for the given coordinates.
function getWeatherData(lat, long) {
    // Construct URL for onecall API.
    var locationURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&appid=${apiKey}&units=imperial`;
    fetch(locationURL)
        .then(function(response){
            // Check if the request was success.
            if (response.status===200){
                // Parse the response in to json.
                response.json().then(function(results) {
                    // Display current and Today's weather section.
                    displayTodayWeather(results.current, results.daily[0]);
                    // Display 5-day weather forecast.
                    displayFiveDayForecast(results.daily);
                });
            }
        });
}

// Add on click listener to search.
searchButtonEl.on('click',onSearch);

// Helper function to conver unix time to 'dddd, MMM Do' format (Saturday, June 4th).
function unixTimeToString(unix_time){
    return moment.unix(unix_time).format('dddd, MMM Do');
}

// Event handler for search button click.
function onSearch(event) {
    // Prevent the page from reloading.
    event.preventDefault();
    // Clear exisitng HTML before searching for new city.
    clearEntries();
    // Get the input city name.
    var searchInput = inputSearchEl.val().trim();
    // search for city and display weather.
    getLatLong(searchInput);
}

// Clears the HTML content from current and forecast weather sections.
function clearEntries() {
    // Clear the forecast section.
    forecastRowEl.empty();
    // Clear the today's weather section.
    weatherTodayEl.empty();
}

// Saves the given city to history.
// If the city already exists, removes the duplicate entries and put the recent city at the end.
function saveCityToHistory(city) {
    // Removes existing entries of the city.
    cityHistory = cityHistory.filter(function(value){ 
        return value !== city;
    });
    // Push the city at the end.
    cityHistory.push(city);
    // Save the updates history array in local storage.
    localStorage.setItem('city-history', JSON.stringify(cityHistory));
    // Update the history section with new entries.
    displayCities();
}

// Displays the history by creating necessary HTML and appending it to history section.
function displayCities() {
    // First clear the previous entries in the section.
    cityBtnEl.empty();
    // Display the last 10 searches in reverse order.
    for(i = cityHistory.length - 1; i >= Math.max(0, cityHistory.length - 10); i--) {
        // Create a button for each city.
        var cityBtn = $('<button>').addClass('btn-outline-success').addClass('btn').addClass('m-2');
        cityBtn.text(cityHistory[i]);
        // Add click event.
        cityBtn.on('click', onHistorySelect);
        // Add the button to the container.
        cityBtn.appendTo(cityBtnEl);
    }
}

// Event handler for selecting the city button from history. 
function onHistorySelect(event) {
    // Clear the exisitng weather data.
    clearEntries();
    // Get the input and fetch the weather data.
    var searchInput = $(event.target).text();
    getLatLong(searchInput);
}

// Display the history on page load.
displayCities();