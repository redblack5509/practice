var G = {
        menuChanging: false,
        iframeFlag: false,
        initPage: false,
        initYunFlag: false
    },
    mainPageLogic, staInfo, netInfo, advInfo, wrlInfo, sysInfo,
    firstIn = false;
//数据本身有indexOf方法，但IE8文档模式不支持
Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};


function PageModel(url, subUrl) {
    // 获取数据的方式
    this.method = 'ajax';
    this.getUrl = url;
    this.subUrl = subUrl;

    // 获取数据
    this.pGet = function (successCallback, errorCallback) {
        $.ajax({
            url: this.getUrl,
            cache: false,
            type: "GET",
            success: successCallback,
            error: errorCallback
        });
    };

    // 提交数据
    this.pSubmit = function (obj) {
        $.ajax({
            url: obj.url,
            type: "POST",
            data: obj.data,
            success: obj.callback
            //error: errorCallback
        });
    };
}

function PageView(modules) {
    this.modules = modules;

    // 初始化 页面视图
    this.init = function () {
        var len = this.module.length,
            i;

        // 循环初始各模块
        for (i = 0; i < len; i++) {
            this.module[i].initView();
            this.module[i].initControl();
        }
    };


    //获取页面元素数据
    //==========================================================================
    // 以元素 ID 来获取提交的值
    this.getVal = function (id) {
        return $('#' + id).val();
    };

    // 获取页面要提交的值， 有值返回对象，无这返回 null
    this.getSubmitData = function (data) {
        var ret = null;
        ret = data;
        return ret;
    };


    //页面元素显示相关
    //==========================================================================

    // 初始化页面最小高度
    this.initPageMiniHeight = function () {
        $('.main-section').css('min-height', ($.viewportHeight() - 20) + 'px');
        // $('#internet-form').css('min-height', '800px');


        // IE 6 not support min-height
        // In IE 6 height the same as min-height
        if (typeof isIE6 !== "undefined") {
            $('.main-section, .nav').css('height', ($.viewportHeight() - 20) + 'px');
        }

    };

    // 总体数据验证错误时处理入口
    this.showInvalidError = function (msg) {
        $('#page-message').html(msg || ' ');
        return;
    };

    // 数据提交成功时处理入口
    this.showSuccessful = function (msg) {
        $('#page-message').html(msg);
        location.reload();
    };

    // 数据 提交失败时处理入口
    this.showError = function (msg) {
        $('#page-message').html(msg);
    };

    // 获取数据 失败时处理入口
    this.showGetError = function (msg) {
        $('#page-message').html(msg);
    };

    this.showChangeMenu = function ($active, targetTop, callBack) {
        $active.stop().animate({
            "top": targetTop
        }, 1000, "easeInOutExpo", callBack);
    };

    this.showChangePage = function ($active, hei, callBack) {
        $active.stop().animate({
            "margin-top": hei
        }, 1000, "easeInOutExpo", callBack);
    };

    this.scrollTo = function ($active, targetMarginTop, callBack) {
        $active.stop().animate({
            "margin-top": targetMarginTop
        }, 100, "easeInOutExpo", callBack);
    };

    this.showScrollEnd = function ($cur, hei, callBack) {
        $cur.animate({
            "margin-top": hei
        }, 300).animate({
            "margin-top": 0
        }, 300, callBack);
    }

    //页面元素事件事件监听
    //==========================================================================

    // 导航事件监听
    this.addNavHandler = function (callBack) {
        $('#main-nav a').on('click', function (e) {
            e.preventDefault();
        });

        $('#main-nav a').on('click.menu', callBack);
    };

    // 给提交按钮添加，回调函数
    this.addSubmitHandler = function (callBack) {
        $('#subBtn').on('click', function (e) {
            e.preventDefault();
            callBack.apply();
        });
    };

    //语言选择
    $(".lang-toggle").on("click", function () {
        if ($(this).next().hasClass("none")) {
            $(this).next().removeClass("none")
        } else {
            $(this).next().addClass("none")
        }
    });
    $(".lang-menu a").on("click", function () {
        $(this).parents(".lang-toggle span").html($(this).html());
        $(this).parents(".lang-menu").addClass("none")
        B.setLang($(this).attr("data-country"));
        setTimeout("location.reload()", 300);
    })
    $(document).on("click", function (e) {
        if ($(e.target).parents(".lang-set").length == 0)
            $(".lang-menu ").addClass("none")
    });

}

function PageLogic(pageView, pageModel) {

    this.modelObj = "";
    // 给页面添加全局数据验证
    this.validate = $.validate({
        custom: function () {
            var returnVal;
            if (window[mainPageLogic.modelObj].checkValidate) {
                returnVal = window[mainPageLogic.modelObj].checkValidate(); //模块数据验证
            }

            if (returnVal != true) {
                return returnVal;
            }
        },

        success: function () {
            //var data = pageView.getSubmitData();
            var subObj = window[mainPageLogic.modelObj].preSubmit(); //数据提交
            if (subObj) {
                pageModel.pSubmit(subObj);
            }
        },

        error: function (msg) {
            pageView.showInvalidError(msg);
        }
    });

    this.initModule = function (id) {
        var menus = {
            "system-status": 'staInfo',
            "internet-setting": 'netInfo',
            "wireless-setting": "wrlInfo",
            "guest-setting": "guestInfo",
            "power-setting": "powerInfo",
            "usb-setting": "usbInfo",
            "vpn-setting": "vpnInfo",
            "advance": "advInfo",
            "system": "sysInfo"
        };
        mainPageLogic.modelObj = menus[id];
        //清空错误信息
        $(".validatebox-invalid").each(function () {
            this['data-check-error'] = false;
            $(this).removeClass("validatebox-invalid");
        });
        //$(".validatebox-invalid").removeClass("validatebox-invalid");
        $(".validatebox-tip").parent().remove();
        $.validate.utils.errorNum = 0;
        $.validateTipId = 0;

        window[menus[id]].init();
        G.initPage = true;

        //点击菜单。检查是否要跳到登录页面(检查开销比较小的定时重启接口，看是否返回登录页面)
        $.get("goform/GetSysAutoRebbotCfg?" + Math.random(), function callback(str) {
            if (str.indexOf("<!DOCTYPE") != -1) {
                location.reload(true);
            }
        });
    }

    this.changeMenu = function (curId, targetId) {

        // 如果在同一菜单, 直接放回不做其他操作
        if (curId === targetId) {
            return;
        }

        var menus = ["system-status", "internet-setting", "wireless-setting", "guest-setting", "power-setting", "usb-setting", "vpn-setting", "advance", "system", "other"],
            $cur = $('#' + curId),
            $target = $('#' + targetId),
            curHeight = $cur.height(),
            targetPageTop, targetMenuTop;

        G.menuChanging = true;
        $(".lang-menu ").addClass("none");
        if (CONFIG_USB_MODULES == "n") {
            menus.remove("usb-setting");
        }

        // 初始化模块
        this.initModule(targetId);

        // 向 上 切换页面
        if (menus.indexOf(curId) > menus.indexOf(targetId)) {
            $target.addClass('active');
            $target.css('margin-top', '-' + $target.height() + 'px');

            targetPageTop = 0;

            // 向 下 却换页面
        } else if (menus.indexOf(curId) < menus.indexOf(targetId)) {
            $target.addClass('active');
            $target.css('margin-top', '0px');
            targetPageTop = -curHeight;
            $target = $cur;
        }

        // 却换页面内容动画
        pageView.showChangePage($target, targetPageTop, function () {
            G.menuChanging = false;
            $cur.removeClass('active');
        });

        // 却换左边菜单样式或动画
        targetMenuTop = $("#main-nav a").eq(menus.indexOf(targetId)).offset().top + 13;

        pageView.showChangeMenu($("#main-nav-label"), targetMenuTop, function () {
            $('#main-nav li').eq(menus.indexOf(curId)).removeClass('active');
            $('#main-nav li').eq(menus.indexOf(targetId)).addClass('active');
        });
        //window.location.hash = "#-" + targetId;
    };

    this.scorllPageUptoEndNum = 0;
    this.scorllPageDowntoEndNum = 0;
    this.scorllPage = function ($active, dir, targetId) {
        var viewHeight = $.viewportHeight(),
            curMarginTop = parseInt($active.css('margin-top'), 10),
            curHeight = $active.height(),
            difHeight = curHeight - viewHeight,
            targetMarginTop;

        if ((curMarginTop === 0 && dir === 'up') ||
            (dir === 'down' && curMarginTop === -difHeight)) {

            if (this.scorllPageUptoEndNum < 2 && this.scorllPageDowntoEndNum < 2) {
                if (curMarginTop === 0 && dir === 'up') {
                    this.scorllPageUptoEndNum += 1;
                    this.scorllPageDowntoEndNum = 0;
                } else if (dir === 'down' && curMarginTop === -difHeight) {
                    this.scorllPageUptoEndNum = 0;
                    this.scorllPageDowntoEndNum += 1;
                }
            } else {
                this.scorllPageUptoEndNum = 0;
                this.scorllPageDowntoEndNum = 0;
                this.changeMenu($active.attr('id'), targetId);
            }
            return;
        }

        if (dir === 'down') {
            targetMarginTop = curMarginTop - 120;
            targetMarginTop = (difHeight + targetMarginTop) > 0 ?
                targetMarginTop : -difHeight;

        } else if (dir === 'up') {
            targetMarginTop = curMarginTop + 120;

            targetMarginTop = targetMarginTop > 0 ?
                0 : targetMarginTop;
        }

        G.menuChanging = true;
        pageView.scrollTo($active, targetMarginTop, function () {
            G.menuChanging = false;
        });
    }

    // 实现最顶端或最底端回弹效果
    this.scorllEnd = function ($active, dir) {
        G.menuChanging = true;

        if (dir === 'down') {
            pageView.showScrollEnd($active, '-15%', function () {
                G.menuChanging = false;
            });
        } else if (dir === 'up') {
            pageView.showScrollEnd($active, '15%', function () {
                G.menuChanging = false;
            });
        }
    }

    this.onMenuClick = function (e) {
        var curId = $(".nav-list.active a")[0].href.split('#')[1],
            targetId = e.target.href.split('#')[1];

        if (curId == targetId) {
            this.initModule(targetId);
            return;
        }
        if (!G.menuChanging) {
            $(".nav-list.active").removeClass('active');
            $(e.target).parent().addClass('active');

            this.changeMenu(curId, targetId);
        }
    }

    this.onMousewheel = function (e, delta) {

        // 如果菜单切换中，不响应滚轮事件
        if (G.menuChanging) {
            return;
        }
        var dir = delta > 0 ? 'up' : 'down',
            wheelSpeed = Math.abs(delta),
            $curMenu = $(".nav-list.active"),
            curId = $curMenu.find('a')[0].href.split('#')[1],
            viewHeight = $.viewportHeight(),
            $cur = $('#' + curId),
            curHeight = $cur.height(),
            isScrollEnd = false,
            $targetMenu, targetId;

        // 滚轮向 上 滚
        if (delta > 0 && curId !== 'system-status') {
            $targetMenu = $curMenu.prev();

            // 滚轮向 下 滚
        } else if (delta < 0 && curId !== 'system') {
            $targetMenu = $curMenu.next();

            // 第一页且向上滚 或 最后一页且向下滚
        } else {
            $targetMenu = $curMenu;
            isScrollEnd = true;
        }
        targetId = $targetMenu.find('a')[0].href.split('#')[1];

        // 如果视窗高度 大于 当前页面高度，则执行页面却换
        if (viewHeight >= curHeight) {

            // 如果能有页面可以切换
            if (!isScrollEnd) {
                this.changeMenu(curId, targetId);
            }

            // 如果本页面还有内容没显示，则执行页面滚动
        } else {
            this.scorllPage($cur, dir, targetId);
        }
        // 如果滚动到尽头
        if (isScrollEnd) {
            this.scorllEnd($cur, dir);
        }
    }

    // 初始化页面
    this.init = function () {
        var that = this;

        // 先执行数据的获取，获取成功后执行 页面视图的初始化
        //pageModel.pGet(pageView.init, pageView.showGetError);

        if (!G.initPage) {
            var curId = "system-status";
            //var hashId = window.location.hash.replace("#-","");
            var hashId = "system-status";

            if ($("a[href=#" + hashId + "]").length != 0) {
                curId = hashId;
            }

            $("#main-nav li, .main-section").removeClass("active");
            $("a[href=#" + curId + "]").parents("li").addClass("active");
            $("#" + curId).addClass("active").css("margin-top", "0");
            /*setTimeout(function() {
                $("#main-nav-label").css("top",$("a[href=#"+curId+"]").offset().top + 13 + "px");
            },100);*/
            $("#main-nav-label").css("top", 73 + "px");


            this.initModule(curId);
            G.initPage = true;
        }

        pageView.addSubmitHandler(function (e) {
            that.validate.checkAll();
        });

        pageView.addNavHandler(function (e) {
            that.onMenuClick(e);
        });

        pageView.initPageMiniHeight();

        $("body").on('mousewheel', function (e, delta) {

            /*if (!G.iframeFlag) {
                that.onMousewheel(e, delta);
            }*/
            if ($("#gbx_overlay").length == 0 || $("#gbx_overlay").is(":hidden")) {
                that.onMousewheel(e, delta);
            }
        });

        $(window).resize(function () {
            pageView.initPageMiniHeight();
            initIframeHeight();
        });

        $(".iframe-close").off("click").on("click", closeIframe);
        closeIframe();
    };
}

