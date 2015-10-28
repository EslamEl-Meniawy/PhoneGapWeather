var userLanguage;
var langURL;
var connected;
var weatherCities = [];
var xhr;
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
	document.addEventListener("backbutton", backButtonClicked, false);
	$('head').append('<link rel="stylesheet" type="text/css" href="css/colors/color-' + localStorage.getItem('theme') + '.css">');
	loadLanguage();
	$('#use-current-location').click(function() {
		getLocation();
	});
	$('#done').click(backButtonClicked);
}
function backButtonClicked() {
	window.location = "settings.html";
}
function loadLanguage() {
	if (localStorage.getItem('lang') == 'lang0') {
		$('#loading').css('right', '0')
		langURL = 'lang/location/en.json';
	} else if (localStorage.getItem('lang') == 'lang1') {
		$('body').css('direction', 'rtl');
		$('#manage-locations').css('padding-left', '0').css('padding-right', '4%');
		$('#loading').css('left', '0');
		langURL = 'lang/location/ar.json';
	}
	$.ajax({
		type : 'GET',
		url : langURL,
		dataType : 'JSON'
	}).done(function(response) {
		userLanguage = response;
		fillData();
	}).fail(function() {
		loadLanguage();
	});
}
function fillData() {
	$('#manage-locations').html(userLanguage.manageLocations);
	$('#city-input').attr('placeholder', userLanguage.enterCityName);
	$('#use-current-location').html(userLanguage.useCurrentLocation);
	$('#selected-cities').html(userLanguage.selectedCities);
	var userCities = '';
	weatherCities = JSON.parse(localStorage.getItem('weatherCities'));
	for (var i = 0; i < weatherCities.length; i++) {
		userCities += '<li class="location-item sort-item" id="user-cities-' + i + '"><div class="location-item-text"><span class="item-title">' + weatherCities[i].name + '</span><span class="item-config" onClick="deleteCity(' + i + ')">' + userLanguage.delete + '</span></div></li>';
	}
	$('#user-cities').html(userCities);
	$('#done').html(userLanguage.done);
	$('#user-cities').sortable({
		handle: '.item-title'
	}).bind('sortupdate', function() {
		var newCities = [];
		$(".sort-item").each(function(index) {
			newCities[index] = weatherCities[parseInt($(this).attr('id').slice(-1))];
		});
		localStorage.setItem('weatherCities', JSON.stringify(newCities));
	});
}
function getLocation() {
	$('#returned-suggestions').hide();
	$('#use-current-location').hide();
	$('#city-input').val('');
	//window.plugins.toast.showLongBottom(userLanguage.gettingLocation);
	navigator.geolocation.getCurrentPosition(function(position) {
		getCityByLocation(position.coords.latitude, position.coords.longitude);
	}, function(error) {
		$('#use-current-location').show();
		//window.plugins.toast.showLongBottom(userLanguage.locationError);
	}, {
		maximumAge: 30000,
		timeout: 5000,
		enableHighAccuracy: true
	});
}
function getCityByLocation(lat, lon) {
	checkConnection();
	if (connected == 1) {
		$.ajax({
			type : 'GET',
			url : 'http://api.openweathermap.org/data/2.5/find?lat=' + lat + '&lon=' + lon + '&type=accurate',
			dataType : 'JSON'
		}).done(function(response) {
			if (response.cod == "404" || response.cod == "500") {
				$('#use-current-location').show();
				//window.plugins.toast.showLongBottom(userLanguage.noCityWithLocation);
			} else {
				$('#returned-location').html('');
				$('#returned-location').show();
				for (var i = 0; i < response.count; i++) {
					var cityName = response.list[i].name;
					var cityID = response.list[i].id;
					$('#returned-location').html($('#returned-location').html() + '<div class="location-item" onClick="suggestionClicked(\'' + cityName + '\', ' + cityID + ', \'location\')"><div class="location-item-text"><span class="item-title">' + cityName + '</span></div></div>');
				}
			}
		}).fail(function() {
			$('#use-current-location').show();
			//window.plugins.toast.showLongBottom(userLanguage.noCityWithLocation);
		});
	} else {
		//window.plugins.toast.showLongBottom(userLanguage.noInternet);
	}
}
function showResult(value) {
	$('#returned-location').hide();
	$('#use-my-location').show();
	if (value.length < 3) {
		if (xhr != null) {
			if (xhr.readyState != 4) {
				xhr.abort();
			}
		}
		$('#returned-suggestions').html('');
		$('#returned-suggestions').hide();
	} else {
		$('#loading').show();
		checkConnection();
		if (connected == 1) {
			if (xhr != null) {
				if (xhr.readyState != 4) {
					xhr.abort();
					xhr = $.ajax({
						type : 'GET',
						url : 'http://api.openweathermap.org/data/2.5/find?q=' + value + '&type=like',
						dataType : 'JSON'
					}).done(function(response) {
						if (response.cod != "404" && response.cod != "500") {
							$('#returned-suggestions').html('');
							$('#returned-suggestions').show();
							for (var i = 0; i < response.count; i++) {
								var cityName = response.list[i].name + ', ' + response.list[i].sys.country;
								var cityID = response.list[i].id;
								$('#returned-suggestions').html($('#returned-suggestions').html() + '<div class="location-item" onClick="suggestionClicked(\'' + cityName + '\', ' + cityID + ', \'suggestion\')"><div class="location-item-text"><span class="item-title">' + cityName + '</span></div></div>');
							}
						}
						$('#loading').hide();
					}).fail(function() {
						$('#loading').hide();
					});
				} else {
					xhr = $.ajax({
						type : 'GET',
						url : 'http://api.openweathermap.org/data/2.5/find?q=' + value + '&type=like',
						dataType : 'JSON'
					}).done(function(response) {
						if (response.cod != "404" && response.cod != "500") {
							$('#returned-suggestions').html('');
							$('#returned-suggestions').show();
							for (var i = 0; i < response.count; i++) {
								var cityName = response.list[i].name + ', ' + response.list[i].sys.country;
								var cityID = response.list[i].id;
								$('#returned-suggestions').html($('#returned-suggestions').html() + '<div class="location-item" onClick="suggestionClicked(\'' + cityName + '\', ' + cityID + ', \'suggestion\')"><div class="location-item-text"><span class="item-title">' + cityName + '</span></div></div>');
							}
						}
						$('#loading').hide();
					}).fail(function() {
						$('#loading').hide();
					});
				}
			} else {
				xhr = $.ajax({
					type : 'GET',
					url : 'http://api.openweathermap.org/data/2.5/find?q=' + value + '&type=like',
					dataType : 'JSON'
				}).done(function(response) {
					if (response.cod != "404" && response.cod != "500") {
						$('#returned-suggestions').html('');
						$('#returned-suggestions').show();
						for (var i = 0; i < response.count; i++) {
							var cityName = response.list[i].name + ', ' + response.list[i].sys.country;
							var cityID = response.list[i].id;
							$('#returned-suggestions').html($('#returned-suggestions').html() + '<div class="location-item" onClick="suggestionClicked(\'' + cityName + '\', ' + cityID + ', \'suggestion\')"><div class="location-item-text"><span class="item-title">' + cityName + '</span></div></div>');
						}
					}
					$('#loading').hide();
				}).fail(function() {
					$('#loading').hide();
				});
			}
		} else {
			//window.plugins.toast.showLongBottom(userLanguage.noInternet);
			$('#loading').hide();
		}
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
function suggestionClicked (name, id, whatToHide) {
	weatherCities = JSON.parse(localStorage.getItem('weatherCities'));
	weatherCities.push({"name": name, "id": id, "weather": null});
	localStorage.setItem('weatherCities', JSON.stringify(weatherCities));
	$('#user-cities').html($('#user-cities').html() + '<li class="location-item sort-item" id="user-cities-' + (weatherCities.length - 1) + '"><div class="location-item-text"><span class="item-title">' + weatherCities[weatherCities.length - 1].name + '</span><span class="item-config" onClick="deleteCity(' + (weatherCities.length - 1) + ')">' + userLanguage.delete + '</span></div></li>');
	if (whatToHide == 'suggestion') {
		$('#returned-suggestions').hide();
		$('#returned-suggestions').html('');
	} else if(whatToHide == 'location') {
		$('#returned-location').hide();
		$('#returned-location').html('');
	} else {
		$('#returned-suggestions').hide();
		$('#returned-suggestions').html('');
		$('#returned-location').hide();
		$('#returned-location').html('');
	}
	//window.plugins.toast.showLongBottom(userLanguage.added);
	$('#user-cities').sortable({
		handle: '.item-title'
	}).bind('sortupdate', function() {
		var newCities = [];
		$(".sort-item").each(function(index) {
			newCities[index] = weatherCities[parseInt($(this).attr('id').slice(-1))];
		});
		localStorage.setItem('weatherCities', JSON.stringify(newCities));
	});
}
function deleteCity(index) {
	weatherCities = JSON.parse(localStorage.getItem('weatherCities'));
	if (index > -1) {
		weatherCities.splice(index, 1);
		localStorage.setItem('weatherCities', JSON.stringify(weatherCities));
		$("#user-cities-" + index).remove();
		//window.plugins.toast.showLongBottom(userLanguage.deleted);
		var userCities = '';
		for (var i = 0; i < weatherCities.length; i++) {
			userCities += '<li class="location-item sort-item" id="user-cities-' + i + '"><div class="location-item-text"><span class="item-title">' + weatherCities[i].name + '</span><span class="item-config" onClick="deleteCity(' + i + ')">' + userLanguage.delete + '</span></div></li>';
		}
		$('#user-cities').html(userCities);
		$('#user-cities').sortable({
			handle: '.item-title'
		}).bind('sortupdate', function() {
			var newCities = [];
			$(".sort-item").each(function(index) {
				newCities[index] = weatherCities[parseInt($(this).attr('id').slice(-1))];
			});
			localStorage.setItem('weatherCities', JSON.stringify(newCities));
		});
	}
}