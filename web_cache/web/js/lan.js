var G = {},
	initObj = null;

$(function () {
	getValue();
	$("#dhcpEn").on("click", function() {
		if (initObj.wl_mode == "apclient") {
			showErrMsg("msg-err", _("The current wireless bridge mode is Universal Repeater, enable/disable DHCP server is not allowed"));
			return;
		}
		changeDhcpEn();
	});

	$('#lanDnsAuto').on('click', changeDnsEn)

	$("#startIp,#endIp").inputCorrect("num");
	$("#lanIp").inputCorrect("ip");
	$("#lanIp").on("blur", function () {
		var ipArr = this.value.split('.');

		if ((/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/).test(this.value)) {
			$("#ipNet").html(ipArr[0] + "." + ipArr[1] + "." + ipArr[2] + ".");
		}
	});

	$.validate.valid.lanip = {
		all: function (str) {
			var ipArr = str.split('.'),
				ret;
			
			$.each(ipArr, function(i, ipPart) {
				ipArr[i] = parseInt(ipPart, 10);
			});
			str = ipArr.join(".");

			ret = this.specific(str);

			if (ret) {
				return ret;
			}
			if (!(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4])$/).test(str)) {
				return (_("Please enter a correct IP address."));
			}
		},

		specific: function (str) {
			var ipArr = str.split('.'),
				ipHead = ipArr[0];

			if(ipArr[0] === '127') {
				return _("IP address first input don't be 127, becuse it is loopback address.");
			}
			if (ipArr[0] > 223) {
				return _("First input %s cannot be greater than 223.", [ipHead]);
			}
		}
	};
	checkData();

	$("#submit").on("click", function () {
		G.validate.checkAll();
	});

	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function changeDhcpEn() {
	var className = $("#dhcpEn").attr("class");
	if (className == "btn-off") {
		$("#dhcpEn").attr("class", "btn-on");
		$("#dhcpEn").val(1);
		$("#dhcp_set").removeClass("none");
	} else {
		$("#dhcpEn").attr("class", "btn-off");
		$("#dhcpEn").val(0);
		$("#dhcp_set").addClass("none");
	}
	top.initIframeHeight();
}

function changeDnsEn() {
	var className = $("#lanDnsAuto").attr("class");
	if (className == "btn-off") {
		$("#lanDnsAuto").attr("class", "btn-on");
		$("#lanDnsAuto").val(0);
		$("#dns_set").removeClass("none");
	} else {
		$("#lanDnsAuto").attr("class", "btn-off");
		$("#lanDnsAuto").val(1);
		$("#dns_set").addClass("none");
	}
	top.initIframeHeight();
}

function checkData() {
	G.validate = $.validate({
		custom: function () {
			var wanIp = G.data.wanIp,
				wanMask = G.data.wanMask,
				lanIp = $("#lanIp").val(),
				lanMask = "255.255.255.0",
				serverIp = G.data.serverIp,
				vlan2Ip = G.data.vlan2Ip,
				vlan2Mask = G.data.vlan2Mask,
				dns1 = $("#lanDns1").val(),
				dns2 = $("#lanDns2").val(),
				remoteIp = G.data.remoteIp,
				pptpSvrIp = G.data.pptpSvrIp,
				vpnClientIp = G.data.vpnCliIp,
				guestIp = G.data.guestIp;


			if (parseInt(lanIp.split(".")[0], 10) < 192) {
				return _("Only IPs (192.X.X.X~223.X.X.X) in Class C are allowed!");

			}
			if (wanIp != "" && checkIpInSameSegment(wanIp, wanMask, lanIp, lanMask)) {
				return _("%s and %s (%s) should not be in the same network segment.", [_("LAN IP"),_("WAN IP"),wanIp]);
			}
			if (remoteIp != "" && checkIpInSameSegment(remoteIp, lanMask, lanIp, lanMask)) {
				return _("%s and %s (%s) should not be in the same network segment.", [_("LAN IP"),_("Remote Web IP"),remoteIp]);
			}
			if (serverIp != "" && checkIpInSameSegment(serverIp, lanMask, lanIp, lanMask)) {
				return _("The LAN IP address conflicts with the IP address of dual-access server (%s). Please make a change.", [serverIp]);
			}
			if (vlan2Ip != "" && checkIpInSameSegment(vlan2Ip, vlan2Mask, lanIp, lanMask)) {
				return _("The LAN IP address conflicts with the dual-access IP address (%s). Please make a change.", [vlan2Ip]);
			}
			// 决策： 访客网络网段冲突有后台处理
			/*if (guestIp != "" && checkIpInSameSegment(guestIp, G.data.guestMask, lanIp, lanMask)) {
				return _("%s and %s (%s) should not be in the same network segment.", [_("LAN IP"),_("Guest Network IP"),guestIp]);
			}*/
			if (pptpSvrIp != "" && checkIpInSameSegment(pptpSvrIp, G.data.pptpSvrMask, lanIp, lanMask)) {
				return _("%s and %s (%s) should not be in the same network segment.", [_("LAN IP"),_("PPTP Server IP"),pptpSvrIp]);
			}
				
			if ($("#dhcpEn").val() == "1") {
				if (parseInt($("#startIp").val(), 10) > parseInt($("#endIp").val(), 10)) {
					return _("The start IP cannot be greater than the end IP.");
				}
			}

			if ((dns1 === dns2) && ($("#lanDnsAuto").hasClass("btn-on")) && (dns1 !== "")) {
				return _("The Preferred DNS Server and Alternate DNS Server cannot be the same.");
			}

			if(checkIpInSameSegment(lanIp, lanMask, vpnClientIp, lanMask)) {
				return _("The LAN IP and PPTP/L2TP client IP:%s cannot be in the same network segment.", [vpnClientIp]);
			}
		},

		success: function () {
			preSubmit();
		},

		error: function (msg) {
			if (msg) {
				$("#msg-err").html(msg);
				setTimeout(function () {
					$("#msg-err").html("&nbsp;");
				}, 3000)
			}
		}
	});
}

