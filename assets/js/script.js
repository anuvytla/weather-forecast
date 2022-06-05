var weatherTodayEl = $('#todays-report');
var fiveDayForecastEl = $('#5day-forecast');
var forecastRowEl = fiveDayForecastEl.find('.row');
var searchButtonEl =$('#searchBtn');
var inputSearchEl = $('#searchBar');
var unOrderedListEl = $('.list-group');
const apiKey = 'a828aef6c0d6398ff3644dc49d97700f';
var locationResultLimit = 5;

function displayTodayWeather(current_weather) {
    console.log(current_weather);
    var col = $('<div>').addClass('col-12');
    var card = $('<div>').addClass('card');
    var cardBody = $('<div>').addClass('card-body');
    var dateTitle = $('<h6>').addClass('card-title');
    var unOrderedList = $('<ul>').addClass('list-group');
    var iconListItem = $('<li>').addClass('list-group-item');
    var imgLi = $('<img>');
    var tempLitsItem = $('<li>').addClass('list-group-item');
    var windListItem = $('<li>').addClass('list-group-item');
    var humidityListItem = $('<li>').addClass('list-group-item');

    dateTitle.text(unixTimeToString(current_weather.dt));
    dateTitle.appendTo(weatherTodayEl);

    var weatherIcon = current_weather.weather[0].icon;
    var iconURL = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
    imgLi.attr('src', iconURL);
    imgLi.appendTo(iconListItem);
    iconListItem.appendTo(unOrderedList);

    tempLitsItem.text('Temp: '+ Math.round(current_weather.temp)+' °F');
    tempLitsItem.appendTo(unOrderedList);

    windListItem.text('Wind: '+Math.round(current_weather.wind_speed) +' mph');
    windListItem.appendTo(unOrderedList);

    humidityListItem.text('Humidity: '+current_weather.humidity);
    humidityListItem.appendTo(unOrderedList);

    unOrderedList.appendTo(col);
    cardBody.appendTo(card);
    col.appendTo(weatherTodayEl);
}

function displayFiveDayForecast(forecast_weather) {
    for (i=0; i<5; i++) {
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
        
        dateTitle.text(unixTimeToString(forecast_weather[i].dt));
        dateTitle.appendTo(cardBody);
         
        var weatherIcon = forecast_weather[i].weather[0].icon;
        var iconURL = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
        imgLi.attr('src', iconURL);
        imgLi.appendTo(iconListItem);
        iconListItem.appendTo(unOrderedList);

        tempLitsItem.text('Max: '+ Math.round(forecast_weather[i].temp.max)+' °F');
        tempLitsItem.appendTo(unOrderedList);

        windListItem.text('Wind: '+Math.round(forecast_weather[i].wind_speed)+' mph');
        windListItem.appendTo(unOrderedList);

        humidityListItem.text('Humidity: '+forecast_weather[i].humidity);
        humidityListItem.appendTo(unOrderedList);

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
    var locationURL = `http://api.openweathermap.org/geo/1.0/direct?q=${location_name}&limit=${locationResultLimit}&appid=${apiKey}`;
    fetch(locationURL)
        .then(function(response){
            if (response.status===200){
                response.json().then(function(results) {
                    if(results.length > 0) {
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
                    displayTodayWeather(results.current);
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

getLatLong('canada');

function saveCityToHistory(city) {
    var cities = JSON.parse(localStorage.getItem('cities'));
    console.log(cities);

    if(cities === null) {
        cities= Array();
    }
    cities.push(city);
    localStorage.setItem('cities',JSON.stringify(cities));
}


