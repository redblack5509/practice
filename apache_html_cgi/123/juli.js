$(function() {
	//$.getJSON("cgi-bin/iplocation.cgi?" + Math.random(), initValue);
});

function flush_result(obj) {
	// if(JSON.stringify(obj) == '{}'){
	// 	$("#status").text("查询出错");
	// 	$("#status").show();
	// }else{
	// 	$("#status").hide();

	// 	$("#rsrc").text(obj["rsrc"]);
	// 	$("#rdst").text(obj["rdst"]);
	// 	$("#distence").text(obj["distence"]);

	// 	$("#result").show();
	// }
}

function send() {
	// $("#status").show();
	// $("#result").hide();
	alert($("#upload").val());
	alert($("#data").val());
	data = {
		"data": $("#data").val()
	};
	$.post("cgi-bin/feeling_send.py", data, flush_result, "json");
}

var x = document.getElementById("demo");
$(function() {
	{
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(showPosition, showError);
		} else {
			x.innerHTML = "Geolocation is not supported by this browser.";
		}
	}
});

function showPosition(position) {
	x.innerHTML = "Latitude: " + position.coords.latitude +
		"<br />Longitude: " + position.coords.longitude;
}

function showError(error) {
	switch (error.code) {
		case error.PERMISSION_DENIED:
			x.innerHTML = "User denied the request for Geolocation."
			break;
		case error.POSITION_UNAVAILABLE:
			x.innerHTML = "Location information is unavailable."
			break;
		case error.TIMEOUT:
			x.innerHTML = "The request to get user location timed out."
			break;
		case error.UNKNOWN_ERROR:
			x.innerHTML = "An unknown error occurred."
			break;
	}
}
