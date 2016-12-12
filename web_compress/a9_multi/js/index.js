function MainLogic() {
	var that = this;
	this.init = function () {
		$("body").addClass("index-body");
		this.initEvent();
		that.changeMenu("status", "Status");
		this.initModuleHeight();
	};

	function changeLocation() {
		if ($(this).hasClass("weibo")) {
			$(this).attr("href", "http://weibo.com/100tenda");
		} else if ($(this).hasClass("weixin")) {
			$("#weixinWrap").show();
			$(this).attr("href", "javascript:void(0)");
		} else if ($(this).hasClass("facebox")) {
			$(this).attr("href", "https://www.facebook.com/tendatechnology");
		} else if ($(this).hasClass("twitter")) {
			$(this).attr("href", "https://twitter.com/tendasz1999");
		}
	}


	this.initEvent = function () {
		var clickTag = "click";
		$("#nav-menu").delegate("li", "click", function () {
			var targetMenu = this.children[0].id || "status";
			var menuTitle = $.trim($(this).text());
			that.changeMenu(targetMenu, menuTitle);
		});

		if (window.ontouchstart) { //当某些手机浏览器不支持click事件
			clickTag = "touch";
		}
		$(document).delegate("*", "click", function (e) {
			var target = e.target || e.srcElement,
				clickSetLang;
			if ($(target.parentNode).hasClass('addLang') || $(target.parentNode).attr('id') === "navbar-button") {
				target = target.parentNode;
			}
			if ($(target).attr('id') != "navbar-button") {
				if ($(target).attr('id') != "nav-menu") {
					if (!$(".navbar-toggle").hasClass("none") && $("#nav-menu").hasClass("nav-menu-push")) {
						$("#nav-menu").removeClass("nav-menu-push");
					}
				}
			}


			if ($(target).hasClass("addLang")) {
				clickSetLang = true;
			}

			if (clickSetLang) {
				//$("#selectLang .dropdown-menu").show();
			} else {
				$("#selectLang .dropdown-menu").hide();
			}

		});

		//$("#nav-footer-icon").delegate(".nav-icon", "mouseover", changeLocation);

		$(window).resize(this.initModuleHeight);

		$('#submit').on('click', function () {
			that.modules.validate.checkAll();
		});

		$("#navbar-button").on("click", function () {
			if (!$("#nav-menu").hasClass("nav-menu-push")) {
				$("#nav-menu").addClass("nav-menu-push");
			} else {
				$("#nav-menu").removeClass("nav-menu-push");
			}
		});

		//Cancel
		$('#cancel').on('click', function () {
			that.modules.reCancel();
		});

		$("#loginout").on("click", function () {
			$.post("goform/loginOut", "action=loginout", function () {
				window.location.reload(true);
			});
		});
		that.getValue();
	};

	this.getValue = function () {
		$.GetSetData.setData("goform/getStatus", $.extend({
			random: Math.random()
		}, {
			module1: "sysStatusInfo"
		}), function (obj) {
			var jsonObj = $.parseJSON(obj);
			if (jsonObj.sysStatusInfo.hasLoginPwd === "true") {
				$("#loginout").show();
			} else {
				$("#loginout").hide();
			}
		});
	};
	this.createMenu = function () {

	};
	this.changeMenu = function (id, title) {
		var nextUrl = id,
			mainHtml;
		$("#iframe").addClass("none");
		$("#iframe").load("./" + nextUrl + ".html", function () {
			if ($("#iframe").find("meta").length > 0) {
				top.location.reload(true);
				return;
			}

			document.title = "BT Wi-Fi Extender – " + title;

			if (id == "status" || id == "help") {
				$("#submit").addClass("none");
				$("#cancel").addClass("none");
			} else {
				$("#submit").removeClass("none");
				$("#cancel").removeClass("none");
			}
			seajs.use("./js/" + nextUrl, function (modules) { //加载模块所需函数
				//翻译
				B.translatePage();
				$("#iframe").removeClass("none");
				modules.init(); //模块初始化
				if (that.modules && that.modules != modules) { //判断前一个模块是否是当前模块
					//模块切换之后，修改模块运行标志
					that.modules.pageRunning = false;
					$.validate.utils.errorNum = 0; //切换页面时清空数据验证错误
				}

				that.modules = modules; //保留当前运行模块
				if (that.modules.validate) {
					that.modules.validate.init();
				}
				that.initModuleHeight();
			});
		});
		$("#nav-menu").removeClass("nav-menu-push");
		$("li>.active").removeClass("active");
		$("#" + id).addClass("active");

	};
	this.initModuleHeight = function () {
		var viewHeight = $.viewportHeight(),
			menuHeight = $("#sub-menu").height(),
			mainHeight = $("#iframe").height(),
			height,
			minHeight;
		minHeight = Math.max(menuHeight, mainHeight);
		if (minHeight < (viewHeight - 130)) {
			$("#nav-menu").css('min-height', minHeight + "px");
			$("#main-content").css('min-height', minHeight + "px");
		} else {
			$("#nav-menu").css('min-height', minHeight + 40 + "px");
			$("#main-content").css('min-height', minHeight + 50 + "px");
		}

		height = mainHeight;
		if (height >= viewHeight - 130) {
			height = height - 130;
		} else {
			height = viewHeight - 130;
		}

		if (minHeight > height) {
			height = minHeight;
		}

		$("#nav-menu").css('height', height + 40 + "px");
		$("#main-content").css('height', height + 30 + "px");
	};

	this.showModuleMsg = function (text, showTime) {
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

$(function () {
	var pageLogic = new MainLogic();
	window.pageLogic = pageLogic;
	pageLogic.init();
	var progressLogic = new ProgressLogic();
	window.progressLogic = progressLogic;
});