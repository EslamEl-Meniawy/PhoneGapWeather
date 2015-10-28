var updateInterval;
var userLanguage, weatheStats;
var connected;
var weatherCities = [];
var pages;
var langURL, weatheStatURL;
var slideTemp = '<div class="swiper-slide" id="slide-{{i}}"><div class="backgound-image" id="backgound-{{i}}"></div><div class="day-details" id="day-details-{{i}}"><div class="day-details-city" id="day-details-city-{{i}}"></div><div class="day-details-current-temp-div"><span class="day-details-current-temp color" id="day-details-current-temp-{{i}}"></span><span class="day-details-current-temp-unit" id="day-details-current-temp-unit-{{i}}"></span></div><div class="day-details-weather-stat" id="day-details-weather-stat-{{i}}"></div><div class="day-details-temp-div"><span class="day-details-temp" id="day-details-temp-{{i}}"></span><span class="day-details-temp-unit" id="day-details-temp-unit-{{i}}"></span></div></div><div class="days-outer"><div class="days"><div class="day" id="day-{{i}}-0" onClick="loadWeatherData({{i}}, 0)"><div class="day-inner"><div class="week-day color" id="week-day-{{i}}-0"></div><div class="day-date" id="day-date-{{i}}-0"></div><div class="day-icon" id="day-icon-{{i}}-0"></div><div class="day-temp-div"><span class="day-temp" id="day-temp-{{i}}-0"></span><span class="day-temp-unit" id="day-temp-unit-{{i}}-0"></span></div></div></div><div class="day" id="day-{{i}}-1" onClick="loadWeatherData({{i}}, 1)"><div class="day-inner"><div class="week-day color" id="week-day-{{i}}-1"></div><div class="day-date" id="day-date-{{i}}-1"></div><div class="day-icon" id="day-icon-{{i}}-1"></div><div class="day-temp-div"><span class="day-temp" id="day-temp-{{i}}-1"></span><span class="day-temp-unit" id="day-temp-unit-{{i}}-1"></span></div></div></div><div class="day" id="day-{{i}}-2" onClick="loadWeatherData({{i}}, 2)"><div class="day-inner"><div class="week-day color" id="week-day-{{i}}-2"></div><div class="day-date" id="day-date-{{i}}-2"></div><div class="day-icon" id="day-icon-{{i}}-2"></div><div class="day-temp-div"><span class="day-temp" id="day-temp-{{i}}-2"></span><span class="day-temp-unit" id="day-temp-unit-{{i}}-2"></span></div></div></div><div class="day" id="day-{{i}}-3" onClick="loadWeatherData({{i}}, 3)"><div class="day-inner day-inner-last"><div class="week-day color" id="week-day-{{i}}-3"></div><div class="day-date" id="day-date-{{i}}-3"></div><div class="day-icon" id="day-icon-{{i}}-3"></div><div class="day-temp-div"><span class="day-temp" id="day-temp-{{i}}-3"></span><span class="day-temp-unit" id="day-temp-unit-{{i}}-3"></span></div></div></div></div></div></div>';
if (localStorage.getItem('weatherAppRunned') == null) {
	localStorage.setItem('lang', 'lang0');
	localStorage.setItem('tempUnit', 'F');
	localStorage.setItem('interval', 1);
	localStorage.setItem('theme', 4);
	weatherCities = [{"name": "London, GB", "id": 2643743, "weather": null}, {"name": "Paris, FR", "id": 2988507, "weather": null}, {"name": "New York, US", "id": 5128581, "weather": null}];
	localStorage.setItem('weatherCities', JSON.stringify(weatherCities));
	localStorage.setItem('lastRunTime', new Date());
	localStorage.setItem('weatherAppRunned', '1');
}
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
	document.addEventListener("backbutton", backButtonClicked, false);
	$('head').append('<link rel="stylesheet" type="text/css" href="css/colors/color-' + localStorage.getItem('theme') + '.css">');
	$('#settings-icon').click(function() {
		window.location = "settings.html";
	});
	$('#refresh').click(function() {
		getAllWeather(0);
	});
	loadLanguage();
	setInterv(parseInt(localStorage.getItem('interval')));
}
function backButtonClicked() {
	navigator.app.exitApp();
}
function loadLanguage() {
	if (localStorage.getItem('lang') == 'lang0') {
		langURL = 'lang/index/en.json';
		weatheStatURL = 'weather/weatherStats_en.json';
	} else if (localStorage.getItem('lang') == 'lang1') {
		$('#indicator').addClass('rtl');
		langURL = 'lang/index/ar.json';
		weatheStatURL = 'weather/weatherStats_ar.json';
	}
	$.ajax({
		type : 'GET',
		url : langURL,
		dataType : 'JSON'
	}).done(function(response) {
		userLanguage = response;
		loadMain();
	}).fail(function() {
		loadLanguage();
	});
}
function loadMain() {
	$('#main-page-wrapper').html('');
	$('#indicator').html('');
	weatherCities = JSON.parse(localStorage.getItem('weatherCities'));
	for (var i = 0; i < weatherCities.length; i++) {
		$('#main-page-wrapper').append(slideTemp.replace(/{{i}}/g, i));
		$('#indicator').append('<span class="indicator-span" id="indicator-span-' + i + '"></span>');
	}
	if (pages == null) {
		pages = $('.swiper-pages').swiper({
			onSlideChangeEnd: function() {
				weatherCities = JSON.parse(localStorage.getItem('weatherCities'));
				for (var i = 0; i < weatherCities.length; i++) {
					$('#indicator-span-' + i).removeClass('bg-color');
				}
				if (localStorage.getItem('lang') == 'lang1') {
					$('#indicator-span-' + (weatherCities.length - pages.activeIndex - 1)).addClass('bg-color');
				} else {
					$('#indicator-span-' + pages.activeIndex).addClass('bg-color');
				}
			}
		});
	} else {
		pages.reInit();
	}
	pages.swipeTo(0, 1);
	if (localStorage.getItem('lang') == 'lang1') {
		$('.swiper-pages .swiper-wrapper .swiper-slide').addClass('floatRight');
		$('.day').css('float', 'right');
		$('.day-inner').css('border-right', 'none').css('border-left', '1px solid #fff');
		$('.day-inner-last').css('border-left', 'none');
		pages.swipeTo(weatherCities.length - 1, 1);
	}
	fillWeatherData(0);
	for (var i = 0; i < weatherCities.length; i++) {
		if (weatherCities[i].weather != null) {
			if (weatherCities[i].weather.length == 0) {
				getAllWeather(i);
				break;
			}
		}
	}
	checkConnection();
	if (connected == 1) {
		var IntervalDiffHours = parseInt(localStorage.getItem('interval')) * 60 * 60 * 1000;
		var oldDate = new Date(localStorage.getItem('lastRunTime'));
		var newDate = new Date();
		if ((newDate - oldDate) >= IntervalDiffHours) {
			getAllWeather(0);
			localStorage.setItem('lastRunTime', newDate);
			setInterv(parseInt(localStorage.getItem('interval')));
		}
	}
	$(".swiper-slide").fitVids();
	videojs.options.flash.swf = "video-js.swf";
}
function fillWeatherData(index) {
	weatherCities = JSON.parse(localStorage.getItem('weatherCities'));
	if (index < weatherCities.length) {
		if (weatherCities[index].weather != null) {
			var currentDate = new Date();
			for (var i = 0; i < weatherCities[index].weather.length; i++) {
				var weatherDate = new Date(weatherCities[index].weather[i].dt * 1000);
				if (weatherDate.getMonth() < currentDate.getMonth()) {
					weatherCities[index].weather.splice(i, 1);
				} else if (weatherDate.getMonth() == currentDate.getMonth()) {
					if (weatherDate.getDate() < currentDate.getDate()) {
						weatherCities[index].weather.splice(i, 1);
					}
				}
			}
			localStorage.setItem('weatherCities', JSON.stringify(weatherCities));
			$.ajax({
				type : 'GET',
				url : weatheStatURL,
				dataType : 'JSON'
			}).done(function(response) {
				weatheStats = response;
				if (weatherCities[index].name.indexOf(",") > -1) {
					$('#day-details-city-' + index).html(weatherCities[index].name.slice(0, weatherCities[index].name.indexOf(",")));
				} else {
					$('#day-details-city-' + index).html(weatherCities[index].name);
				}
				for (var i = 0; i < 4; i++) {
					if (i < weatherCities[index].weather.length) {
						var dt = new Date(weatherCities[index].weather[i].dt * 1000);
						$('#week-day-' + index + '-' + i).html(userLanguage.weekDays[dt.getDay()]);
						$('#day-date-' + index + '-' + i).html(dt.getDate() + ' ' + userLanguage.months[dt.getMonth()]);
						var currentTemprature;
						var cdt = new Date();
						if (cdt.getHours() >= 5 && cdt.getHours() <= 9) {
							currentTemprature = weatherCities[index].weather[i].temp.morn;
						} else if (cdt.getHours() > 9 && cdt.getHours() < 17) {
							currentTemprature = weatherCities[index].weather[i].temp.day;
						} else if (cdt.getHours() >= 17 && cdt.getHours() <= 21) {
							currentTemprature = weatherCities[index].weather[i].temp.eve;
						} else {
							currentTemprature = weatherCities[index].weather[i].temp.night;
						}
						var minTemprature = weatherCities[index].weather[i].temp.min;
						var maxTemprature = weatherCities[index].weather[i].temp.max;
						var tempUnit = localStorage.getItem('tempUnit');
						if (tempUnit == 'C') {
							minTemprature = Math.round(minTemprature - 273.15);
							maxTemprature = Math.round(maxTemprature - 273.15);
							currentTemprature = Math.round(currentTemprature - 273.15);
						} else {
							minTemprature = Math.round(((minTemprature - 273.15)*9/5)+32);
							maxTemprature = Math.round(((maxTemprature - 273.15)*9/5)+32);
							currentTemprature = Math.round(((currentTemprature - 273.15)*9/5)+32);
						}
						$('#day-temp-' + index + '-' + i).html(minTemprature + '/' + maxTemprature);
						$('#day-temp-unit-' + index + '-' + i).html(tempUnit);
						var weatherStatText, backgroundPic;
						$('.day-icon').height($('.day-inner').height() - $('.week-day').height() - $('.day-date').height() - $('.day-temp-div').height());
						if (weatherCities[index].weather[i].weather[0].id == 200 || weatherCities[index].weather[i].weather[0].id == 201 || weatherCities[index].weather[i].weather[0].id == 202 || weatherCities[index].weather[i].weather[0].id == 210 || weatherCities[index].weather[i].weather[0].id == 211 || weatherCities[index].weather[i].weather[0].id == 212 || weatherCities[index].weather[i].weather[0].id == 221 || weatherCities[index].weather[i].weather[0].id == 230 || weatherCities[index].weather[i].weather[0].id == 231 || weatherCities[index].weather[i].weather[0].id == 232) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_thunderstorms.png") no-repeat');
							backgroundPic = 'bg_thunderstorms.jpg';
							weatherStatText = weatheStats.w200;
						} else if (weatherCities[index].weather[i].weather[0].id == 300 || weatherCities[index].weather[i].weather[0].id == 301 || weatherCities[index].weather[i].weather[0].id == 302 || weatherCities[index].weather[i].weather[0].id == 310 || weatherCities[index].weather[i].weather[0].id == 311 || weatherCities[index].weather[i].weather[0].id == 312 || weatherCities[index].weather[i].weather[0].id == 313 || weatherCities[index].weather[i].weather[0].id == 314 || weatherCities[index].weather[i].weather[0].id == 321) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_rain.png") no-repeat center');
							backgroundPic = 'bg_rain.jpg';
							weatherStatText = weatheStats.w300;
						} else if (weatherCities[index].weather[i].weather[0].id == 500 || weatherCities[index].weather[i].weather[0].id == 501 || weatherCities[index].weather[i].weather[0].id == 502 || weatherCities[index].weather[i].weather[0].id == 503 || weatherCities[index].weather[i].weather[0].id == 504 || weatherCities[index].weather[i].weather[0].id == 511 || weatherCities[index].weather[i].weather[0].id == 520 || weatherCities[index].weather[i].weather[0].id == 521 || weatherCities[index].weather[i].weather[0].id == 522 || weatherCities[index].weather[i].weather[0].id == 531) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_shower.png") no-repeat center');
							backgroundPic = 'bg_shower.jpg';
							weatherStatText = weatheStats.w500;
						} else if (weatherCities[index].weather[i].weather[0].id == 600 || weatherCities[index].weather[i].weather[0].id == 601 || weatherCities[index].weather[i].weather[0].id == 602 || weatherCities[index].weather[i].weather[0].id == 611 || weatherCities[index].weather[i].weather[0].id == 612 || weatherCities[index].weather[i].weather[0].id == 615 || weatherCities[index].weather[i].weather[0].id == 616 || weatherCities[index].weather[i].weather[0].id == 620 || weatherCities[index].weather[i].weather[0].id == 621 || weatherCities[index].weather[i].weather[0].id == 622) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_snow.png") no-repeat center');
							backgroundPic = 'bg_snow.jpg';
							weatherStatText = weatheStats.w600;
						} else if (weatherCities[index].weather[i].weather[0].id == 701) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_fog.png") no-repeat center');
							backgroundPic = 'bg_fog.jpg';
							weatherStatText = weatheStats.w701;
						} else if (weatherCities[index].weather[i].weather[0].id == 711) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_fog.png") no-repeat center');
							backgroundPic = 'bg_fog.jpg';
							weatherStatText = weatheStats.w711;
						} else if (weatherCities[index].weather[i].weather[0].id == 721) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_fog.png") no-repeat center');
							backgroundPic = 'bg_fog.jpg';
							weatherStatText = weatheStats.w721;
						} else if (weatherCities[index].weather[i].weather[0].id == 731) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_fog.png") no-repeat center');
							backgroundPic = 'bg_fog.jpg';
							weatherStatText = weatheStats.w731;
						} else if (weatherCities[index].weather[i].weather[0].id == 741) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_fog.png") no-repeat center');
							backgroundPic = 'bg_fog.jpg';
							weatherStatText = weatheStats.w741;
						} else if (weatherCities[index].weather[i].weather[0].id == 751) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_fog.png") no-repeat center');
							backgroundPic = 'bg_fog.jpg';
							weatherStatText = weatheStats.w751;
						} else if (weatherCities[index].weather[i].weather[0].id == 761) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_fog.png") no-repeat center');
							backgroundPic = 'bg_fog.jpg';
							weatherStatText = weatheStats.w761;
						} else if (weatherCities[index].weather[i].weather[0].id == 762) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_unknown.png") no-repeat center');
							backgroundPic = 'weather_unknown.png';
							weatherStatText = weatheStats.w762;
						} else if (weatherCities[index].weather[i].weather[0].id == 771) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_unknown.png") no-repeat center');
							backgroundPic = 'weather_unknown.png';
							weatherStatText = weatheStats.w771;
						} else if (weatherCities[index].weather[i].weather[0].id == 781 || weatherCities[index].weather[i].weather[0].id == 900) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_unknown.png") no-repeat center');
							backgroundPic = 'weather_unknown.png';
							weatherStatText = weatheStats.w781;
						} else if (weatherCities[index].weather[i].weather[0].id == 800) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_sunny.png") no-repeat center');
							backgroundPic = 'bg_sunny.jpg';
							weatherStatText = weatheStats.w800;
						} else if (weatherCities[index].weather[i].weather[0].id == 801 || weatherCities[index].weather[i].weather[0].id == 802) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_mostcloudy.png") no-repeat center');
							backgroundPic = 'bg_mostly_cloudy.jpg';
							weatherStatText = weatheStats.w801;
						} else if (weatherCities[index].weather[i].weather[0].id == 803 || weatherCities[index].weather[i].weather[0].id == 804) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_cloud.png") no-repeat center');
							backgroundPic = 'bg_cloudy.jpg';
							weatherStatText = weatheStats.w803;
						} else if (weatherCities[index].weather[i].weather[0].id == 901) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_unknown.png") no-repeat center');
							backgroundPic = 'weather_unknown.png';
							weatherStatText = weatheStats.w901;
						} else if (weatherCities[index].weather[i].weather[0].id == 902 || weatherCities[index].weather[i].weather[0].id == 962) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_unknown.png") no-repeat center');
							backgroundPic = 'weather_unknown.png';
							weatherStatText = weatheStats.w902;
						} else if (weatherCities[index].weather[i].weather[0].id == 903) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_cold.png") no-repeat center');
							backgroundPic = 'bg_cold.jpg';
							weatherStatText = weatheStats.w903;
						} else if (weatherCities[index].weather[i].weather[0].id == 904) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_hot.png") no-repeat center');
							backgroundPic = 'bg_hot.jpg';
							weatherStatText = weatheStats.w904;
						} else if (weatherCities[index].weather[i].weather[0].id == 905) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_wind.png") no-repeat center');
							backgroundPic = 'bg_windy.jpg';
							weatherStatText = weatheStats.w905;
						} else if (weatherCities[index].weather[i].weather[0].id == 906) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_shower.png") no-repeat center');
							backgroundPic = 'bg_shower.jpg';
							weatherStatText = weatheStats.w906;
						} else if (weatherCities[index].weather[i].weather[0].id == 951) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_unknown.png") no-repeat center');
							backgroundPic = 'weather_unknown.png';
							weatherStatText = weatheStats.w951;
						} else if (weatherCities[index].weather[i].weather[0].id >= 952 && weatherCities[index].weather[i].weather[0].id <= 956) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_wind.png") no-repeat center');
							backgroundPic = 'bg_windy.jpg';
							weatherStatText = weatheStats.w952;
						} else if (weatherCities[index].weather[i].weather[0].id == 957) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_wind.png") no-repeat center');
							backgroundPic = 'bg_windy.jpg';
							weatherStatText = weatheStats.w957;
						} else if (weatherCities[index].weather[i].weather[0].id == 958 || weatherCities[index].weather[i].weather[0].id == 959) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_unknown.png") no-repeat center');
							backgroundPic = 'weather_unknown.png';
							weatherStatText = weatheStats.w958;
						} else if (weatherCities[index].weather[i].weather[0].id == 960 || weatherCities[index].weather[i].weather[0].id == 961) {
							$('#day-icon-' + index + '-' + i).css('background', 'url("img/weather_unknown.png") no-repeat center');
							backgroundPic = 'weather_unknown.png';
							weatherStatText = weatheStats.w960;
						}
						$('#day-icon-' + index + '-' + i).css('background-size', 'contain');
						if (i == 0) {
							$('#backgound-' + index).css('background', 'url("img/' + backgroundPic + '") no-repeat').css('background-size', 'cover');
							$('#indicator-span-' + i).addClass('bg-color');
							$('#day-' + index + '-' + i).addClass('day-active');
							$('#day-' + index + '-' + i).addClass('border-color');
							$('#week-day-' + index + '-' + i).html(userLanguage.today);
							$('#week-day-' + index + '-' + i).addClass('week-day-active');
							$('#day-details-current-temp-' + index).html(currentTemprature);
							$('#day-details-current-temp-unit-' + index).html(tempUnit);
							$('#day-details-weather-stat-' + index).html(weatherStatText);
							$('#day-details-temp-' + index).html(minTemprature + '/' + maxTemprature);
							$('#day-details-temp-unit-' + index).html(tempUnit);
						}
					}
				}
				index++;
				fillWeatherData(index);
			}).fail(function() {
				fillWeatherData(index);
			});
		} else {
			getSpecificWeather(index);
		}
	}
}
function getSpecificWeather(index) {
	weatherCities = JSON.parse(localStorage.getItem('weatherCities'));
	checkConnection();
	if (connected == 1) {
		$.ajax({
			type : 'GET',
			url : 'http://api.openweathermap.org/data/2.5/forecast/daily?id=' + weatherCities[index].id + '&cnt=10&mode=json',
			dataType : 'JSON'
		}).done(function(response) {
			weatherCities[index].weather = response.list;
			localStorage.setItem('weatherCities', JSON.stringify(weatherCities));
			fillWeatherData(index);
		}).fail(function() {
			//window.plugins.toast.showLongBottom(userLanguage.getWeatherError + ' ' + weatherCities[index].name);
			index++;
			fillWeatherData(index);
		});
	} else {
		//window.plugins.toast.showLongBottom(userLanguage.noInternet);
	}
}
function setInterv(interv) {
	clearInterval(updateInterval);
	updateInterval = setInterval(function() {
		getAllWeather(0);
	}, interv * 60 * 60 * 1000);
}
function getAllWeather(index) {
	weatherCities = JSON.parse(localStorage.getItem('weatherCities'));
	if (index < weatherCities.length) {
		checkConnection();
		if (connected == 1) {
			$.ajax({
				type : 'GET',
				url : 'http://api.openweathermap.org/data/2.5/forecast/daily?id=' + weatherCities[index].id + '&cnt=10&mode=json',
				dataType : 'JSON'
			}).done(function(response) {
				weatherCities[index].weather = response.list;
				localStorage.setItem('weatherCities', JSON.stringify(weatherCities));
				index++;
				getAllWeather(index);
			}).fail(function() {
				//window.plugins.toast.showLongBottom(userLanguage.getWeatherError + ' ' + weatherCities[index].name);
				index++;
				getAllWeather(index);
			});
		} else {
			//window.plugins.toast.showLongBottom(userLanguage.noInternet);
		}
	} else if (index == weatherCities.length) {
		loadMain();
	}
}
function checkConnection() {
	var networkState = navigator.network.connection.type;
	if (networkState == Connection.NONE) {
		connected = 0;
	} else {
		connected = 1;
	}
}
function loadWeatherData(page, day) {
	var dt = new Date(weatherCities[page].weather[day].dt * 1000);
	var minTemprature = weatherCities[page].weather[day].temp.min;
	var maxTemprature = weatherCities[page].weather[day].temp.max;
	var currentTemprature;
	var cdt = new Date();
	if (cdt.getHours() >= 5 && cdt.getHours() <= 9) {
		currentTemprature = weatherCities[page].weather[day].temp.morn;
	} else if (cdt.getHours() > 9 && cdt.getHours() < 17) {
		currentTemprature = weatherCities[page].weather[day].temp.day;
	} else if (cdt.getHours() >= 17 && cdt.getHours() <= 21) {
		currentTemprature = weatherCities[page].weather[day].temp.eve;
	} else {
		currentTemprature = weatherCities[page].weather[day].temp.night;
	}
	var tempUnit = localStorage.getItem('tempUnit');
	if (tempUnit == 'C') {
		minTemprature = Math.round(minTemprature - 273.15);
		maxTemprature = Math.round(maxTemprature - 273.15);
		currentTemprature = Math.round(currentTemprature - 273.15);
	} else {
		minTemprature = Math.round(((minTemprature - 273.15)*9/5)+32);
		maxTemprature = Math.round(((maxTemprature - 273.15)*9/5)+32);
		currentTemprature = Math.round(((currentTemprature - 273.15)*9/5)+32);
	}
	var weatherStatText, backgroundPic;
	if (weatherCities[page].weather[day].weather[0].id == 200 || weatherCities[page].weather[day].weather[0].id == 201 || weatherCities[page].weather[day].weather[0].id == 202 || weatherCities[page].weather[day].weather[0].id == 210 || weatherCities[page].weather[day].weather[0].id == 211 || weatherCities[page].weather[day].weather[0].id == 212 || weatherCities[page].weather[day].weather[0].id == 221 || weatherCities[page].weather[day].weather[0].id == 230 || weatherCities[page].weather[day].weather[0].id == 231 || weatherCities[page].weather[day].weather[0].id == 232) {
		backgroundPic = 'bg_thunderstorms.jpg';
		weatherStatText = weatheStats.w200;
	} else if (weatherCities[page].weather[day].weather[0].id == 300 || weatherCities[page].weather[day].weather[0].id == 301 || weatherCities[page].weather[day].weather[0].id == 302 || weatherCities[page].weather[day].weather[0].id == 310 || weatherCities[page].weather[day].weather[0].id == 311 || weatherCities[page].weather[day].weather[0].id == 312 || weatherCities[page].weather[day].weather[0].id == 313 || weatherCities[page].weather[day].weather[0].id == 314 || weatherCities[page].weather[day].weather[0].id == 321) {
		backgroundPic = 'bg_rain.jpg';
		weatherStatText = weatheStats.w300;
	} else if (weatherCities[page].weather[day].weather[0].id == 500 || weatherCities[page].weather[day].weather[0].id == 501 || weatherCities[page].weather[day].weather[0].id == 502 || weatherCities[page].weather[day].weather[0].id == 503 || weatherCities[page].weather[day].weather[0].id == 504 || weatherCities[page].weather[day].weather[0].id == 511 || weatherCities[page].weather[day].weather[0].id == 520 || weatherCities[page].weather[day].weather[0].id == 521 || weatherCities[page].weather[day].weather[0].id == 522 || weatherCities[page].weather[day].weather[0].id == 531) {
		backgroundPic = 'bg_shower.jpg';
		weatherStatText = weatheStats.w500;
	} else if (weatherCities[page].weather[day].weather[0].id == 600 || weatherCities[page].weather[day].weather[0].id == 601 || weatherCities[page].weather[day].weather[0].id == 602 || weatherCities[page].weather[day].weather[0].id == 611 || weatherCities[page].weather[day].weather[0].id == 612 || weatherCities[page].weather[day].weather[0].id == 615 || weatherCities[page].weather[day].weather[0].id == 616 || weatherCities[page].weather[day].weather[0].id == 620 || weatherCities[page].weather[day].weather[0].id == 621 || weatherCities[page].weather[day].weather[0].id == 622) {
		backgroundPic = 'bg_snow.jpg';
		weatherStatText = weatheStats.w600;
	} else if (weatherCities[page].weather[day].weather[0].id == 701) {
		backgroundPic = 'bg_fog.jpg';
		weatherStatText = weatheStats.w701;
	} else if (weatherCities[page].weather[day].weather[0].id == 711) {
		backgroundPic = 'bg_fog.jpg';
		weatherStatText = weatheStats.w711;
	} else if (weatherCities[page].weather[day].weather[0].id == 721) {
		backgroundPic = 'bg_fog.jpg';
		weatherStatText = weatheStats.w721;
	} else if (weatherCities[page].weather[day].weather[0].id == 731) {
		backgroundPic = 'bg_fog.jpg';
		weatherStatText = weatheStats.w731;
	} else if (weatherCities[page].weather[day].weather[0].id == 741) {
		backgroundPic = 'bg_fog.jpg';
		weatherStatText = weatheStats.w741;
	} else if (weatherCities[page].weather[day].weather[0].id == 751) {
		backgroundPic = 'bg_fog.jpg';
		weatherStatText = weatheStats.w751;
	} else if (weatherCities[page].weather[day].weather[0].id == 761) {
		backgroundPic = 'bg_fog.jpg';
		weatherStatText = weatheStats.w761;
	} else if (weatherCities[page].weather[day].weather[0].id == 762) {
		backgroundPic = 'weather_unknown.png';
		weatherStatText = weatheStats.w762;
	} else if (weatherCities[page].weather[day].weather[0].id == 771) {
		backgroundPic = 'weather_unknown.png';
		weatherStatText = weatheStats.w771;
	} else if (weatherCities[page].weather[day].weather[0].id == 781 || weatherCities[page].weather[day].weather[0].id == 900) {
		backgroundPic = 'weather_unknown.png';
		weatherStatText = weatheStats.w781;
	} else if (weatherCities[page].weather[day].weather[0].id == 800) {
		backgroundPic = 'bg_sunny.jpg';
		weatherStatText = weatheStats.w800;
	} else if (weatherCities[page].weather[day].weather[0].id == 801 || weatherCities[page].weather[day].weather[0].id == 802) {
		backgroundPic = 'bg_mostly_cloudy.jpg';
		weatherStatText = weatheStats.w801;
	} else if (weatherCities[page].weather[day].weather[0].id == 803 || weatherCities[page].weather[day].weather[0].id == 804) {
		backgroundPic = 'bg_cloudy.jpg';
		weatherStatText = weatheStats.w803;
	} else if (weatherCities[page].weather[day].weather[0].id == 901) {
		backgroundPic = 'weather_unknown.png';
		weatherStatText = weatheStats.w901;
	} else if (weatherCities[page].weather[day].weather[0].id == 902 || weatherCities[page].weather[day].weather[0].id == 962) {
		backgroundPic = 'weather_unknown.png';
		weatherStatText = weatheStats.w902;
	} else if (weatherCities[page].weather[day].weather[0].id == 903) {
		backgroundPic = 'bg_cold.jpg';
		weatherStatText = weatheStats.w903;
	} else if (weatherCities[page].weather[day].weather[0].id == 904) {
		backgroundPic = 'bg_hot.jpg';
		weatherStatText = weatheStats.w904;
	} else if (weatherCities[page].weather[day].weather[0].id == 905) {
		backgroundPic = 'bg_windy.jpg';
		weatherStatText = weatheStats.w905;
	} else if (weatherCities[page].weather[day].weather[0].id == 906) {
		backgroundPic = 'bg_shower.jpg';
		weatherStatText = weatheStats.w906;
	} else if (weatherCities[page].weather[day].weather[0].id == 951) {
		backgroundPic = 'weather_unknown.png';
		weatherStatText = weatheStats.w951;
	} else if (weatherCities[page].weather[day].weather[0].id >= 952 && weatherCities[page].weather[day].weather[0].id <= 956) {
		backgroundPic = 'bg_windy.jpg';
		weatherStatText = weatheStats.w952;
	} else if (weatherCities[page].weather[day].weather[0].id == 957) {
		backgroundPic = 'bg_windy.jpg';
		weatherStatText = weatheStats.w957;
	} else if (weatherCities[page].weather[day].weather[0].id == 958 || weatherCities[page].weather[day].weather[0].id == 959) {
		backgroundPic = 'weather_unknown.png';
		weatherStatText = weatheStats.w958;
	} else if (weatherCities[page].weather[day].weather[0].id == 960 || weatherCities[page].weather[day].weather[0].id == 961) {
		backgroundPic = 'weather_unknown.png';
		weatherStatText = weatheStats.w960;
	}
	$('#backgound-' + page).css('background', 'url("img/' + backgroundPic + '") no-repeat').css('background-size', 'cover');
	weatherCities = JSON.parse(localStorage.getItem('weatherCities'));
	for (var i = 0; i < 4; i++) {
		$('#day-' + page + '-' + i).removeClass('day-active');
		$('#day-' + page + '-' + i).removeClass('border-color');
		$('#week-day-' + page + '-' + i).removeClass('week-day-active');
	}
	$('#day-' + page + '-' + day).addClass('day-active');
	$('#day-' + page + '-' + day).addClass('border-color');
	$('#week-day-' + page + '-' + day).addClass('week-day-active');
	$('#day-details-current-temp-' + page).html(currentTemprature);
	$('#day-details-current-temp-unit-' + page).html(tempUnit);
	$('#day-details-weather-stat-' + page).html(weatherStatText);
	$('#day-details-temp-' + page).html(minTemprature + '/' + maxTemprature);
	$('#day-details-temp-unit-' + page).html(tempUnit);
}