$(function () {
    var getUrl = 'index.html',
        subUrl = 'subtest',
        mainPageModel = new PageModel(getUrl, subUrl),
        mainPageView = new PageView();

    mainPageLogic = new PageLogic(mainPageView, mainPageModel);
    mainPageLogic.init();
    //loginOut();

    //获取产品型号，显示或隐藏功能
    $.getJSON("goform/getProduct" + "?" + Math.random(), function (obj) {
        if (obj.product == "f1203") {
            //F1203没有wifi信号增强功能
            $("#adv_power").addClass("none");
        } else {
            $("#adv_power").removeClass("none");
        }
    });

    //通过宏控制是否有USB模块（值为“y”表示有）,有的话显示USB相关配置
    if (CONFIG_USB_MODULES == "y") {
        $("#nav-usb, .usb-line, .status-usb").removeClass("none");

        var modulesObj = {
                "usb_samba": CONFIG_FILE_SHARE,
                "usb_dlna": CONFIG_DLNA_SERVER,
                "usb_printer": CONFIG_PRINTER_SERVER
            },
            prop;

        for (prop in modulesObj) {
            if (modulesObj[prop] == "y") {
                $("#" + prop).removeClass("none");
            }
        }
        //有USB功能时，提示语会加上USB
        $("#power_usb_notice").html(_("If sleeping mode is enabled, the router will work in a power saving state. LEDs, WiFi and USB flash drive will be in a sleeping state."));
    } else {

        $("#nav-usb").remove();
    }

    var langTxt = {
        "cn": "中文",
        "en": "English",
        "zh": "繁體中文"
    };
    // $(".lang-toggle span").html(langTxt[B.getLang()]);

    if (top != window) {
        top.location.reload(true);
    }
});

var G_colors = ['#f37239', '#f5ac3b', '#b2d33f', '#3da64b', '#5dcdde', '#0388c0', '#783594', '#b93e98',
    '#f7a37e', '#f8c97f', '#cde282', '#81c58a', '#96deea', '#5bb2d6', '#a77cb9', '#d181bc',
    '#fac7b0', '#fbdeb1', '#e0edb2', '#b1dbb7', '#beebf2', '#9acfe6', '#c9aed4', '#e3b2d6',
    '#fde3d7', '#fdeed8', '#f0f6d9', '#d8eddb', '#dff5f8', '#cde7f2', '#e4d7ea', '#f1d8ea'
];

//网络状态，外网设置要用到的联网状态
var statusTxtObj = {
    /*
    第一位传给页面判断是否有断开操作(1,可断开2没有断开)
    第二位传给页面显示颜色(1表示错误颜色、2表示尝试颜色、3表示成功颜色)
    第三位是否连接上(0表示未连上， 1表示连上)既是否显示联网时长
    第四位表示工作模式(0表示AP,1表示WISP,2表示APClient)
    第五位表示WAN口类型(0表示DHCP,1表示static IP,2表示PPPOE)
    第六位和第七位表示错误代码编号
    */
    /***********AP*********/
    //DHCP
    "1": _("Please ensure that the cable between the router's Internet port and the modem is properly connected."),
    "2": _("Disconnected"),
    "3": _("Connecting..."), //(之前在1203里面这个状态表示保存了数据但是没有连接上去的情况下提示的，保留之前的)"
    "4": _("Connected…Accessing the Internet…"),
    "5": _("Disconneted. Please contact your ISP!"),
    "6": _("Connected…Accessing the Internet…"),
    "7": _("Connected! You can surf the Internet."),
    //静态：
    "101": _("Please ensure that the cable between the router's Internet port and the modem is properly connected."),
    "102": _("Disconnected"),
    "103": _("Connecting…Detecting the Internet…"), //(之前在1203里面这个状态表示保存了数据但是没有连接上去的情况下提示的，保留之前的)"
    "104": _("Connected…Accessing the Internet…"),
    "105": _("Disconneted. Please contact your ISP!"),
    "106": _("Connected…Accessing the Internet…"),
    "107": _("Connected! You can surf the Internet."),
    //PPPOE
    "201": _("Please ensure that the cable between the router's Internet port and the modem is properly connected."),
    "202": _("Disconnected"),
    "203": _("Checking your User name and Password. Please wait..."),
    "204": _("Dial-up Successfully!"),
    "205": _("Fail to check the username and password."),
    "206": _("No response from the remote server. Please check whether you can access the Internet using your Modem, if the problem persists, contact your local Internet Service Provider for help."),
    "207": _("Disconneted. Please contact your ISP!"),
    "208": _("Connecting..."),
    "209": _("Connected! You can surf the Internet."),
    /************WISP**************/
    //DHCP 
    "1001": _("No bridge yet in WISP mode."),
    "1002": _("No bridge yet in WISP mode."),
    "1003": _("Bridging in WISP mode…"),
    "1004": _("Bridged successfully in WISP mode. Trying accessing the Internet…"),
    "1005": _("Disconneted. Please contact your ISP!"),
    "1006": _("Bridged successfully in WISP mode. Trying accessing the Internet…"),
    "1007": _("Connected! You can surf the Internet."),
    //静态 
    "1101": _("No bridge yet in WISP mode."),
    "1102": _("No bridge yet in WISP mode."),
    "1103": _("Bridging in WISP mode…"),
    "1104": _("Bridged successfully in WISP mode. Trying accessing the Internet…"),
    "1105": _("Disconneted. Please contact your ISP!"),
    "1106": _("Bridged successfully in WISP mode. Trying accessing the Internet…"),
    "1107": _("Connected! You can surf the Internet."),
    //APClinet
    "2001": _("No bridge yet in Universal Repeater mode."),
    "2002": _("Bridging in Universal Repeater mode…"),
    "2003": _("Bridged successfully in Universal Repeater mode.")
};

