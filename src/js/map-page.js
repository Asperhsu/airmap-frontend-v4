require("css/common.css");
require("css/map.css");

var debounce = require('debounce');
var Indicator = require("js/measure-indicator");
var DataSource = require("js/datasource-loader");
var siteTool = require("js/site-tool");
var LANG = require("js/lang");

var isIE = /*@cc_on!@*/false || !!document.documentMode;
var isEdge = !isIE && !!window.StyleMedia;
if( isIE || isEdge ){
	$("#browser-no-support").show();
	$("#container").hide();
}else{
	//map boot
	var optionsLatLng = getUrlLatLng();
	var options = optionsLatLng ? {center: optionsLatLng, zoom:18} : {};
	MapHandler.boot(options);
	google.maps.event.addDomListener(window, "load", MapHandler.initMap);

	//UI boot
	LANG.boot();
	Indicator.boot();

	$("#loading").show().find(".msg").text('Loading Google Map');

	$("body")
		.on('dataSourceLoadSources', function(){
			$("#loading").show().find(".msg").text('Loading sites');
		})
		.on('mapBootCompelete', function(){
			DataSource.boot();
			siteTool.boot();
			require("js/map-infowindow-layer");
			require("js/typeahead");
		})
		.on("dataSourceLoadCompelete", function(e, data){
			siteTool.loadSites(data);
			$("#loading").hide();
		});
		// .on("mapBoundsChanged", debounce(function (e, status) {
		// 	if (status == 'larger') {
		// 		DataSource.loadSources();
		// 		DataSource.resetUpdate();
		// 	}
		// }, 500));

	$("body").on("dataSourceReachAuotUpdateTimes", function(){
		$("#loading").show().find(".msg").text('Idle time reached, already stop auto reload. If need update data, please refresh page.');
	});
}

//parse location from hash
function getUrlLatLng(href) {
	href = href || location.href;

	var matches = href.match(/@([0-9.]+),([0-9.]+)$/);

	if (matches && matches[1] && matches[2]) {
		return {
			lat: parseFloat(matches[1]),
			lng: parseFloat(matches[2]),
		};
	}

	return null;
}