function ModuleLogic(view, submit) {
	var that = this;
	this.init = function () {
		view.addEvent();
	};
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
					"clearConfig": "false"
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


function showModuleMsg(text, showTime) {
	var msgBox = $('#form-massage'),
		time;
	msgBox.html(text).fadeIn(300);

	//0 表示不消失
	if (showTime != 0) {
		time = showTime || 2000;
		setTimeout(function () {
			msgBox.fadeOut(700);
		}, time);
	}
}

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
				progressLogic.init("", "upgrade");
			} else if (num == "201") {
				showModuleMsg(_("Firmware error!") + " " + _("The extender will reboot."));
				setTimeout(function () {
					progressLogic.init("", "reboot", 200);
				}, 2500);
			} else if (num == "202") {
				showModuleMsg(_("Upgrade failed!") + " " + _("The extender will reboot."));
				setTimeout(function () {
					progressLogic.init("", "reboot", 200);
				}, 2500);
			} else if (num == "203") {
				showModuleMsg(_("Firmware size is too large!") + " " + _("The extender will reboot."));
				setTimeout(function () {
					progressLogic.init("", "reboot", 200);
				}, 2500);
			}
		})

	}

	$("#upgradeFile").blur();
}

moduleView.addEvent = function () { //添加事件
	$("#upgradeFile").on("change", goUpgrade);
}

function ProgressLogic() {
	var that = this;
	var pc = 0;
	this.type = null;
	this.time = null;
	this.upgradeTime = null;
	this.rebootTime = null;
	var ip;
	this.init = function (str, type, rebootTime, hostip) {
		ip = hostip || "";
		$("#progress-dialog").css("display", "block");
		$("#progress-overlay").addClass("in");
		this.type = type;
		this.time = rebootTime || 200;
		var rebootMsg = str || _("Rebooting...Please wait...");
		$("#rebootWrap").find("p:eq(0)").html(rebootMsg);
		if (type != "upgrade") {
			$("#upgradeWrap").addClass("none");
			this.reboot();
		} else {
			this.upgrade();
		}

	};
	this.reboot = function () {
		that.rebootTime = setTimeout(function () {
			that.reboot();
			pc++;
		}, that.time);
		if (pc > 100) {
			clearTimeout(that.upgradeTime);
			clearTimeout(that.rebootTime);
			/*if (ip) {
				window.location.href = "http://" + ip;
			} else {
				window.location.reload(true);
			}*/
			if (that.type == "upgrade") {
				$("#upgradeWrap").addClass("none");
				$("#rebootWrap").addClass("none");
				$("#upgradeSuccessWrap").removeClass("none");
			} else {
				window.location.href = "http://mybtdevice.home";
			}

			return;
		}
		$("#rebootWrap").find(".progress-bar").css("width", pc + "%");
		$("#rebootWrap").find("span").html(pc + "%");
	};
	this.upgrade = function () {
		that.upgradeTime = setTimeout(function () {
			that.upgrade();
			pc++;
		}, 200);
		if (pc > 100) {
			clearTimeout(that.upgradeTime);
			pc = 0;
			that.reboot();
			return;
		}
		$("#upgradeWrap").find(".progress-bar").css("width", pc + "%");
		$("#upgradeWrap").find("span").html(pc + "%");
	}
}
window.onload = function () {
	var moduleLogic = new ModuleLogic(moduleView, moduleSubmit);

	moduleLogic.init();
	var progressLogic = new ProgressLogic();
	window.progressLogic = progressLogic;
}