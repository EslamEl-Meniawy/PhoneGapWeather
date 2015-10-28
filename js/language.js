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
		langURL = 'lang/language/en.json';
	} else if (localStorage.getItem('lang') == 'lang1') {
		$('body').css('direction', 'rtl');
		$('#language').css('padding-left', '0').css('padding-right', '4%');
		langURL = 'lang/language/ar.json';
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
	$('#language').html(userLanguage.language);
	for (var i = 0; i < userLanguage.languages.length; i++) {
		$('#items-holder').append('<div class="language-item" onClick="setLang(\'lang' + i + '\')"><div class="language-item-text"><span class="item-title" id="lang' + i + '">' + userLanguage.languages[i] + '</span></div></div>');
	}
	$('#done').html(userLanguage.done);
}
function setLang(lang) {
	localStorage.setItem('lang', lang);
	window.location = "settings.html";
}