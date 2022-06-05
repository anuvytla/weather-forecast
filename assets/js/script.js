var weatherTodayEl = $('#todays-report');
var fiveDayForecastEl = $('#5day-forecast');
var forecastRowEl = fiveDayForecastEl.find('.row');
var searchButtonEl =$('#searchBtn');
var inputSearchEl = $('#searchBar');
var unOrderedListEl = $('.list-group');
var cityBtnEl = $('#city-display');
const apiKey = 'a828aef6c0d6398ff3644dc49d97700f';
var locationResultLimit = 5;
var cityHistory = JSON.parse(localStorage.getItem('city-history') || '[]');
var current_location_name;

function displayTodayWeather(current_weather, today_weather) {
    console.log(current_weather);
    console.log(today_weather);
    var headerRow = $('<div>').addClass('row justify-content-center');
    headerRow.appendTo(weatherTodayEl);

    var dateTitle = $('<h4>').addClass('col-10 card-title text-center');
    dateTitle.text(unixTimeToString(current_weather.dt) + ' in ' + current_location_name.toUpperCase());
    dateTitle.appendTo(headerRow);

    var contentRow = $('<div>').addClass('row justify-content-center');
    contentRow.appendTo(weatherTodayEl);
    var tempCol = $('<div>').addClass('col-lg-3 col-sm-5');
    tempCol.appendTo(contentRow);
    var tempTitle = $('<h2>').addClass('card-title');
    tempTitle.text(Math.round(current_weather.temp)+' °F');
    tempTitle.appendTo(tempCol);
    var conditionTitle = $('<p>');
    conditionTitle.text(current_weather.weather[0].description);
    conditionTitle.appendTo(tempCol);
    maxMinTitle = $('<p>');
    maxMinTitle.text('Max: ' + Math.round(today_weather.temp.max) + ' Min: ' + Math.round(today_weather.temp.min));
    maxMinTitle.appendTo(tempCol);

    var summaryCol = $('<div>').addClass('col-lg-2 col-sm-5');
    summaryCol.appendTo(contentRow);
    
    var windTitle = $('<p>');
    windTitle.text('Wind: '+Math.round(current_weather.wind_speed) +' mph');
    windTitle.appendTo(summaryCol);

    var humidityTitle = $('<p>');
    humidityTitle.text('Humidity: '+current_weather.humidity);
    humidityTitle.appendTo(summaryCol);

    var uvIndexTitle = $('<p>');
    uvIndexTitle.text('UV Index : '+Math.round(current_weather.uvi));
    uvIndexTitle.appendTo(summaryCol);

    var weatherIcon = current_weather.weather[0].icon;
    var iconURL = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
    var iconCol = $('<div>').addClass('col-2');
    iconCol.appendTo(contentRow);
    var iconImg = $('<img>');
    iconImg.attr('src', iconURL);
    iconImg.appendTo(iconCol);
}

function displayFiveDayForecast(forecast_weather) {
    for (i=1; i<6; i++) {
        var col = $('<div>').addClass('col-lg-2 col-md-4 col-sm-6 col-12');
        var card = $('<div>').addClass('card');
        var cardBody = $('<div>').addClass('card-body');
        var dateTitle = $('<h6>').addClass('card-title');
        var unOrderedList = $('<ul>').addClass('list-group');
        var iconListItem = $('<li>').addClass('list-group-item');
        var imgLi = $('<img>');
        var tempLitsItem = $('<li>').addClass('list-group-item');
        var windListItem = $('<li>').addClass('list-group-item');
        var humidityListItem = $('<li>').addClass('list-group-item');
        var uvIndexItem = $('<li>').addClass('list-group-item');
        
        dateTitle.text(unixTimeToString(forecast_weather[i].dt));
        dateTitle.appendTo(cardBody);
         
        var weatherIcon = forecast_weather[i].weather[0].icon;
        var iconURL = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
        imgLi.attr('src', iconURL);
        imgLi.appendTo(iconListItem);
        iconListItem.appendTo(unOrderedList);

        tempLitsItem.text('Max: '+ Math.round(forecast_weather[i].temp.max)+' °F');
        tempLitsItem.appendTo(unOrderedList);

        windListItem.text('Wind: '+Math.round(forecast_weather[i].wind_speed)+' mph');
        windListItem.appendTo(unOrderedList);

        humidityListItem.text('Humidity: '+forecast_weather[i].humidity);
        humidityListItem.appendTo(unOrderedList);

        uvIndexItem.text('UV Index: '+Math.round(forecast_weather[i].uvi));
        uvIndexItem.appendTo(unOrderedList);

        unOrderedList.appendTo(cardBody);
        
        cardBody.appendTo(card);
        card.appendTo(col);
        col.appendTo(forecastRowEl);
    }
}

function displayLocationError(){
    var errorEl = $('<p>').text('Can not find that location');
    errorEl.appendTo(weatherTodayEl);
}

function getLatLong(location_name) {
    var locationURL = `https://api.openweathermap.org/geo/1.0/direct?q=${location_name}&limit=${locationResultLimit}&appid=${apiKey}`;
    fetch(locationURL)
        .then(function(response){
            if (response.status===200){
                response.json().then(function(results) {
                    if(results.length > 0) {
                        current_location_name = location_name;
                        saveCityToHistory(location_name);
                        getWeatherData(results[0].lat, results[0].lon);
                    } else {
                        displayLocationError();
                    }
                });
            }
        });
}

function getWeatherData(lat, long) {
    var locationURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&appid=${apiKey}&units=imperial`;
    fetch(locationURL)
        .then(function(response){
            if (response.status===200){
                response.json().then(function(results) {
                    displayTodayWeather(results.current, results.daily[0]);
                    displayFiveDayForecast(results.daily);
                });
            }
        });
}

searchButtonEl.on('click',onSearch);

function unixTimeToString(unix_time){
    return moment.unix(unix_time).format('dddd, MMM Do');
}

function onSearch(event) {
    event.preventDefault();
    clearEntries();
    var searchInput = inputSearchEl.val().trim();
    getLatLong(searchInput);
}

function clearEntries() {
    forecastRowEl.empty();
    weatherTodayEl.empty();
}



function saveCityToHistory(city) {
    cityHistory = cityHistory.filter(function(value){ 
        return value !== city;
    });
    cityHistory.push(city);
    localStorage.setItem('city-history', JSON.stringify(cityHistory));
    displayCities();
}

function displayCities() {
    cityBtnEl.empty();
    for(i = cityHistory.length - 1; i >= Math.max(0, cityHistory.length - 10); i--) {
        var cityBtn = $('<button>').addClass('btn-outline-success').addClass('btn').addClass('m-2');
        cityBtn.text(cityHistory[i]);
        cityBtn.on('click', onHistorySelect);
        cityBtn.appendTo(cityBtnEl);
    }
}

function onHistorySelect(event) {
    clearEntries();
    var searchInput = $(event.target).text();
    getLatLong(searchInput);
}

displayCities();