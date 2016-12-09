var G = {};
$(function () {
	$('[name^="wrlEn"]').on("click", function() {
		changeWifiEn($(this));
	});
	initHtml();

	$.validate.valid.ssid = {
		all: function (str) {
			var ret = this.specific(str);
			//ssid 前后不能有空格，可以输入任何字符包括中文，仅32个字节的长度
			if (ret) {
				return ret;
			}

			/*if (str.charAt(0) == " " || str.charAt(str.length - 1) == " ") {
				return _("The first and last character of the WiFi Name cannot be blank space.");
			}*/

			if (getStrByteNum(str) > 32) {
				return _("The WiFi name should be within %s characters.", [32]);
			}
		},
		specific: function (str) {
			var ret = str;
			if ((null == str.match(/[^ -~]/g) ? str.length : str.length + str.match(/[^ -~]/g).length * 2) > 32) {
				return _("The WiFi name should be within %s characters.",[32]);
			}
		}
	}
	$.validate.valid.ssidPwd = {
		all: function (str) {
			var ret = this.specific(str);

			if (ret) {
				return ret;
			}
			if((/^[0-9a-fA-F]{1,}$/).test(str) && str.length == 64) { //全是16进制 且长度是64
				
			} else {
				if (str.length < 8 || str.length > 63) {
					return _("The password should be made of %s~%s characters.", [8, 63]);
				}
			}
			//密码不允许输入空格
			//if (str.indexOf(" ") >= 0) {
			//	return _("WiFi Password cannot contain blank space.");
			//}
			//密码前后不能有空格
			/*if (str.charAt(0) == " " || str.charAt(str.length - 1) == " ") {
				return _("The first and last character of the WiFi Password cannot be blank space.");
			}*/
		},
		specific: function (str) {
			var ret = str;
			if (/[^\x00-\x80]/.test(str)) {
				return _("Illegal characters are not allowed.");
			}
		}
	}
	checkData();
	initEvent();
	getValue();
	top.loginOut();
});

function initHtml() {
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
}

function initEvent() {
	$("#save").on("click", function () {
		G.validate.checkAll();
	});
	$("select").on("change", function() {
		if($(this).val() === "none") {
			$(this).parent().parent().next().find("input").val("").attr("disabled", true);
		} else {
			$(this).parent().parent().next().find("input").attr("disabled", false);
			$("#wrlPwd").initPassword("", false, false);
			$("#wrlPwd_5g").initPassword("", false, false);
		}
	});
}

function checkData() {
	G.validate = $.validate({
		custom: function () {
			if(($("#security").val() !== "none") && ($("#wrlPwd").val() === "")) {
				return  _("Please specify your 2.4G wifi password.");
			}
			if(($("#security_5g").val() !== "none") && ($("#wrlPwd_5g").val() === "")) {
				return _("Please specify your 5G wifi password.");
			}
		},

		success: function () {
			preSubmit();
		},

		error: function (msg) {
			if(msg) {
				$("#wrl_save_msg").html(msg);
		        setTimeout(function () {
		            $("#wrl_save_msg").html("&nbsp;");
		        }, 3000);
			}
			return;
		}
	});
}

function getValue() {
	$.getJSON("goform/WifiBasicGet?" + Math.random(), initValue);
}

function changeWifiEn(ele) {
	var className = ele.attr("class");
	if (className == "btn-off") {
		ele.attr("class", "btn-on");
		ele.val(1);
		ele.parent().parent().nextAll().removeClass("none");
	} else {
		ele.attr("class", "btn-off");
		ele.val(0);
		ele.parent().parent().nextAll().addClass("none");
	}
	top.initIframeHeight();
}

function initEn(ele, en) {
	if(en === "on") {
		ele.attr("class", "btn-on");
		ele.val(1);
		ele.parent().parent().nextAll().removeClass("none");
	} else {
		ele.attr("class", "btn-off");
		ele.val(0);
		ele.parent().parent().nextAll().addClass("none");
	}
}
function initValue(obj) {
	inputValue(obj);
	if(obj.wrlEn === "1") {
		initEn($('[name="wrlEn"]'), "on");
	} else {
		initEn($('[name="wrlEn"]'), "off");
	}

	if(obj.wrlEn_5g === "1") {
		initEn($('[name="wrlEn_5g"]'), "on");
	} else {
		initEn($('[name="wrlEn_5g"]'), "off");
	}

	//mainPageLogic.validate.checkAll("wrl-form");
	if (obj.security === "none") {
		$("#wrlPwd").val("").attr("disabled", true);
	} else {
		$("#wrlPwd").attr("disabled", false);
		$("#wrlPwd").initPassword("", false, false);
	}
	if (obj.security_5g === "none") {
		$("#wrlPwd_5g").val("").attr("disabled", true);
	} else {
		$("#wrlPwd_5g").attr("disabled", false);
		$("#wrlPwd_5g").initPassword("", false, false);
	}

	if (obj.hideSsid == 1) {
		$("#hideSsid")[0].checked = true;
	} else {
		$("#hideSsid")[0].checked = false;
	}
	if (obj.hideSsid_5g == 1) {
		$("#hideSsid_5g")[0].checked = true;
	} else {
		$("#hideSsid_5g")[0].checked = false;
	}
};

function preSubmit() {
	var subData,
		dataObj,
		subObj,
		msg;
		
	getCheckbox(["hideSsid", "hideSsid_5g"]);

	dataObj = {
		"wrlEn": $('[name="wrlEn"]').val(),
		"wrlEn_5g": $('[name="wrlEn_5g"]').val(),
		"security": $("#security").val(),
		"security_5g": $("#security_5g").val(),
		"ssid": $("#ssid").val(),
		"ssid_5g": $("#ssid_5g").val(),
		"hideSsid": $("#hideSsid").val(),
		"hideSsid_5g": $("#hideSsid_5g").val(),
		"wrlPwd": $("#wrlPwd").val(),
		"wrlPwd_5g": $("#wrlPwd_5g").val()
	}
	subData = objTostring(dataObj);
	$.post("goform/WifiBasicSet", subData, callback);

}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	top.showSaveMsg(num);
	if (num == 0) {
		$("#wrl_submit").blur();
		top.wrlInfo.initValue();
		top.staInfo.initValue();
	}
}