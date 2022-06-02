var weatherTodayEl = $('#todays-report');
var fiveDayForecastEl = $('5day-forecast');
var apiKey = 'a828aef6c0d6398ff3644dc49d97700f';
var locationResultLimit = 5;

function getLocations(query) {
    var locationURL = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=${locationResultLimit}&appid=${apiKey}`;
    fetch(locationURL)
        .then(function(response){
            if (response.status===200){
                response.json().then(function(results) {
                    getWeatherData(results[0].lat, results[0].lon);
                });
            }
        });
}

function getWeatherData(lat, long) {
    var locationURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&appid=${apiKey}`;
    fetch(locationURL)
        .then(function(response){
            if (response.status===200){
                response.json().then(function(results) {
                    console.log(results);
                });
            }
        }); 

}
getLocations('hyderabad');