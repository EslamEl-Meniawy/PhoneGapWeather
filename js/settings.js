var userLanguage;
var langURL;
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
	document.addEventListener("backbutton", backButtonClicked, false);
	var theme = localStorage.getItem('theme');
	$('head').append('<link rel="stylesheet" type="text/css" href="css/colors/color-' + theme + '.css">');
	$('#theme-' + theme).addClass('active-theme');
	var tempUnit = localStorage.getItem('tempUnit');
	$('#' + tempUnit).addClass('color');
	$('#' + tempUnit).addClass('active-temp');
	$('#settings-item-location').click(function() {
		window.location = "location.html";
	});
	$('#settings-item-weather-unit').click(changeWeatherUnit);
	$('#settings-item-interval').click(function() {
		window.location = "interval.html";
	});
	$('#settings-item-language').click(function() {
		window.location = "language.html";
	});
	$('#done').click(backButtonClicked);
	loadLanguage();
}
function backButtonClicked() {
	window.location = "index.html";
}
function changeWeatherUnit() {
	if ($("#F").hasClass("active-temp")) {
		$("#F").removeClass('active-temp');
		$("#F").removeClass('color');
		$("#C").addClass('active-temp');
		$("#C").addClass('color');
	} else {
		$("#C").removeClass('active-temp');
		$("#C").removeClass('color');
		$("#F").addClass('active-temp');
		$("#F").addClass('color');
	}
	localStorage.setItem('tempUnit', $('.active-temp').attr('id'));
}
function loadLanguage() {
	if (localStorage.getItem('lang') == 'lang0') {
		langURL = 'lang/settings/en.json';
	} else if (localStorage.getItem('lang') == 'lang1') {
		$('body').css('direction', 'rtl');
		$('.item-config').css('float', 'left');
		$('#settings').css('padding-left', '0').css('padding-right', '4%');
		langURL = 'lang/settings/ar.json';
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
	$('#settings').html(userLanguage.settings);
	$('#manage-locations').html(userLanguage.manageLocations);
	$('#weather-unit').html(userLanguage.weatherUnit);
	$('#interval').html(userLanguage.updateInterval);
	var updateInterval = localStorage.getItem('interval');
	$('#selected-interval').html(updateInterval);
	if (parseInt(updateInterval) == 1) {
		$('#hour').html(userLanguage.hour);
	} else {
		$('#hour').html(userLanguage.hours);
	}
	$('#language').html(userLanguage.language);
	$('#selected-language').html(userLanguage.languages[parseInt(localStorage.getItem('lang').slice(-1))]);
	$('#color').html(userLanguage.color);
	$('#done').html(userLanguage.done);
}
function changeColor(index) {
	for (var i = 0; i < 6; i++) {
		$("#theme-" + i).removeClass('active-theme');
	}
	$('#theme-' + index).addClass('active-theme');
	$('head').append('<link rel="stylesheet" type="text/css" href="css/colors/color-' + index + '.css">');
	localStorage.setItem('theme', parseInt($('.active-theme').attr('id').slice(-1)));
}