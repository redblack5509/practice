var maxBlackNum = 10;
define(function (require, exports, module) {
	var preDialog = "online-list-wrapper";

	var blacklistModuleLogic = new BlacklistModuleLogic(),
		onlinelistModuleLogic = new OnlinelistModuleLogic();

	var statusTimer = null;


	function ModuleLogic() {

		var that = this;

		this.pageRunning = true;
		this.closeNotify = false;
		var mouseOverFlag = false;

		this.init = function () {
			this.pageRunning = true;
			this.initEvent();
			this.getValue("goform/getStatus", {
				module1: "sysStatusInfo"
			});
			blacklistModuleLogic.initEvent();
			onlinelistModuleLogic.initEvent();

		};

		this.getValue = function (url, requireObj) {
			$.GetSetData.setData(url, $.extend({
				random: Math.random()
			}, requireObj), function (obj) {
				var jsonObj = $.parseJSON(obj);
				that.initValue(jsonObj);
			});
		};

		this.initEvent = function () {
			$('.iframe-close').on("click", function () {
				closeIframe(preDialog);
			});

			$("#closeDevice").on("click", function () {
				closeIframe(preDialog);
			});

			$("#signal").on("mouseover", function () {
				mouseOverFlag = true;
			});

			$("#signal").on("mouseout", function () {
				mouseOverFlag = false;
			})

			$("#onlineList").on("click", function () {
				preDialog = "online-list-wrapper";
				showDialog("online-list-wrapper", '', 490);
				$("#online-list-wrapper .head_title").html(_("Connected Devices (%s)", [that.data.statusOnlineNumber]));
				onlinelistModuleLogic.getValue();


			});

			$("#blackList").on("click", function () {
				preDialog = "black-list-wrapper";
				showDialog("black-list-wrapper", '', 490);
				$("#black-list-wrapper .head_title").html(_("Blacklist (%s)", [that.data.statusBlackNum]));
				blacklistModuleLogic.getValue();
			});

			/*$('.close-notify').on('click', function () {
				$("#notify").addClass("none");
				moduleLogic.closeNotify = true;
			});*/

			/*$('#notify a').on('click', function () {
				$("#system").trigger('click');
			});*/
		};

		this.initValue = function (obj) { //初始化数据
			clearTimeout(statusTimer);

			statusTimer = setTimeout(function () {

				that.getValue("goform/getStatus", {
					module1: "sysStatusInfo"
				});
			}, 5000);

			if (!that.pageRunning) {
				clearTimeout(statusTimer);
				return;
			}
			that.data = obj.sysStatusInfo;

			inputValue(that.data);
			$("[name='routerName']").attr("title", that.data.routerName);
			$("[name='extendName']").attr("title", that.data.extendName);

			/*signal*/
			var signal = parseInt(that.data.wifiRate, 10);
			if (signal >= -45) {
				signal = "4";
			} else if (signal < -45 && signal >= -60) {
				signal = "3";
			} else if (signal < -60 && signal >= -74) {
				signal = "2";
			} else {
				signal = "1";
			}
			$('#failFlag').addClass("none");

			if (that.data.extended === "0") { //extend failed
				signal = "0";
				$('#failFlag').removeClass("none");

				//扩展失败时用灰色虚线
				$('.icon-dot').addClass("text-fail");
			} else {
				$('.icon-dot').removeClass("text-fail");
			}

			//当鼠标放到信号强度图标上时，不修改信号强度图标
			if (!mouseOverFlag) {
				$("#signal").attr({
					'src': '/img/level' + signal + '.png',
					'title': _('Wi-Fi Signal Strength') + '：' + translateSignal(that.data.wifiRate)
				});
			}

			/*notify*/
			if (that.data.hasLoginPwd === "false" && (!moduleLogic.closeNotify)) { //no login password
				//	$("#notify").removeClass("none");
			} else {
				//$("#notify").addClass("none");
			}

			top.pageLogic.initModuleHeight();
		};

		this.checkData = function () { //数据验证

			return;
		};
		this.reCancel = function () {
			that.initValue(that.data);
		};

		this.validate = $.validate({
			custom: function () {
				var msg = that.checkData();
				if (msg) {
					return msg;
				}
			},

			success: function () {
				return;
			},

			error: function (msg) {
				if (msg) {
					top.pageLogic.showModuleMsg(msg);
				}
			}
		});
	}


	function translateSignal(signal) {
		var newPer = 0;
		if (signal == 0) {
			signal = -1;
		}
		signal = Number(signal) || -100;
		if (signal >= 0) {
			newPer = "100%";
		} else if (signal >= -45) {
			newPer = 80 + Math.round((45 + signal) * (20 / 45)) + "%";
		} else if (signal >= -60) {
			newPer = 40 + Math.round((60 + signal) * (40 / 14)) + "%";
		} else if (signal > -75) {
			newPer = 1 + Math.round((74 + signal) * (40 / 13)) + "%";
		} else {
			newPer = "0%";
		}
		return newPer;
	}

	/*online-list*/
	function BlacklistModuleLogic() {
		var that = this;
		this.initEvent = function () {

			$("#list").delegate(".del", "click", function () {
				var mac = $(this).parents("tr").find("td").eq(1).attr("title");
				delList(mac);
			});
		};
		this.getValue = function () {
			$.GetSetData.setData("goform/getUserList", {
				random: Math.random(),
				module1: "blackList"
			}, function (res) {
				that.initHtml(res);
			});
		};
		this.initHtml = function (res) {
			var listObj = $.parseJSON(res);
			var blackList = listObj.blackList,
				str = "",
				len = blackList.length;
			if (len != 0) {
				for (var i = 0; i < len; i++) {

					str += "<tr class='tr-row'>" +
						"<td title='" + blackList[i].devName + "' class='fixed'>" + blackList[i].devName + "</td>" +
						"<td title='" + blackList[i].devMac + "' class='hidden-xs'>" + blackList[i].devMac.toUpperCase() + "</td>" +
						"<td><input type='button' class='btn del btn-primary' value='" + _("Remove") + "'></td></tr>";
				}
			} else {
				str = "<tr><td colspan=3 >" + _("The Blacklist is empty") + "</td></tr>";
			}
			if (str == "") {
				str = "<tr><td colspan=3 >" + _("The Blacklist is empty") + "</td></tr>";
			}
			$("#list").html(str);

			reInitDialogHeight("black-list-wrapper");
		};

		function delList(mac) {
			$.post("goform/setUserList", {
				module1: "delFromBlackList",
				mac: mac
			}, function (str) {
				var num = $.parseJSON(str).errCode;
				if (num == 0) {
					closeIframe(preDialog);
					top.pageLogic.modules.getValue();
					top.pageLogic.showModuleMsg(_("Removing from the Blacklist"), 2000);
				}
			});
		}

	}

	/*online-list*/
	function OnlinelistModuleLogic() {
		var that = this;

		this.blackNum = 0;

		this.initEvent = function () {
			$("#onlinelist").delegate(".del", "click", function () {
				var mac = $(this).parents("tr").attr("alt");
				delOnlineList(mac, that.blackNum);
			});
			$("#onlinelist").delegate(".icon-edit", "click", function () {
				var deviceName;
				$(this).parent().prev().show();
				$(this).parent().prev().prev().hide();
				$(this).parent().hide();
				$(this).parent().next().show();
				deviceName = $(this).parent().prev().find(".setDeviceName").attr("data-alt");
				$(this).parent().prev().find(".setDeviceName").val(deviceName);
				$(this).parent().prev().find(".setDeviceName").focus();
			});

			$("#onlinelist").delegate(".save", "click", this.preSubmit);
		};

		this.preSubmit = function () {

			var deviceName = $(this).parent().parent().find(".setDeviceName").val(),
				$elem = $(this).parent().parent().find(".setDeviceName"),
				$this = $(this),
				errMsg,
				data;

			deviceName = $.trim(deviceName);
			$elem.val(deviceName);
			errMsg = $.validate.valid.ascii(deviceName);
			if (errMsg) {
				top.pageLogic.showModuleMsg(_("Please input a valid device name."), 2000);
				return;
			}
			data = "mac=" + $(this).parent().parent().parent().attr("data-alt") + "&devName=" + encodeURIComponent(deviceName);

			$.post("goform/SetOnlineDevName", data, function (str) {
				var num;
				if (str.indexOf("login.js") > 0) {
					top.location.href = "login.html";
					return;
				}
				num = $.parseJSON(str).errCode || "-1";

				if (num == 0) { //success
					top.pageLogic.showModuleMsg(_("Saved successfully!"));
					$($elem).attr("data-alt", deviceName);
					$($elem).parent().hide();
					$($elem).parent().prev().show();
					$($elem).parent().prev().attr("title", deviceName);
					$($elem).parent().prev().text(deviceName);
					$($elem).parent().next().show();
					$($this).parent().hide();
				}

			})

		};

		this.getValue = function () {
			$.GetSetData.setData("goform/getUserList", {
				random: Math.random(),
				module1: "onlineList"
			}, that.initHtml);
		};

		this.initHtml = function (obj) {
			obj = $.parseJSON(obj);
			var htmlStr = "",
				initObj;

			initObj = obj.onlineList;
			that.blackNum = initObj[0].blackNum;
			$("#onlinelist").html('');
			if (initObj.length > 1) {
				for (var i = 1; i < initObj.length; i++) {
					htmlStr = "<tr data-alt='" + initObj[i].devMac + "' class='tr-row'>" +
						"<td><div title='' class='online-init-target span-fixed text-content-2 col-xs-10'></div>" +
						'<div class="col-xs-10 none" style="display: none;">' +
						'<input type="text" class="form-control setDeviceName edit-old" value="" maxlength="63" data-mark="" data-alt="C8:3A:35:DD:AF:39"></div>' +
						'<div class="col-xs-2 row" style="display: block;"> <span class="ico-small icon-edit"></span> </div>' +
						'<div class="col-xs-2 row" style="display: none;"> <input type="button" class="btn btn-device-save save btn-primary" value="' + _("Save") + '"></td> </div>' +
						"</td>" +
						"<td  class='text-content-2 fixed'>" + initObj[i].devIp + "</td>" +
						"<td class='hidden-xs text-content-2'>" + initObj[i].devMac.toUpperCase() + "</td>" +
						"</tr>";
					$("#onlinelist").append($(htmlStr));
					$("#onlinelist .online-init-target").attr("title", initObj[i].devName);
					$("#onlinelist .online-init-target").next().find(".setDeviceName").attr("data-alt", initObj[i].devName);
					$("#onlinelist .online-init-target").next().find(".setDeviceName").val(initObj[i].devName);
					$("#onlinelist .online-init-target").text(initObj[i].devName);
					$("#onlinelist .online-init-target").removeClass("online-init-target");
				}

			} else {
				htmlStr = "<tr><td colspan=4 >" + _("No Attached Device") + "</td></tr>";
				$("#onlinelist").html(htmlStr);
			}
			if (htmlStr == "") {
				htmlStr = "<tr><td colspan=4 >" + _("No Attached Device") + "</td></tr>";
				$("#onlinelist").html(htmlStr);
			}


			reInitDialogHeight("online-list-wrapper");
		};

		function delOnlineList(mac, blacknum) {

			if (blacknum >= maxBlackNum) {
				alert(_("The total devices in Blacklist should be within %s.", [maxBlackNum]));
				return;
			}

			$.post("goform/setUserList", {
				module1: "addToBlackList",
				mac: mac
			}, function (str) {
				var num = $.parseJSON(str).errCode;
				if (num == 0) {
					closeIframe(preDialog);
					top.pageLogic.modules.getValue();
					top.pageLogic.showModuleMsg(_("Adding to the Blacklist"), 2000);
				} else if (num == 1) {
					top.pageLogic.showModuleMsg(_("The total devices in Blacklist should be within %s.", [maxBlackNum]));
					return;
				}
			});
		}

	}

	var moduleLogic = new ModuleLogic();
	module.exports = moduleLogic;
});