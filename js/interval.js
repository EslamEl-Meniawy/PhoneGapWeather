var userLanguage;
var langURL;
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
	document.addEventListener("backbutton", backButtonClicked, false);
	$('head').append('<link rel="stylesheet" type="text/css" href="css/colors/color-' + localStorage.getItem('theme') + '.css">');
	$('#done').click(backButtonClicked);
	loadLanguage();
}
function backButtonClicked() {
	window.location = "settings.html";
}
function loadLanguage() {
	if (localStorage.getItem('lang') == 'lang0') {
		langURL = 'lang/interval/en.json';
	} else if (localStorage.getItem('lang') == 'lang1') {
		$('body').css('direction', 'rtl');
		$('#interval').css('padding-left', '0').css('padding-right', '4%');
		langURL = 'lang/interval/ar.json';
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
	$('#interval').html(userLanguage.updateInterval);
	for (var i = 0; i < 5; i++) {
		if (i == 0) {
			$('#items-holder').append('<div class="interval-item" onClick="setLang(' + (i + 1) + ')"><div class="interval-item-text"><span class="item-title">' + (i + 1) + ' ' + userLanguage.hour + '</span></div></div>');
		} else {
			$('#items-holder').append('<div class="interval-item" onClick="setLang(' + (i + 1) + ')"><div class="interval-item-text"><span class="item-title">' + (i + 1) + ' ' + userLanguage.hours + '</span></div></div>');
		}
	}
	$('#done').html(userLanguage.done);
}
function setLang(interval) {
	localStorage.setItem('interval', parseInt(interval));
	window.location = "settings.html";
}