$(function () {
	getValue();
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function getValue() {
	$.getJSON("goform/GetSystemStatus?" + Math.random(), initValue);
}

var connectStatusMsg = {
	"none":_("None"),
	"wpawpa2psk": _("WPA/WPA2-PSK"),
	"wpapsk": _("WPA-PSK"),
	"wpa2psk": _("WPA2-PSK")
};

function initValue(obj) {
	for (var prop in obj) {
		$("#" + prop).text(obj[prop]);
	}
	top.$(".main-dailog").removeClass("none");
	top.$("iframe").removeClass("none");
	top.$(".loadding-page").addClass("none");

	$("#adv_mac").text(obj.adv_mac.toUpperCase());
	$("#adv_run_time").html(formatSeconds(obj["adv_run_time"]));
	$("#adv_connect_time").html(formatSeconds(obj["adv_connect_time"]));
	if (obj["adv_connect_type"] == "0") {
		$("#adv_connect_type").html(_("DHCP"));
	} else if (obj["adv_connect_type"] == "1") {
		$("#adv_connect_type").html(_("Static IP"));
	} else if (obj["adv_connect_type"] == "2") {
		$("#adv_connect_type").html("PPPoE");
	} else if (obj["adv_connect_type"] == "3") {
		$("#adv_connect_type").html(_("Russia PPTP"));
	} else if (obj["adv_connect_type"] == "4") {
		$("#adv_connect_type").html(_("Russia L2TP"));
	} else if (obj["adv_connect_type"] == "5") {
		$("#adv_connect_type").html(_("Russia PPPoE"));
	}

	if (obj["adv_connect_type"] == "apclient") {
		$("#wanStatusWrap").addClass("none");
	} else {
		$("#wanStatusWrap").removeClass("none");
	}

	if (obj["adv_connect_status"] == 0) {
		$("#adv_connect_status").html(_("No Ethernet cable"));
	} else if (obj["adv_connect_status"] == 1) {
		$("#adv_connect_status").html(_("Disconnected"));
	} else if (obj["adv_connect_status"] == 2) {
		$("#adv_connect_status").html(_("Connecting"));
	} else if (obj["adv_connect_status"] == 3) {
		$("#adv_connect_status").html(_("Connected"));
	} else {
		$("#adv_connect_status").html(_("Disconnected"));
	}

	if (obj.wifi_enable == 0) {
		//表示wifi 2.4G关闭
		$("#adv_wrl_en").html(_("Disabled"));
		$(".wifi-enable").addClass("none");
	} else {
		$(".wifi-enable").removeClass("none");

		if (obj["adv_wrl_en"] == 1) {
			$("#adv_wrl_en").html(_("Invisible"));
		} else {
			$("#adv_wrl_en").html(_("Visible"));
		}
		if (obj["adv_wrl_band"] == "auto") {
			$("#adv_wrl_band").html(_("20/40"));
		}

		$("#adv_wrl_sec").html(connectStatusMsg[obj.adv_wrl_sec]);
	}

	if (obj.wifi_enable_5g == 0) {
		//表示wifi关闭了	

		$("#adv_wrl_en_5g").html(_("Disabled"));

		$(".wifi-enable_5g").addClass("none");
	} else {
		$(".wifi-enable_5g").removeClass("none");

		if (obj["adv_wrl_en_5g"] == 1) {
			$("#adv_wrl_en_5g").html(_("Invisible"));
		} else {
			$("#adv_wrl_en_5g").html(_("Visible"));
		}

		$("#adv_wrl_sec_5g").html(connectStatusMsg[obj.adv_wrl_sec_5g]);
	}

	//top.initIframeHeight();
}