staInfo = {
    mouseOver: false,
    loading: false,
    checkBand: false,
    initObj: {},
    statusObj: null,
    hasusb: "0",
    time: "",
    init: function () {
        if (!staInfo.loading) {

            /*$("#upgradeNow").on("click", function () {
                showIframe(_("Firmware Upgrade"), "directupgrade.html", 665, 556);
                clearTimeout(staInfo.time);
            });

            $("#notNow").on("click", function () {
                $.GetSetData.setData("goform/notNowUpgrade", {
                    notNow: true
                }, function () {
                    $('#directupgrade').addClass("none");
                });
            });*/

            $("#blackList").on("click", function () {
                showIframe(_("Blacklist(%s)", [staInfo.statusObj.blackNum]), "black_list.html", 570, 490);
            });

            $("#onlineList").on("click", function () {
                showIframe(_("Attached Devices (%s)", [staInfo.statusObj.clientNum]), "online_list.html", 800, 490);
            });


            $("#status_wl_more").on("click", function () {
                showIframe(_("Wireless Settings"), "wireless_ssid.html", 610, 490);
            });

            $("#status_wan_more").on("click", function () {
                if (staInfo.statusObj.wanStatus.charAt(3) != 2) //非apclient
                    showIframe(_("Internet Settings"), "net_set.html", 620, 450);
            });

            $("#wanStatusTxtWrap").on("click", function () {
                var wanStatus = $("#wanStatus").val();
                staInfo.showWanStatusPicIframe(parseInt(wanStatus.charAt(1)) - 1);
            });

            $(".usb").on("click", function () {
                if (staInfo.hasusb !== "0") {
                    showIframe(_("File Share"), "samba.html", 620, 450);
                }
            });

            $(".status-router").on("click", function () {
                showIframe(_("System Status"), "system_status.html", 530, 490);
            });

            //处理错误吗后几位为206的过长的状态信息
            $("#wanStatusTxtWrap").on("mouseenter", ".wan-status-detail-btn", function () {
                $(this).next().stop().fadeIn(200);
            }).on("mouseleave", ".wan-status-detail-btn", function () {
                $(this).next().stop().fadeOut(200);
            });


            var Msg = location.search.substring(1) || "0";
            if (Msg == 1) {
                mainPageLogic.changeMenu("system-status", "advance");
                return;
            }

            staInfo.loading = true;
        }
        staInfo.initValue();
    },

    showWanStatusPicIframe: function (wanStatus) {
        /*switch (parseInt(wanStatus)) {
            case 0:
                showIframe(_("There is no Ethernet cable on the Internet port."), "wan_status.html", 610, 450, "wanStatus="+wanStatus);
                break;
        }*/
    },

    initValue: function () {
        if (mainPageLogic.modelObj == "staInfo") {
            clearTimeout(staInfo.time);
            staInfo.time = setTimeout("staInfo.initValue()", 2000);
        } else {
            clearTimeout(staInfo.time);
            return;
        }

        $.GetSetData.getJson("goform/GetRouterStatus", staInfo.setImage);
        if (CONFIG_USB_MODULES == "y") {
            $.GetSetData.getJson("goform/GetUSBStatus", staInfo.setUSB);
        }
    },
    /*弹出页面后，取消循环取数据 ztt*/
    cancelValue: function () {
        mainPageLogic.modelObj = "";
    },

    setUSB: function (obj) {
        staInfo.hasusb = obj.hasusb;
        if (obj.hasusb === "0") {
            $('.usb-line').css("background", "url(../img/usb_line_gray.png)");
            $('.usb').css("background", "url(../img/usb_gray.png)");
            $('#status_usb_txt').removeClass("none");
            $('.status-usb').css("cursor", "default");
            $('.usb').css("cursor", "default");
        } else {
            $('.usb-line').css("background", "url(../img/usb_line.png)");
            $('.usb').css("background", "url(../img/usb.png)");
            $('#status_usb_txt').addClass("none");
            $('.status-usb').css("cursor", "default");
            $('.usb').css("cursor", "pointer");
        }
    },

    setImage: function (obj) {
        var selectedOffset = 0,
            speed_unit,
            option = {},
            data = [];

        $(".row").removeClass("hidden");
        //data.push(["other",parseFloat(obj[len-1].surBandwidth)])
        //$("#deviceName").html(obj[len-1].deviceName);

        /*if (obj.onlineUpgradeInfo.newVersionExist === "1") {
            $("#directupgrade").removeClass("none");
            $("#directupgrade span").html(_("The latest firmwarte version is %s as detected, Update now?", [obj.onlineUpgradeInfo.newVersion]));
        }*/

        if (obj.wanStatus.charAt(1) == "3") { //已连接
            $(".status-wrap").addClass("internet-line-up").removeClass("internet-line-disable").removeClass("internet-line-connectting");
        } else if (obj.wanStatus.charAt(1) == "1") {
            $(".status-wrap").addClass("internet-line-disable").removeClass("internet-line-up").removeClass("internet-line-connectting");
        } else {
            $(".status-wrap").addClass("internet-line-connectting").removeClass("internet-line-up").removeClass("internet-line-disable");
        }

        if (obj.wanStatus.substr(obj.wanStatus.length - 4).charAt(0) == "2") {
            $("#deviceListWrap").addClass("none");
        } else {
            $("#deviceListWrap").removeClass("none");
            $("#clientNum").html(obj.clientNum);
            $("#blackNum").html(obj.blackNum);
        }


        if (!staInfo.statusObj || staInfo.statusObj.wanStatus != obj.wanStatus)
            staInfo.setWanStatus(obj);
        staInfo.setWlStatus(obj);
        //staInfo.setLineUp(obj);
        staInfo.statusObj = obj;
    },

    setLineUp: function (obj) {
        var lineupArr = obj.lineup.split("|");

        $.each(lineupArr, function (i, val) {
            if (val == "1") {
                $("#status-lineup-wrap li").eq(i).addClass("lineup");
            } else {
                $("#status-lineup-wrap li").eq(i).removeClass("lineup");
            }
        })
    },

    setWanStatus: function (obj) {

        $("#wanStatus").val(obj.wanStatus);

        //联网状态
        var statusTxt = "";
        if (parseInt(obj["wanStatus"].substr(obj["wanStatus"].length - 4), 10) + "" == "206") {
            statusTxt = _("No response from the remote server.") + "<a class='wan-status-detail-btn'>" + _("details ") + "</a><span class='wan-status-detail none'><div>" + _("Please check whether you can access the Internet using your Modem, if the problem persists, contact your local Internet Service Provider for help.") + "</div></span>";

        } else {
            statusTxt = statusTxtObj[parseInt(obj["wanStatus"].substr(obj["wanStatus"].length - 4), 10) + ""];
        }
        $("#status_wan_txt").html(statusTxt);

        var statusType = parseInt(obj["wanStatus"].charAt(1), 10),
            statusClasses = ["text-error", "text-warning", "text-success"];
        $("#status_wan_txt").attr("class", statusClasses[statusType - 1]);
    },

    setWlStatus: function (obj) {
        var secTxtArr = [_("None"), _("Encrypted")];
        $(".status-wl-info").removeClass("none");
        if (obj.wl24gEn == "1") {
            $("#status_wl_info_txt .wl24g-name").html(obj.wl24gName.replace(/[\s]/g, "&nbsp;")).attr("title", obj.wl24gName);
            //$("#status_wl_info_txt .wl24g-sec").html(secTxtArr[parseInt(obj.wl24gsec, 10)]);
            //$("#status_wl_info_txt .wl24g-sec").removeClass("none");
        } else {
            //$("#status_wl_info_txt .wl24g-sec").addClass("none");
            $("#status_wl_info_txt .wl24g-name").html(_("Disabled"));
        }

        if (obj.wl5gEn == "1") {
            $("#status_wl_info_txt .wl5g-name").html(obj.wl5gName.replace(/[\s]/g, "&nbsp;")).attr("title", obj.wl5gName);
            //$("#status_wl_info_txt .wl5g-sec").html(secTxtArr[parseInt(obj.wl5gsec, 10)]);
            //$("#status_wl_info_txt .wl5g-sec").removeClass("none");
        } else {
            //$("#status_wl_info_txt .wl5g-sec").addClass("none");
            $("#status_wl_info_txt .wl5g-name").html(_("Disabled"));
        }

        if (obj.wl5gEn == "0" && obj.wl24gEn == "0") {
            //$(".status-wl-info").addClass("none");
            $("#status_wl_more").addClass("wireless-line-disable").removeClass("wireless-line-up");
        } else {
            //$(".status-wl-info").removeClass("none");
            $("#status_wl_more").removeClass("wireless-line-disable").addClass("wireless-line-up");
        }
    }
}

