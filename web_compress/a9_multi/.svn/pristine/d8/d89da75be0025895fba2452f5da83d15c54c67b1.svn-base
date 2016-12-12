define(function (require, exports, module) {
	function ModuleLogic(view, submit) {
		var that = this;
		this.init = function () {
			view.addEvent();
			view.getValue("goform/getSysTools", {
				module1: "sysPwd",
				module2: "firmware"
			});
		};

		this.checkData = function () { //数据验证

			if ($("#newPwd").val() != $("#cfmPwd").val()) {
				$("#cfmPwd").focus();
				return _("Password mismatch!");
			}
			return;
		};
		this.reCancel = function () {
			$("#newPwd").removeValidateTip(true).parent().removeClass("has-feedback has-error");
			$("#cfmPwd").removeValidateTip(true).parent().removeClass("has-feedback has-error");
			view.initValue(view.data);
		};
		this.validate = $.validate({
			custom: function () {
				var msg = that.checkData();
				if (msg) {
					return msg;
				}
			},

			success: function () {
				var data = view.getSubmitData();
				var subObj = {
					url: "goform/setSystem",
					subData: data,
					successCallback: view.successCallback,
					errorCallback: view.showErrMsg
				};
				submit.preSubmit(subObj);
			},

			error: function (msg) {
				if (msg) {
					view.showInvalidError(msg);
				}
			}
		});
	};
	var moduleView = new ModuleView();
	var moduleSubmit = new ModuleSubmit();

	/****模块添加事件、方法***
	 *****此处为模块独立属性
	 */

	var uploadUnit = (function () {
		var uploadFlag = false;
		return {
			uploadFile: function (id, url, callback) {
				url = url || './cgi-bin/upgrade';
				if (uploadFlag) {
					return;
				}
				uploadFlag = true;
				$.ajaxFileUpload({
					url: url,
					secureuri: false,
					fileElementId: id,
					type: "post",
					data: {
						"clearConfig": $("#clearConfig")[0].checked ? "true" : "false"
					},
					dataType: 'text',
					success: function () {
						uploadFlag = false;
						if (typeof callback === "function") {
							callback.apply(this, arguments);
						}

						$("#upgradeFile").on("change", goUpgrade);
					}
				});
			}
		};
	}());

	function goUpgrade() {

		var upgradefile = document.getElementById('upgradeFile').value,
			upform = document.upgradefrm;

		if (upgradefile == null || upgradefile == "") {
			return;

			// 判断文件类型
		}

		if (confirm(_('Upgrade the device?'))) {
			uploadUnit.uploadFile("upgradeFile", "", function (msg) {
				var num = $.parseJSON(msg).errCode;
				if (num == "100") {
					parent.progressLogic.init("", "upgrade");
				} else if (num == "201") {
					pageLogic.showModuleMsg(_("Firmware error!") + " " + _("The extender will reboot."));
					setTimeout(function () {
						progressLogic.init("", "reboot", 200);
					}, 2500);
				} else if (num == "202") {
					pageLogic.showModuleMsg(_("Upgrade failed!") + " " + _("The extender will reboot."));
					setTimeout(function () {
						progressLogic.init("", "reboot", 200);
					}, 2500);
				} else if (num == "203") {
					pageLogic.showModuleMsg(_("Firmware size is too large!") + " " + _("The extender will reboot."));
					setTimeout(function () {
						progressLogic.init("", "reboot", 200);
					}, 2500);
				}
			})

		} else {

		}

		$("#upgradeFile").blur();
	}

	moduleView.addEvent = function () { //添加事件
		$("#reboot").on("click", function () {
			if (confirm(_("Do you want to Reboot the Wi-Fi Extender?"))) {
				$.post("goform/setSystem", {
					module1: "sysOperate",
					action: "reboot"
				}, function (str) {
					var num = $.parseJSON(str).errCode;
					if (num == 100) {
						progressLogic.init("", "reboot", 200);
					}
				})
			}
			$("#reboot").blur();
		});

		$("#oldPwd").initPassword("", true);
		$("#newPwd").initPassword("", true);
		$("#cfmPwd").initPassword("", true);

		$("#restore").on("click", function () {
			if (confirm(_("Resetting to factory default will clear all settings of the Wi-Fi Extender."))) {
				$.post("goform/setSystem", {
					module1: "sysOperate",
					action: "restore"
				}, function (str) {
					var num = $.parseJSON(str).errCode;
					if (num == 100) {
						progressLogic.init(_("Resetting...Please wait..."), "restore", 200, "192.168.0.1");
					}
				})
			}
			$("#restore").blur();
		});

		$("#export").on("click", function () {
			window.location = "/cgi-bin/DownloadSyslog/RouterSystem.log?" + Math.random();
			$("#export").blur();
		});

		$("#upgradeFile").on("change", goUpgrade);

	}

	moduleView.initValue = function (obj) { //初始化数据
		moduleView.data = obj;

		if (obj.sysPwd.hasPwd == "true") {
			$("#oldPwdWrap").show();
		} else {
			$("#oldPwdWrap").hide();
		}
		$("#loginPwd input").val("");
		$("#firmwareVision").html(obj.firmware.firmwareVision);

		top.pageLogic.initModuleHeight();
	}

	moduleView.getSubmitData = function () { //获取提交数据
		var encode = new Encode();
		var data = {
			module1: "setPwd",
			oldPwd: encode($("#oldPwd").val()),
			newPwd: encode($("#newPwd").val())
		}
		return objToString(data);

	}
	var moduleLogic = new ModuleLogic(moduleView, moduleSubmit);

	module.exports = moduleLogic;

})