function getValue() {
	$.getJSON("goform/AdvGetLanIp?" + Math.random(), initValue);
}

function initValue(obj) {
	initObj = obj;
	inputValue(obj);
	top.$(".main-dailog").removeClass("none");
	top.$("iframe").removeClass("none");
	top.$(".loadding-page").addClass("none");
	G.data = obj;
	var Msg = top.location.search.substring(1);
	if (Msg == "1") {
		$("#msg-err").html(_("IP conflict!  Please change the LAN IP address.  If not, you will fail to access the Internet."));
	}
	$("#lanIp").val(obj.lanIp);
	var ipArry = [];
	ipArry = obj.lanIp.split(".");
	if (obj.dhcpEn == "1") {
		$("#dhcpEn").attr("class", "btn-on");
		$("#dhcpEn").val(1);
		$("#dhcp_set").removeClass("none");
	} else {
		$("#dhcpEn").attr("class", "btn-off");
		$("#dhcpEn").val(0);
		$("#dhcp_set").addClass("none");
	}

	if (obj.lanDnsAuto === "0") {
		$("#lanDnsAuto").attr("class", "btn-on");
		$("#lanDnsAuto").val(0);
		$("#dns_set").removeClass("none");
	} else {
		$("#lanDnsAuto").attr("class", "btn-off");
		$("#lanDnsAuto").val(1);
		$("#dns_set").addClass("none");
	}

	$("#ipNet").html(ipArry[0] + "." + ipArry[1] + "." + ipArry[2] + ".");
	$("#startIp").val(obj.startIp.split(".")[3]);
	$("#endIp").val(obj.endIp.split(".")[3]);
	top.initIframeHeight();
}

function preSubmit() {
	var subData,
		subObj = {};

	subObj = {
		"lanIp": $("#lanIp").val(),
		"dhcpEn": $("#dhcpEn").val(),
		"startIp": $("#ipNet").html() + $("#startIp").val(),
		"endIp": $("#ipNet").html() + $("#endIp").val(),
		"leaseTime": $("#leaseTime").val(),
		"lanDnsAuto": $("#lanDnsAuto").val(),
		"lanDns1": $("#lanDns1").val(),
		"lanDns2": $("#lanDns2").val()
	};

	if ($("#dhcpEn").val() == 0) {
		subObj.startIp = initObj.startIp;
		subObj.endIp = initObj.endIp;
	}
	subData = objTostring(subObj);
	if (!$("#lanIp").hasClass("validatebox-invalid")) {
		$.post("goform/AdvSetLanip", subData, callback);
	}
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	var changeFlag = false;
	if(initObj.lanIp != $("#lanIp").val()) {
		changeFlag = true;	
	}
	//top.showSaveMsg(num,"系统正在配置中",$("#lanIp").val());	
	top.showSaveMsg(num, _("Saving..."), $("#lanIp").val(), changeFlag);
}