function wanTypeSelect(wan_type) {
    /*    if(wan_type === netInfo.currentWanType) {
            $('#dns1').val(netInfo.dns1);
            $('#dns2').val(netInfo.dns2);
        } else {
            $('#dns1').val("");
            $('#dns2').val("");
        }*/
    //pptp客户端开启
    if (netInfo.clientFlag === "1") {
        if ((wan_type === "3") || (wan_type === "4")) {
            $(".select-tab").html(_("Changing the settings will disable VPN feature."));
        } else {
            $(".select-tab").html("");
        }
    } else {
        $(".select-tab").html("");
    }

    switch (parseInt(wan_type)) {
    case 0:
        {
            $("#ppoe_set").addClass("none");
            $("#double_access").addClass("none");
            $("#dnsType").removeClass("none");
            $("#static_ip").addClass("none");
            if (netInfo.currentWanType === "0") {
                if (netInfo.currentDnsType === "1") {
                    $("#dnsContainer").addClass("none");
                } else {
                    $("#dnsContainer").removeClass("none");
                }
            } else {
                $('#dnsAuto').val("1");
                $("#dnsContainer").addClass("none");
            }

            break;
        }
    case 1:
        {
            $("#ppoe_set").addClass("none");
            $("#double_access").addClass("none");
            $("#dnsType").addClass("none");
            $("#static_ip").removeClass("none");
            $("#dnsContainer").removeClass("none");

            break;
        }
    case 2:
        $("#ppoe_set").removeClass("none");
        $("#double_access").addClass("none");
        $("#dnsType").removeClass("none");
        $("#static_ip").addClass("none");
        if (netInfo.currentWanType === "2") {
            if (netInfo.currentDnsType === "1") {
                $("#dnsContainer").addClass("none");
            } else {
                $("#dnsContainer").removeClass("none");
            }
        } else {
            $('#dnsAuto').val("1");
            $("#dnsContainer").addClass("none");
        }
        break;
    case 3:
        {
            $("#ppoe_set").addClass("none");
            $("#double_access").removeClass("none");
            $("#double_access #serverInfo").removeClass("none");

            if (netInfo.currentWanType === "3") {
                if (netInfo.currentVpnType === "1") {
                    $('[name="vpnWanType"]:eq(0)').prop("checked", true);
                    $("#dnsType").removeClass("none");
                    $("#static_ip").addClass("none");
                    if (netInfo.currentDnsType === "1") {
                        $('#dnsAuto').val("1");
                        $("#dnsContainer").addClass("none");
                    } else {
                        $('#dnsAuto').val("0");
                        $("#dnsContainer").removeClass("none");
                    }
                } else {
                    $('[name="vpnWanType"]:eq(1)').prop("checked", true);
                    $("#dnsType").addClass("none");
                    $("#static_ip").removeClass("none");
                    $("#dnsContainer").removeClass("none");
                }
            } else {
                $("#dnsType").removeClass("none");
                $('#dnsAuto').val("1");
                $('[name="vpnWanType"]:eq(0)').prop("checked", true);
                $("#static_ip").addClass("none");
                $("#dnsContainer").addClass("none");
            }

            break;
        }
    case 4:
        {
            $("#ppoe_set").addClass("none");
            $("#double_access").removeClass("none");
            $("#double_access #serverInfo").removeClass("none");

            if (netInfo.currentWanType === "4") {
                if (netInfo.currentVpnType === "1") {
                    $('[name="vpnWanType"]:eq(0)').prop("checked", true);
                    $("#dnsType").removeClass("none");
                    $("#static_ip").addClass("none");
                    if (netInfo.currentDnsType === "1") {
                        $('#dnsAuto').val("1");
                        $("#dnsContainer").addClass("none");
                    } else {
                        $('#dnsAuto').val("0");
                        $("#dnsContainer").removeClass("none");
                    }
                } else {
                    $('[name="vpnWanType"]:eq(1)').prop("checked", true);
                    $("#dnsType").addClass("none");
                    $("#static_ip").removeClass("none");
                    $("#dnsContainer").removeClass("none");
                }
            } else {
                $("#dnsType").removeClass("none");
                $('#dnsAuto').val("1");
                $('[name="vpnWanType"]:eq(0)').prop("checked", true);
                $("#static_ip").addClass("none");
                $("#dnsContainer").addClass("none");
            }

            break;
        }
    case 5:
        {
            $("#ppoe_set").removeClass("none");
            $("#double_access").removeClass("none");
            $("#double_access #serverInfo").addClass("none");

            if (netInfo.currentWanType === "5") {
                if (netInfo.currentVpnType === "1") {
                    $('[name="vpnWanType"]:eq(0)').prop("checked", true);
                    $("#dnsType").removeClass("none");
                    $("#static_ip").addClass("none");
                    if (netInfo.currentDnsType === "1") {
                        $('#dnsAuto').val("1");
                        $("#dnsContainer").addClass("none");
                    } else {
                        $('#dnsAuto').val("0");
                        $("#dnsContainer").removeClass("none");
                    }
                } else {
                    $('[name="vpnWanType"]:eq(1)').prop("checked", true);
                    $("#dnsType").addClass("none");
                    $("#static_ip").removeClass("none");
                    $("#dnsContainer").removeClass("none");
                }
            } else {
                $("#dnsType").removeClass("none");
                $('#dnsAuto').val("1");
                $('[name="vpnWanType"]:eq(0)').prop("checked", true);
                $("#static_ip").addClass("none");
                $("#dnsContainer").addClass("none");
            }
            break;
        }
    default:
        break;
    }
}

netInfo = {
    loading: false,
    time: 0,
    isConnect: false, //是否已经连上，即按钮是连接还是断开
    hasConnTime: false, //是否有联网时长
    saveType: "connect", //操作类型，是连接（connect）还是断开（disconnect）
    currentWanType: 0,
    currentDnsType: "1",
    currentVpnType: "1",
    clientFlag: "0",
    ajaxInterval: null,
    initObj: null,
    saving: false, //保存中，连接中或断开中
    init: function () {
        if (!netInfo.loading) {
            $("#netWanType").on("change", netInfo.changeWanType);
            $("[name='vpnWanType']").on("click", netInfo.changeVpnType);
            $('#dnsAuto').on('change', netInfo.changeDnsAuto);

            $("#wan_submit").on("click", function () {
                if (!this.disabled)
                    mainPageLogic.validate.checkAll("internet-form");
            });
            $.validate.valid.ppoe = {
                all: function (str) {
                    var ret = this.specific(str);

                    if (ret) {
                        return ret;
                    }
                },
                specific: function (str) {
                    var ret = str;
                    var rel = /[^\x00-\x80]|[\\~;'&"%\s]/;
                    if (rel.test(str)) {
                        return _("\\ ~ ; ' & \" % and blank space are not allowed.");
                    }
                }
            }
            $("#staticIp,#mask,#gateway,#dns1,#dns2").inputCorrect("ip");
            netInfo.loading = true;
        }

        $("#gateway").attr("data-options", '{"type":"ip","msg":"' + _("Please enter a correct gateway.") + '"}');
        $("#dns1").attr("data-options", '{"type":"ip","msg":"' + _("Please enter a correct preferred DNS Server.") + '"}');
        $("#dns2").attr("data-options", '{"type":"ip","msg":"' + _("Please enter a correct alternate DNS Server.") + '"}');

        $.GetSetData.getJson("goform/getWanParameters?" + Math.random(), function (obj) {
            netInfo.initObj = obj;
            //定时刷新器
            if (!netInfo.ajaxInterval) {
                netInfo.ajaxInterval = new AjaxInterval({
                    url: "goform/getWanParameters",
                    successFun: function (data) {
                        netInfo.setValue(data);
                    },
                    gapTime: 2000
                });
            } else {
                netInfo.ajaxInterval.startUpdate();
            }

            //wisp下没有pppoe拨号
            var wanOptStr = '<option value="0">' + _("DHCP") + '</option><option value="1">' + _("Static IP") + '</option>';
            if (obj.wl_mode !== "wisp") { //wisp 隐藏pppoe选择框
                wanOptStr += '<option value="2">' + _('PPPoE') + '</option>';
                if (obj.country === "RU") {
                    wanOptStr += '<option value="3">' + _("Russia PPTP") + '</option><option value="4">' + _("Russia L2TP") + '</option><option value="5">' + _("Russia PPPoE");
                }
            }

            $("#netWanType").html(wanOptStr);
            $("#netWanType").val(obj.wanType);
            inputValue(obj);
            $('#adslUser').addPlaceholder(_("Enter the user name from your ISP"));
            if (firstIn === false) {
                $('#adslPwd').initPassword(_("Enter the password from your ISP"), false, false);
                firstIn = true;
            }
            $('#vpnPwd').initPassword(_(""), false, false);

            //client+ap 不允许配置外网设置，隐藏配置内容
            if (obj.wl_mode == "apclient") {
                $("#notAllowTip").removeClass("none");
                $("#connectStatusWrap, #connect_time").addClass("none");
                $("#wan_submit, #netWanType").prop("disabled", true);
                return;
            } else {
                $("#notAllowTip").addClass("none");
                if (!netInfo.saving) {
                    $("#wan_submit, #netWanType").prop("disabled", false);
                    $("#dnsAuto, #dns1, #dns2").prop("disabled", false);
                }
            }
            netInfo.setValue(obj);
            netInfo.changeWanType();
        });
    },
    setValue: (function () {
        var statusType = 1, //连接状态类型，1错误， 2尝试，3成功
            isConnect = 1, //是否接上（显示接入时长）0未接上 1接上 
            statusClasses = ["text-error", "text-warning", "text-success"];

        return function (obj) {

            //如果当前连接方式不是所选方式，不更新
            if (obj.wanType != $("#netWanType").val() || mainPageLogic.modelObj != "netInfo" || obj.wl_mode == "apclient") {
                netInfo.ajaxInterval.stopUpdate();
                return;
            }
            clearTimeout(netInfo.time);

            netInfo.currentWanType = obj["wanType"];
            netInfo.currentDnsType = obj["dnsAuto"];
            netInfo.currentVpnType = obj["vpnWanType"];
            netInfo.clientFlag = obj["vpnClient"];
            netInfo.dns1 = obj["dns1"];
            netInfo.dns2 = obj["dns2"];

            //联网状态
            $("#connectStatus").html(statusTxtObj[parseInt(obj["connectStatus"].substr(obj["connectStatus"].length - 4), 10) + ""]);

            statusType = parseInt(obj["connectStatus"].charAt(1), 10);
            $("#connectStatus").attr("class", statusClasses[statusType - 1]);
            $("#connectStatusWrap").removeClass("none");

            //联网时长
            isConnect = parseInt(obj["connectStatus"].charAt(2), 10);
            $("#connectTime").html(formatSeconds(obj["connectTime"]));
            setTimeout(function () {
                $("#connectTime").html(formatSeconds(parseInt(obj["connectTime"], 10) + 1))
            }, 1000);
            if (isConnect == 1) {
                $("#connect_time").removeClass("none");
            } else {
                $("#connect_time").addClass("none");
            }
            netInfo.hasConnTime = (isConnect == 1 ? true : false);

            //状态码第一个决定按钮是连接还是断开
            netInfo.isConnect = (parseInt(obj["connectStatus"].charAt(0)) == 1 ? true : false);

            //pptp客户端开启
            if (netInfo.clientFlag === "1") {
                if (($('#netWanType').val() === "3") || ($('#netWanType').val() === "4")) {
                    $(".select-tab").html(_("Changing the settings will disable VPN feature."));
                } else {
                    $(".select-tab").html("");
                }
            } else {
                $(".select-tab").html("");
            }

            netInfo.changeWanType();
        }
    })(),
    checkWanData: function () {
        var wan_type = $("#netWanType").val(),
            vpnWanType = $("[name='vpnWanType']:checked").val(),
            ip = $("#staticIp").val(),
            mask = $("#mask").val(),
            gw = $("#gateway").val(),
            dns1 = $("#dns1").val(),
            dns2 = $("#dns2").val(),
            ppoe_user = $("#adslUser").val(),
            ppoe_pwd = $("#adslPwd").val(),
            lanIp = $("#lanIp").val(),
            lanMask = $("#lanMask").val(),
            server = $("#vpnServer").val(),
            btn_val = $("#wan_submit").val();

        if (btn_val == _("Save")) {
            /*PPTP/L2TP双接入时；若服务器地址为ip，且地址类型为静态。dns可为全空，且dns为空时，向后台传入dnsAuto "1",不为空，传入dnsAuto "0",除此以外的静态IP设置下，dns1不能为空*/
            if ((dns1 === "") && (!($("#dns1").is(":hidden")))) {
                //服务器为域名（不是ip）则首选dns不能为空。
                if ((((!$("#vpnServer").is(":hidden"))) && (!$.validate.valid.ip.all(server)) || wan_type === "5") && (vpnWanType === "0")) {} else {
                    return _("Please specify a Preferred DNS Server.");
                }
            }

            if ((wan_type == 1) || ((wan_type == 3) && (vpnWanType == 0)) || ((wan_type == 4) && (vpnWanType == 0)) || ((wan_type == 5) && (vpnWanType == 0))) { //static IP

                //同网段判断
                if (checkIpInSameSegment(ip, mask, lanIp, lanMask)) {
                    return _("%s and %s (%s) should not be in the same network segment.", [_("WAN IP"), _("LAN IP"), lanIp]);
                }
                if (netInfo.initObj.pptpSvrIp && checkIpInSameSegment(ip, mask, netInfo.initObj.pptpSvrIp, netInfo.initObj.pptpSvrMask)) {
                    return _("%s and %s (%s) should not be in the same network segment.", [_("WAN IP"), _("PPTP Server IP"), netInfo.initObj.pptpSvrIp]);
                }

                // 决策： 访客网络网段冲突有后台处理
                /*if (netInfo.initObj.guestIp && checkIpInSameSegment(ip, mask, netInfo.initObj.guestIp, netInfo.initObj.guestMask)) {
                    return _("%s and %s (%s) should not be in the same network segment.", [_("WAN IP"),_("Guest Network IP"), netInfo.initObj.guestIp]);
                }*/


                if (!checkIpInSameSegment(ip, mask, gw, mask)) {
                    return _("Gateway and the IP address must be on the same network segment.");
                }
                if (ip == gw) {
                    return _("The IP address and gateway cannot be the same.");
                }
                if (ip == dns1) {
                    return _("The IP address and Preferred DNS Server cannot be the same.");
                }
                if (ip == dns2) {
                    return _("The IP address and Alternate DNS cannot be the same.");
                }
                if ((dns1 === dns2) && (dns1 !== "")) {
                    return _("The Preferred DNS Server and Alternate DNS Server cannot be the same.");
                }

                var mask_arry = mask.split("."),
                    ip_arry = ip.split("."),
                    mask_arry2 = [],
                    maskk,
                    netIndex = 0,
                    netIndexl = 0,
                    bIndex = 0;
                if (ip_arry[0] == 127) {
                    return _("The first number of the IP cannot be 127");
                }
                if (ip_arry[0] == 0 || ip_arry[0] >= 224) {
                    return _("IP Address error!");
                }

                for (var i = 0; i < 4; i++) { // IP & mask
                    if ((ip_arry[i] & mask_arry[i]) == 0) {
                        netIndexl += 0;
                    } else {
                        netIndexl += 1;
                    }
                }

                for (var i = 0; i < mask_arry.length; i++) {
                    maskk = 255 - parseInt(mask_arry[i], 10);
                    mask_arry2.push(maskk);
                }
                for (var k = 0; k < 4; k++) { // ip & 255-mask
                    if ((ip_arry[k] & mask_arry2[k]) == 0) {
                        netIndex += 0;
                    } else {
                        netIndex += 1;
                    }
                }
                if (netIndex == 0 || netIndexl == 0) {
                    return _("IP network segment is not allowed. Please enter a specific correct IP.");
                }
                for (var j = 0; j < 4; j++) { // ip | mask
                    if ((ip_arry[j] | mask_arry[j]) == 255) {
                        bIndex += 0;
                    } else {
                        bIndex += 1;
                    }
                }

                if (bIndex == 0) {
                    return _("Broadcast IP address is not allowed. Please enter a specific correct IP.");
                }

            } else if (wan_type == 2) { //pppoe
                if (ppoe_user == "" || ppoe_pwd == "") {
                    return _("Please enter the ISP Username/Password");
                }
                /*if (netInfo.initObj.vpnClient == "1" && netInfo.initObj.vpnClientUser == ppoe_user) {
                    return _("The username of ISP and PPTP/L2TP Client can not be the same!");
                }*/
            }

            if ((wan_type === "3") || (wan_type === "4")) {
                //同网段判断
                if (checkIpInSameSegment(server, lanMask, lanIp, lanMask)) {
                    return _("%s and %s (%s) should not be in the same network segment.", [_("Server IP"), _("LAN IP"), lanIp]);
                }
            }
        }
    },
    preSubmit: function () {
        var subData,
            wan_type = $("#netWanType").val(),
            server = $("#vpnServer").val(),
            dns1 = $("#dns1").val(),
            btn_val = $("#wan_submit").val(),
            subObj;

        /*if ($("#wan_submit").val() == _("Connect")) {
            $("#connect").val(1);
            netInfo.saveType = "connect";
        } else {
            $("#connect").val(0);
            netInfo.saveType = "disconnect";
        }*/
        subData = $("#internet-form").serialize();
        subData = subData.replace("netWanType", "wanType");
        var msg = netInfo.checkWanData();
        if (msg) {
            showErrMsg("message-err", msg);
            return;
        }

        /*PPTP/L2TP双接入时；若服务器地址为ip，且地址类型为静态。dns可为全空，且dns为空时，向后台传入dnsAuto "1",不为空，传入dnsAuto "0",除此以外的静态IP设置下，dns1不能为空*/
        if (btn_val == _("Save")) {
            if (!($("#dns1").is(":hidden"))) {
                if (dns1 === "") {
                    subData = subData.replace("dnsAuto=0", "dnsAuto=1");
                } else {
                    subData = subData.replace("dnsAuto=1", "dnsAuto=0");
                }
            }
        }

        $("#wan_submit")[0].disabled = true;
        $("#netWanType").prop("disabled", true);
        $("#dnsAuto, #dns1, #dns2").prop("disabled", true);
        netInfo.saving = true;

        subObj = {
            "data": subData,
            "url": "goform/WanParameterSetting?" + Math.random(),
            "callback": netInfo.callback
        }
        return subObj;
    },
    callback: function (str) {
        if (!top.isTimeout(str)) {
            return;
        }

        var resultObj = $.parseJSON(str),
            num = resultObj.errCode,
            sleep_time = resultObj.sleep_time,
            isVpn = (sleep_time > 10 ? true : false),
            waitTime = -1, //连接或断开操作成功之后需要等待的时间
            minTime = 4; //连接或断开操作至少要花费的时间，

        if (num == 0) {
            showSaveMsg(num);
            $("#wan_submit").blur();
            netInfo.init();

        } else {
            showSaveMsg(num);
        }

        (function () {
            if (netInfo.saveType == "connect" && netInfo.hasConnTime && minTime <= 0) {
                //连接成功
                waitTime = 5; //非vpn多等5秒

                if ((netInfo.currentWanType !== "0") && (netInfo.currentWanType !== "1")) {
                    waitTime = 8; //双接入及PPPOE多等8秒
                }

                if (isVpn)
                    waitTime = 10; //vpn多等10秒

            }
            /*if (netInfo.saveType == "disconnect" && !netInfo.isConnect && minTime <= 0) {
                waitTime = 0;
                //断开成功
                if (isVpn)
                    waitTime = 5; //vpn多等5秒
            }*/

            if (sleep_time > 0 && waitTime == -1) {

                $("#wan_submit").val(_("Please Wait..."));
                sleep_time--;
                minTime--;
                setTimeout(arguments.callee, 1000);

            } else {
                if (isVpn) {
                    //vpn 到了后台传过来的等待时间就页面可以操作了
                    waitTime = (waitTime > sleep_time ? sleep_time : (waitTime == -1 ? 0 : waitTime));
                } else {
                    //非vpn 到了后台传过来的等待时间且到了操作成功的等待时间，页面才可以操作
                    waitTime = (waitTime == -1 ? 0 : waitTime);
                }

                setTimeout(function () {
                    $("#wan_submit")[0].disabled = false;
                    $("#netWanType").prop("disabled", false);
                    $("#dnsAuto, #dns1, #dns2").prop("disabled", false);
                    netInfo.saving = false;
                    netInfo.changeWanType();
                }, waitTime * 1000);
            }
        })();
    },

    changeWanType: function () {
        var wan_type = $("#netWanType").val();
        /* btnTxts = [_("Connect"), _("Disconnect")],
         btnTxt = "";*/
        wanTypeSelect(wan_type);

        if (netInfo.currentWanType == wan_type) {
            /*if (netInfo.isConnect) {
                //$("#static_ip, #ppoe_set, #double_access").addClass("none");
                btnTxt = btnTxts[1];
            } else {
                btnTxt = btnTxts[0];
            }*/
            $("#connect_message").removeClass("none");
            netInfo.ajaxInterval.startUpdate();
        } else {
            $("#connect_message").addClass("none");
            // btnTxt = btnTxts[0];
            netInfo.ajaxInterval.stopUpdate();
        }

        /*if (!netInfo.saving) {
            $("#wan_submit").val(btnTxt);
        }*/
        if (!netInfo.saving) {
            $("#wan_submit").val(_("Save"));
        }
    },

    changeVpnType: function () {
        var wan_type = $("#netWanType").val();
        if (netInfo.currentWanType == wan_type) {
            if ($(this).val() !== netInfo.currentVpnType) {
                //$("#wan_submit").val(btnTxts[0]);
                $("#connect_message").addClass("none");
                netInfo.ajaxInterval.stopUpdate();
            } else {
                $("#connect_message").removeClass("none");
                netInfo.ajaxInterval.startUpdate();
            }
        } else {
            $("#connect_message").addClass("none");
        }

        if ($(this).val() === "0") {
            $("#static_ip").removeClass("none");
            $("#dnsContainer").removeClass("none");
            $("#dnsType").addClass("none");
            $("#staticIp").focus();
        } else {
            $("#dnsType").removeClass("none").val("1");
            $("#dnsContainer").addClass("none");
            $("#static_ip").addClass("none");
            if (netInfo.currentVpnType === "0") {
                $('#dnsAuto').val('1');
            }
        }

        /*$("#internet-form").find(".control-group").css("margin-bottom", '0px');
        setTimeout(function() {
            $("#internet-form").find(".control-group").css("margin-bottom", '20px');
        })*/
    },

    changeDnsAuto: function () {
        var wan_type = $("#netWanType").val();
        if (netInfo.currentWanType == wan_type) {
            if ($("[name='vpnWanType']:checked").val() != netInfo.currentVpnType) {
                //$("#wan_submit").val(btnTxts[0]);
                $("#connect_message").addClass("none");
                netInfo.ajaxInterval.stopUpdate();
            } else {
                if ($(this).val() !== netInfo.currentDnsType) {
                    $("#connect_message").addClass("none");
                    netInfo.ajaxInterval.stopUpdate();
                } else {
                    $("#connect_message").removeClass("none");
                    netInfo.ajaxInterval.startUpdate();
                }
            }
        } else {
            $("#connect_message").addClass("none");
        }

        if ($(this).val() === "1") {
            $("#dnsContainer").addClass("none");
        } else {
            $("#dnsContainer").removeClass("none");
        }
    }
};

var signalMsg = {
    "00": _("2.4GHz Low/5GHz Low"),
    "02": _("2.4GHz Low/5GHz High"),
    "10": _("2.4GHz Medium/5GHz Low"),
    "12": _("2.4GHz Medium/5GHz High"),
    "20": _("2.4GHz High/5GHz Low"),
    "22": _("2.4GHz High/5GHz High")
};

wrlInfo = {
    loading: false,
    data: null,
    init: function () {
        if (!wrlInfo.loading) {
            $("#wireless-setting .main-area").on("click", wrlInfo.getIframe);
            wrlInfo.loading = true;
        }
        wrlInfo.initValue();
    },

    getIframe: function () {
        var id = $(this).attr("id");
        switch (id) {
        case "wrl_ssid_pwd":
            showIframe(_("WiFi Name & Password"), "wireless_ssid.html", 610, 490);
            break;
        case "wrl_wifi_time":
            showIframe(_("WiFi Schedule"), "wifi_time.html", 610, 470);
            break;
        case "wrl_bridge":
            showIframe(_("Wireless Repeating"), "wisp.html", 700, 350);
            break;
        case "wrl_channel":
            showIframe(_("Channel & Bandwidth"), "wireless.html", 460, 480);
            break;
        case "wrl_signal":
            showIframe(_("Transmit Power"), "wifi_power.html", 520, 220);
            break;
        case "wrl_wps":
            showIframe("WPS", "wifi_wps.html", 600, 400);
            break;
        case "wrl_beamforming":
            showIframe("Beamforming", "wifi_bf.html", 600, 400);
            break;
        }
    },

    initValue: function () {
        $.getJSON("goform/GetWrlStatus?" + Math.random(), wrlInfo.setValue);
    },
    setValue: function (obj) {
        wrlInfo.data = obj;
        if (obj.schedWifiEn == "1") {
            $("#wrl_wifi_time .function-status").html(_("Enabled"));
        } else {
            $("#wrl_wifi_time .function-status").html(_("Disabled"));
        }
        if (obj.beamforming === "1") {
            $("#wrl_beamforming .function-status").html(_("Enabled"));
        } else {
            $("#wrl_beamforming .function-status").html(_("Disabled"));
        }
        if (obj.wispEn == 0) {
            $("#wrl_bridge .function-status").html(_("Disabled"));
            //$("#sys_lan_status").removeClass("disabled");
        } else if (obj.wispEn == 2) {
            //$("#sys_lan_status").addClass("disabled");
            $("#wrl_bridge .function-status").html(_("Connected"));
        } else {
            //$("#sys_lan_status").addClass("disabled");
            $("#wrl_bridge .function-status").html(_("Enabled"));
        }

        $("#wrl_ssid_pwd .function-status").html((obj.namePwd === "0") ? _("Disabled") : _("Enabled"));

        $("#wrl_signal .function-status").html(signalMsg[obj.signal]);

        $("#wrl_wps .function-status").html(obj.wpsEn == "1" ? _("Enabled") : _("Disabled"));
    }
};

guestInfo = {
    loading: false,
    initObj: null,
    init: function () {
        if (!guestInfo.loading) {
            $("#guest_submit").on("click", function () {
                if (!this.disabled)
                    mainPageLogic.validate.checkAll("guest-form");
            });
            $("#guestEn").on("click", function () {
                if (guestInfo.initObj.wl_mode == "ap" && guestInfo.initObj.wl_en != "0") {
                    guestInfo.changeBtnEn.call(this);
                }
            });

            guestInfo.loading = true;
        }
        guestInfo.initValue();
    },
    changeBtnEn: function () {
        var className = $(this).attr("class");
        if (className == "btn-off") {
            $(this).attr("class", "btn-on");
            $(this).val(1);
        } else {
            $(this).attr("class", "btn-off");
            $(this).val(0);
        }
    },
    initValue: function () {
        $.getJSON("goform/WifiGuestGet?" + Math.random(), guestInfo.setValue);
    },
    setValue: function (obj) {
        guestInfo.initObj = obj;
        inputValue(obj);
        $('#guestWrlPwd').initPassword(_(""), false, false);
        $("#guestEn").attr("class", (obj.guestEn == "1" ? "btn-off" : "btn-on"));
        guestInfo.changeBtnEn.call($("#guestEn")[0]);

        if (obj.wl_mode != "ap" || obj.wl_en != "1") {
            $("#guest_submit")[0].disabled = true;
            if (obj.wl_mode != "ap") {
                showErrMsg("guest_save_msg", _("The Guest Network is not available while the Wireless Repeating is enabled."), true);
            } else if (obj.wl_en != "1") {
                showErrMsg("guest_save_msg", _("The Wireless feature is disabled. This feature is not available."), true);
            }
        } else {
            showErrMsg("guest_save_msg", "", true);
            $("#guest_submit")[0].disabled = false;
        }
    },
    checkValidate: function () {},
    preSubmit: function () {
        var subData,
            dataObj,
            subObj,
            callback,
            guestSecurity;

        guestSecurity = $("#wrlPwd").val() != "" ? "wpapsk" : "none";

        dataObj = {
            "guestEn": $("#guestEn").val(),
            "guestEn_5g": $("#guestEn").val(),
            "guestSecurity": guestSecurity,
            "guestSecurity_5g": guestSecurity,
            "guestSsid": $("#guestSsid").val(),
            "guestSsid_5g": $("#guestSsid_5g").val(),
            "guestWrlPwd": $("#guestWrlPwd").val(),
            "guestWrlPwd_5g": $("#guestWrlPwd").val()
        }
        subData = objTostring(dataObj);
        //subData = $("#wrl-form").serialize()+"&hideSsid=" + $("#hideSsid").val() + "&hideSsid_5g=" + $("#hideSsid_5g").val();
        //showErrMsg("wrl_save_msg", "无线将断开，请重新连接！");
        subObj = {
            "data": subData,
            "url": "goform/WifiGuestSet",
            "callback": guestInfo.callback
        };
        return subObj;
    },
    callback: function (str) {
        if (!top.isTimeout(str)) {
            return;
        }
        var num = $.parseJSON(str).errCode;
        showSaveMsg(num);
        if (num == 0) {
            $("#guest_submit").blur();
            guestInfo.initValue();
        }
    }
};

powerInfo = {
    loading: false,
    initObj: {},
    init: function () {
        if (!powerInfo.loading) {
            powerInfo.initHtml();
            $("#power_submit").on("click", function () {
                mainPageLogic.validate.checkAll("power-form");
            });
            $("#powerSavingEn").on("click", function () {
                if (powerInfo.initObj.wl_mode == "ap")
                    powerInfo.changePowerEn.call(this);
            });
            $("#startHour,#startMin,#endHour,#endMin").on("change", powerInfo.changeTimeSet);
            powerInfo.loading = true;
        }
        powerInfo.initValue();
    },
    initHtml: function () {
        var hour_str = "",
            min_str = "",
            i = 0,
            k = 0;
        for (i = 0; i < 24; i++) {
            hour_str += "<option value='" + ((100 + i).toString()).slice(1, 3) + "'>" + ((100 + i).toString()).slice(1, 3) + "</option>";
        }
        for (k = 0; k < 60; k++) {
            min_str += "<option value='" + ((100 + k).toString()).slice(1, 3) + "'>" + ((100 + k).toString()).slice(1, 3) + "</option>";
        }
        $("#startHour").html(hour_str);
        $("#startMin").html(min_str);
        $("#endHour").html(hour_str);
        $("#endMin").html(min_str);
    },
    changePowerEn: function () {

        var className = $(this).attr("class");
        if (className == "btn-off") {
            $(this).attr("class", "btn-on");
            $("#power_time_set").removeClass("none");
            $("#power_save_delay_set").removeClass("none");
            $("#power_notice").addClass("none");
            $(this).val(1);
        } else {
            $(this).attr("class", "btn-off");
            $("#power_time_set").addClass("none");
            $("#power_save_delay_set").addClass("none");
            $("#power_notice").removeClass("none");
            $(this).val(0);
        }
    },
    changeTimeSet: function () {
        var startTimeMin = parseInt($("#startHour").val() * 60) + parseInt($("#startMin").val()),
            endTimeMin = parseInt($("#endHour").val() * 60) + parseInt($("#endMin").val()),
            totalTime = 0;

        if (startTimeMin > endTimeMin) {
            totalTime = 24 * 60 - startTimeMin + endTimeMin;
        } else {
            totalTime = endTimeMin - startTimeMin;
        }
        return totalTime; //return total min;
    },
    initValue: function () {
        $.getJSON("goform/PowerSaveGet?" + Math.random(), powerInfo.setValue);
    },
    setValue: function (obj) {
        (obj.timeUp == "1" ? $("#timeUpTip").addClass("none") : $("#timeUpTip").removeClass("none"));
        powerInfo.initObj = obj;
        inputValue(obj);
        $("#powerSavingEn").attr("class", (obj.powerSavingEn == "1" ? "btn-off" : "btn-on"));
        powerInfo.changePowerEn.call($("#powerSavingEn")[0]);

        $("#power_save_delay")[0].checked = (obj.powerSaveDelay == "1" ? true : false);
        var time = obj.time;

        $("#startHour").val(time.split("-")[0].split(":")[0]);
        $("#startMin").val(time.split("-")[0].split(":")[1]);
        $("#endHour").val(time.split("-")[1].split(":")[0]);
        $("#endMin").val(time.split("-")[1].split(":")[1]);

        powerInfo.changeTimeSet();

        if (obj.wl_mode != "ap") {
            showErrMsg("power-message-err", _("The Sleeping Mode feature is not available while the Wireless Repeating is enabled."), true);
            $("#timeUpTip").addClass("none");
            $("#power_submit")[0].disabled = true;
        } else {
            showErrMsg("power-message-err", "", true);
            $("#power_submit")[0].disabled = false;
        }
    },
    checkValidate: function () {},
    preSubmit: function () {
        var subData,
            dataObj,
            subObj,
            callback,
            powerSavingEn = $("#powerSavingEn").val();
        startHour = $("#startHour").val(),
        startMin = $("#startMin").val(),
        endHour = $("#endHour").val(),
        endMin = $("#endMin").val(),
        time = startHour + ":" + startMin + "-" + endHour + ":" + endMin;

        if (powerSavingEn == "1") {
            if (startHour == endHour && startMin == endMin) {
                showErrMsg("power-message-err", _("The start time and end time should not be the same."));
                return;
            }
            /*if (parseInt(powerInfo.changeTimeSet(), 10) <= 5) {
                showErrMsg("power-message-err", _("The total time of Sleeping Mode must be greater than 5 mins a day."));
                return;
            }*/

            //判断时间是否与智能led冲突
            if (powerInfo.initObj.ledTime) {
                var ledTimeStart = parseInt(powerInfo.initObj.ledTime.split("-")[0].replace(/[^\d]/g, ""), 10),
                    ledTimeEnd = parseInt(powerInfo.initObj.ledTime.split("-")[1].replace(/[^\d]/g, ""), 10);
                if (isTimeOverlaping(ledTimeStart, ledTimeEnd, parseInt(startHour + "" + startMin, 10), parseInt(endHour + "" + endMin, 10))) {
                    //重叠
                    if (!window.confirm(_("The time period you set up in Sleeping Mode (%s) overlaps with that in LED Control (%s). During the overlapping time, the settings in LED Control will be ineffective. Save the settings?", [time, powerInfo.initObj.ledTime]))) {
                        return;
                    }
                }
            }

            //判断时间是否与wifi开关冲突
            if (powerInfo.initObj.wifiTime) {
                var wifiTimeStart = parseInt(powerInfo.initObj.wifiTime.split("-")[0].replace(/[^\d]/g, ""), 10),
                    wifiTimeEnd = parseInt(powerInfo.initObj.wifiTime.split("-")[1].replace(/[^\d]/g, ""), 10);
                if (isTimeOverlaping(wifiTimeStart, wifiTimeEnd, parseInt(startHour + "" + startMin, 10), parseInt(endHour + "" + endMin, 10))) {
                    //重叠
                    if (!window.confirm(_("The time period you set up in Sleeping Mode (%s) overlaps with that in WiFi Schedule (%s). During the overlapping time, the settings in WiFi Schedule will be ineffective. Are you sure to save the settings?", [time, powerInfo.initObj.wifiTime]))) {
                        return;
                    }
                }
            }

            dataObj = {
                "powerSavingEn": powerSavingEn,
                "time": startHour + ":" + startMin + "-" + endHour + ":" + endMin,
                "powerSaveDelay": $("#power_save_delay")[0].checked ? "1" : "0"
            }
        } else {

            dataObj = {
                "powerSavingEn": powerSavingEn,
                "time": powerInfo.initObj.time,
                "powerSaveDelay": powerInfo.initObj.powerSaveDelay
            }
        }


        subData = objTostring(dataObj);
        subObj = {
            "data": subData,
            "url": "goform/PowerSaveSet",
            "callback": powerInfo.callback
        };
        return subObj;
    },
    callback: function (str) {
        if (!top.isTimeout(str)) {
            return;
        }
        var num = $.parseJSON(str).errCode;
        showSaveMsg(num);
        if (num == 0) {
            $("#wrl_submit").blur();
            powerInfo.initValue();
        }
    }
};

usbInfo = {

    loading: false,
    data: null,
    init: function () {
        if (!usbInfo.loading) {
            $("#usb-setting .main-area").on("click", usbInfo.getIframe);
            usbInfo.loading = true;
        }
        usbInfo.initValue();
    },
    initValue: function () {
        $.getJSON("goform/GetUSBStatus?" + Math.random(), usbInfo.setValue);
    },
    setValue: function (obj) {
        usbInfo.data = obj;
        if (obj.printer == "0") {
            $("#usb_printer .function-status").html(_("Disabled"));
        } else {
            $("#usb_printer .function-status").html(_("Enabled"));
        }

        if (obj.dlna == "0") {
            $("#usb_dlna .function-status").html(_("Disabled"));
        } else {
            $("#usb_dlna .function-status").html(_("Enabled"));
        }

        if (obj.hasusb === "0") {
            $("#usb_samba .function-status").html(_("Disabled"));
        } else {
            $("#usb_samba .function-status").html(_("Enabled"));
        }
    },
    getIframe: function () {
        var id = $(this).attr("id");
        switch (id) {
        case "usb_samba":
            showIframe(_("File Share"), "samba.html", 620, 450);
            break;
        case "usb_dlna":
            showIframe(_("DLNA"), "dlna.html", 620, 450);
            break;
        case "usb_printer":
            showIframe(_("Printer Service"), "printer.html", 650, 240);
            break;
        }
    }

};
vpnInfo = {
    loading: false,
    data: null,
    init: function () {
        if (!vpnInfo.loading) {
            $("#vpn-setting .main-area").on("click", vpnInfo.getIframe);
            vpnInfo.loading = true;
        }
        vpnInfo.initValue();
    },
    initValue: function () {
        $.getJSON("goform/GetVpnStatus?" + Math.random(), vpnInfo.setValue);
    },
    setValue: function (obj) {
        vpnInfo.data = obj;
        if (obj.server == "0") {
            $("#vpn_server .function-status").html(_("Disabled"));
        } else {
            $("#vpn_server .function-status").html(_("Enabled"));
        }
        if (obj.client == "0") {
            $("#vpn_client .function-status").html(_("Disabled"));
        } else {
            $("#vpn_client .function-status").html(_("Enabled"));
        }

    },
    getIframe: function () {
        var id = $(this).attr("id");
        switch (id) {
        case "vpn_server":
            showIframe(_("PPTP Server"), "pptp_server.html", 630, 510);
            break;
        case "vpn_client":
            if (vpnInfo.data.wanType == "3" || vpnInfo.data.wanType == "4") {
                alert(_("This feature is not available at the moment."));
                return false;
            }
            showIframe(_("PPTP/L2TP Client"), "pptp_client.html", 560, 400);
            break;
        }
    }
};

advInfo = {
    loading: false,
    data: null,
    init: function () {
        if (!advInfo.loading) {
            $("#advance .main-area").on("click", advInfo.getIframe);

            advInfo.loading = true;
        }
        advInfo.initValue();
    },
    initValue: function () {
        $.getJSON("goform/GetAdvanceStatus?" + Math.random(), advInfo.setValue);
    },
    setValue: function (obj) {
        advInfo.data = obj;

        if (obj.wl_mode == "apclient") {
            $("#adv_netcontrol, #adv_parental, #adv_remoteweb, #adv_ddns, #adv_upnp, #adv_virtualServer, #adv_dmz, #adv_firewall").addClass("disabled");
        } else {
            $("#adv_netcontrol, #adv_parental, #adv_remoteweb, #adv_ddns, #adv_upnp, #adv_virtualServer, #adv_dmz").removeClass("disabled");
        }

        if (obj.netControl == 0) {
            $("#adv_netcontrol .function-status").html(_("Disabled"));
        } else {
            $("#adv_netcontrol .function-status").html(_("Enabled"));
        }
        if (obj.led == 0) {
            $("#adv_led .function-status").html(_("Disabled"));
        } else {
            $("#adv_led .function-status").html(_("Enabled"));
        }

        if (obj.cloud == 0) {
            $("#adv_cloud .function-status").html(_("Disabled"));
        } else {
            $("#adv_cloud .function-status").html(_("Enabled"));
        }
        if (obj.remoteWeb == 0) {
            $("#adv_remoteweb .function-status").html(_("Disabled"));
        } else {
            $("#adv_remoteweb .function-status").html(_("Enabled"));
        }
        if (obj.ddns == 0) {
            $("#adv_ddns .function-status").html(_("Disabled"));
        } else {
            $("#adv_ddns .function-status").html(_("Enabled"));
        }
        if (obj.upnp == 0) {
            $("#adv_upnp .function-status").html(_("Disabled"));
        } else {
            $("#adv_upnp .function-status").html(_("Enabled"));
        }
        if (obj.iptv == 0) {
            $("#adv_iptv .function-status").html(_("Disabled"));
        } else {
            $("#adv_iptv .function-status").html(_("Enabled"));
        }
        if (obj.parentControl === "0") {
            $("#adv_parental .function-status").html(_("Not Configured"));
        } else {
            $("#adv_parental .function-status").html(_("Configured"));
        }
        if (obj.virtualServer === "0") {
            $("#adv_virtualServer .function-status").html(_("Not Configured"));
        } else {
            $("#adv_virtualServer .function-status").html(_("Configured"));
        }
        if (obj.firewall === "0") {
            $("#adv_firewall .function-status").html(_("Disabled"));
        } else {
            $("#adv_firewall .function-status").html(_("Enabled"));
        }
        if (obj.staticRoute === "0") {
            $("#adv_route .function-status").html(_("Not Configured"));
        } else {
            $("#adv_route .function-status").html(_("Configured"));
        }
        if (obj.dmz === "0") {
            $("#adv_dmz .function-status").html(_("Disabled"));
        } else {
            $("#adv_dmz .function-status").html(_("Enabled"));
        }


    },
    getIframe: function () {
        if ($(this).hasClass("disabled")) return;

        var id = $(this).attr("id");
        switch (id) {
        case "adv_parental":
            $(".fopare-ifmwrap-title").addClass("border-bottom");
            $("#head_title2").html(_("Clients in control")).removeClass("none");
            $("#head_title").html(_("Parental Control")).addClass("selected");
            showIframe(_("Parental Control"), "parental_control.html", 700, 200);
            break;
        case "adv_netcontrol":
            showIframe(_("Bandwidth Control"), "net_control.html", 800, 550);
            break;
        case "adv_led":
            showIframe(_("LED Control"), "system_led.html", 560, 315);
            break;
        case "adv_cloud":
            showIframe(_("Tenda App"), "cloud_managment.html", 620, 450);
            break;
        case "adv_remoteweb":
            showIframe(_("Remote Management"), "remote_web.html", 500, 475, (advInfo.data.nopwd === true) ? "nopwd" : "");
            break;
        case "adv_ddns":
            showIframe("DDNS", "ddns_config.html", 500, 410);
            break;
        case "adv_virtualServer":
            showIframe(_("Virtual Server"), "virtual_server.html", 700, 550);
            break;
        case "adv_dmz":
            showIframe(_("DMZ"), "dmz.html", 430, 350);
            break;
        case "adv_upnp":
            showIframe("UPnP", "upnp_config.html", 550, 300);
            break;
        case "adv_iptv":
            showIframe("IPTV", "iptv.html", 580, 510);
            break;
        case "adv_route":
            showIframe(_("Static Routing"), "static_route.html", 700, 510);
            break;
        case "adv_firewall":
            showIframe(_("Firewall"), "firewall.html", 580, 510);
            break;
        }
        G.iframeFlag = true;
    }
};

var timeMsg = {
    "0": _("(GMT-12:00) Eniwetok Island"),
    "1": _("(GMT-11:00) Samoa"),
    "2": _("(GMT-10:00) Hawaii"),
    "3": _("(GMT-09:00) Alaska"),
    "4": _("(GMT-08:00) San Francisco"),
    "5": _("(GMT-07:00) Denver"),
    "6": _("(GMT-06:00) Mexico City, Guatemala, Costa Rica, Salvador, Nicaragua"),
    "7": _("(GMT-05:00) New York, Ottawa"),
    "8": _("(GMT-04:00) Chile, Brazil"),
    "9": _("(GMT-03:00) Buenos Aires"),
    "10": _("(GMT-02:00) Mid-Atlantic"),
    "11": _("(GMT-01:00) Cape Verde Islands"),
    "12": _("(GMT) Greenwich Mean Time"),
    "13": _("(GMT+01:00) Denmark, Germany, Norway, Hungary, France, Belgium"),
    "14": _("(GMT+02:00) Israel, Egypt, Bucharest"),
    "15": _("(GMT+03:00) Moscow"),
    "16": _("(GMT+04:00) Sultanate of Oman, Mauritania, Reunion Island"),
    "17": _("(GMT+05:00) Pakistan, Novaya Zemlya, Maldives"),
    "18": _("(GMT+06:00) Colombo"),
    "19": _("(GMT+07:00) Bangkok, Jakarta"),
    "20": _("(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi, Taipei"),
    "21": _("(GMT+09:00) Tokyo, Pyongyang"),
    "22": _("(GMT+10:00) Sydney, Guam"),
    "23": _("(GMT+11:00) Solomon Islands"),
    "24": _("(GMT+12:00) Wellington"),
    "25": _("(GMT+13:00) Nuku'alofa")
};

sysInfo = {
    loading: false,
    data: null,
    init: function () {
        if (!sysInfo.loading) {
            $("#system .main-area").on("click", sysInfo.getIframe);
            var Msg = location.search.substring(1) || "0";
            if (Msg == "1") {
                showIframe(_("LAN IP Setting"), "lan.html", 400, 215);
            }
            sysInfo.loading = true;
        }
        sysInfo.initValue();
    },
    initValue: function () {
        $.getJSON("goform/GetSysStatus?" + Math.random(), sysInfo.setValue);
    },
    setValue: function (obj) {
        sysInfo.data = obj;

        $("#sys_lan_status .function-status").html(obj.lan);

        if (obj.firmware == "1") {
            $("#sys_upgrade .function-status").html(_("New version detected"));
        } else {
            $("#sys_upgrade .function-status").html(obj.firmware);
        }
        $("#sys_auto .function-status").html(obj.rebootEn == 1 ? _("Enabled") : _("Disabled"));

        if (obj.wl_mode == "apclient") {
            $("#sys_wan").addClass("disabled");
            $("#ip_mac_bind").addClass("disabled");
            if (obj.apClientConnect == "1") {
                $("#sys_lan_status").addClass("disabled");
            }
        }

        if (obj.ipMacBindEn === "0") {
            $("#ip_mac_bind .function-status").html(_("Not Configured"));
        } else {
            $("#ip_mac_bind .function-status").html(_("Configured"));
        }

        if (timeMsg[obj.timeZone] !== "") {
            $("#sys_time .function-status").html(_(timeMsg[obj.timeZone]));
        }
    },
    getIframe: function () {
        if ($(this).hasClass("disabled")) return;

        var id = $(this).attr("id");
        switch (id) {
        case "sys_status":
            showIframe(_("System Status"), "system_status.html", 530, 490);
            break;
        case "sys_pwd":
            showIframe(_("Login Password"), "system_password.html", 500, 310);
            break;
        case "sys_lan_status":
            showIframe(_("LAN IP Setting"), "lan.html", 580, 415);
            break;
        case "ip_mac_bind":
            showIframe(_("DHCP Reservation"), "ip_mac_bind.html", 780, 415);
            break;
        case "sys_wan":
            showIframe(_("WAN Settings"), "mac_clone.html", 535, 450);
            break;
        case "sys_reboot":
            showIframe(_("Reboot the Router"), "system_reboot.html", 400, 205);
            break;
        case "sys_upgrade":
            showIframe(_("Firmware Upgrade"), "system_upgrade.html", 665, 556);
            break;
        case "sys_backup":
            showIframe(_("Backup/Restore"), "system_backup.html", 600, 240);
            break;
        case "sys_config":
            showIframe(_("Reset to Factory Default"), "system_config.html", 400, 205);
            break;
        case "sys_log":
            showIframe(_("System Log"), "system_log.html", 650, 425);
            break;
        case "sys_auto":
            showIframe(_("Auto Maintenance"), "system_automaintain.html", 500, 205);
            break;
        case "sys_time":
            showIframe(_("Time Settings"), "system_time.html", 820, 415);
            break;
        }
    }
};

<!-- 主菜单语言选择 -->
//$('.main-content').prepend('<div class="lang" id="lang" style="color: #999; font-size: 13px; margin-top:2px; float:none; position: absolute; left: 850px; top:15px;"><a class="lang-toggle" id="langToggle"><span>中文</span><b style="border-top-color:#999" class="caret"></b></a><ul class="lang-menu none" style="top: 43px; z-index: 1000;" id="langMenu"><li><a data-country="en">English</a></li><li><a data-country="cn">中文</a></li><li><a data-country="zh">繁體中文</a></li></ul><span style="margin-left:10px;">|<a style="margin-left:10px; color: #999;" href="goform/exit">Exit</a></span></div>');

/*$(".main-section-title").before('<div class="lang-set"><a class="lang-toggle"><span>中文</span><b style="border-top-color:#999" class="caret"></b></a><ul class="lang-menu none" style="top: 43px; z-index: 1000;"><li><a data-country="en">English</a></li><li><a data-country="cn">中文</a></li><li><a data-country="zh">繁體中文</a></li></ul><span style="margin-left:10px;">|<a style="margin-left:10px; color: #999;" href="goform/exit">Exit</a></span></div>')*/
$(".main-section-title").before('<div class="lang-set"><span style="margin-left:10px;"><a style="margin-left:10px; color: #a5a7a6;" href="goform/exit">Exit</a></span></div>')