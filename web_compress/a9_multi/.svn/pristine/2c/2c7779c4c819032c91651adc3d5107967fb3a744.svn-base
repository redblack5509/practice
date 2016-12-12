function ModuleLogic(view) {
    var that = this;
    this.initObj = {};
    this.init = function () {
        this.currenPageId = "select";
        this.nextPageId = null;
        this.initEvent();
        that.getValue();
    };

    this.initEvent = function () { //初始化事件
        $("#selectNext").on("click", function () {
            var selected = false,
                upperWifiName = "",
                securityMode = "",
                channel = "",
                signal = "",
                obj = {};

            $('[name="wifiSelect"]').each(function () {
                var trIndex = $(this).parents('tr').attr("index");
                if ($(this)[0].checked) {
                    selected = true;
                    upperWifiName = that.initObj[trIndex].wifiScanSSID;
                    securityMode = that.initObj[trIndex].wifiScanSecurityMode;
                    channel = that.initObj[trIndex].wifiScanChannel;
                    signal = that.initObj[trIndex].wifiScanSignalStrength;
                }
            });


            if (!selected) {
                alert(_("Please select a Wi-Fi name…"));
                return;
            }

            if (securityMode === "UNKNOW") {
                alert(_("The encryption of the base station is WEP. The extender doesn't support this encryption (WEP)."));
                return;
            }

            if (parseInt(signal) < -72) {
                alert(_("The selected Wi-Fi signal is weak. For stable connection, move the extender close to the wireless router or access point."));
            }

            obj = {
                wifiName: upperWifiName,
                wifiSecurityMode: securityMode,
                wifiChannel: channel
            }
            view.changePage("select", "details");
            if ($("#extenderName").parent().hasClass("has-error")) {
                $("#extenderName").removeValidateTip();
                $("#extenderName").parent().removeClass("has-feedback has-error");
            }

            view.initHtml(obj);

            if (securityMode === 'NONE') {
                $('#wifiPwdCon').addClass("none");
            } else {
                $('#wifiPwdCon').removeClass("none");
                $('#wifiPwd').val('').attr({
                    disabled: false
                });
            }
        });

        $("#back").on("click", function () {
            view.changePage("details", "select");
        });

        //$("#keepUpper").on("click", view.checkKeepUppserStauts);

        $("#ok").on("click", function () {
            view.validate.checkAll();
        });

        $("#refreshTable").on("click", function () {
            that.getValue();
        });

        $("#extend").on("click", function () {
            window.location.reload();
        });

        var newInput1,
            $ele1 = $("#wifiPwd");
        if (isSupChangeType($ele1)) {
            $('#wifiPwdCon').on('click', '.icon-show', function () {
                $(this).removeClass('icon-show').addClass('icon-hide');
                $ele1.attr('type', "text");
            });
            $('#wifiPwdCon').on('click', '.icon-hide', function () {
                $(this).removeClass('icon-hide').addClass('icon-show');
                $ele1.attr('type', "password");
            });
        } else {
            //newInput = createTextInput(document.getElementById('wifiPwd'), "wifiPwdCon");
        }
        $("#wifiPwd").initPassword(_(""));

        $.validate.valid.ssid2 = {
            all: function (str) {
                var ret = this.specific(str);

                if (ret) {
                    return ret;
                }
            },
            specific: function (str) {
                //ssid /^[!#; ]|[?"$\[\\+]+|(BTWifi)+|(Auto-BT)+|(BTOpenzone)+|(BTFON)+|( )$|[^ -~]/i
                //ssid /^(DIRECT)/
                var rel1 = /[?"$\[\\+]+/g,
                    rel2 = /^[!#;]/,
                    rel3 = /^( )|( )$/,
                    rel4 = /^(DIRECT)/i,
                    rel5 = /(BTWifi)+|(BTWi-fi)+|(Auto-BT)+|(BTOpenzone)+|(BTFON)/i,
                    rel6 = /[^ -~]/g;

                if (rel1.test(str)) {
                    return _("The following six characters are not allowed in an SSID:  ? \" $ [ \\ +");
                }

                if (rel2.test(str)) {
                    return _("The following three characters cannot be the first in the SSID string ! # ;")
                }

                if (rel3.test(str)) {
                    return _("A '&lt;space&gt;' MUST not be the first or last character in the SSID")
                }

                if (rel4.test(str)) {
                    return _("The SSID MUST not start with the string 'DIRECT'")
                }

                if (rel5.test(str)) {
                    return _("The wireless SSID must not contain the text \"BTWifi\", \"BTWi-fi\", \"Auto-BT\", \"BTOpenzone\" or \"BTFON\" (Case insensitive)")
                }

                if (rel6.test(str)) {
                    return _("Must be ASCII.");
                }
            }
        };

        $.validate.valid.ssid3 = {

            all: function (str) {
                var ret = this.specific(str);

                if (ret) {
                    return ret;
                }
            },
            specific: function (str) {
                var extendSsid = "",
                    extendWifiSsid = $("#wifiName").text();
                if (extendWifiSsid.length <= 28) {
                    extendSsid = "EXT-" + extendWifiSsid;
                } else {
                    extendSsid = "EXT-" + extendWifiSsid.slice(0, 28);
                }
                if (str != extendSsid) {
                    return $.validate.valid.ssid2.specific(str);
                } else {
                    return;
                }
            }
        };
    }

    this.getValue = function () {
        $("#wifiScanTbody").html("");
        $("#selectNext").addClass("none");
        $("#refreshTable").addClass("none");
        $("#wifiScan").prev().addClass("invisible");
        $("#loading").removeClass("none");

        $.GetSetData.setData("goform/getWizard", {
            random: Math.random(),
            module1: "wifiScan"
        }, that.initValue);
    };

    //初始化数据
    this.initValue = function (obj) {
        var timeoutStr = '<tr><td colspan="3" class="text-danger">' + _("SSID Scanning timed out!") + '</td></tr>';
        var noSsidStr = '<tr><td colspan="3" class="text-content-2">' + _("There are no active Broadband Routers or Access Points within range.") + '</td></tr>' + '<tr><td colspan="3" class="text-content-2">' + _("Please check your Broadband Router or Access Point is switched on or reposition the Wi-Fi Extender to be closer.") + '</td></tr>';
        $('#wifiScanTbody').html('');

        $("#loading").addClass("none");
        $("#refreshTable").removeClass("none");
        try {
            obj = $.parseJSON(obj);
        } catch (e) {
            $('#wifiScanTbody').append(timeoutStr);
            return;
        }

        if (!obj.wifiScan) {
            $('#wifiScanTbody').append(timeoutStr);
            return;
        }

        //初始化本设备的ssid和密码
        $("#extenderName").val(obj.wizardSSID);
        $("#extenderPwd").val(obj.wizardSSIDPwd);


        if (obj.timeout) {
            $("#wifiScan").prev().removeClass("invisible");
            $('#wifiScanTbody').append(timeoutStr);
            return;
        }


        var ssidList = filterSsid(obj.wifiScan);

        //未扫描到ssid，此时已过滤不显示的ssid
        if (ssidList.length === 0) {
            $('#wifiScanTbody').html('');
            $('#wifiScanTbody').append(noSsidStr);
            return;
        }
        $("#wifiScan").prev().removeClass("invisible");
        var listObj = ssidList.sort(function (a, b) {
                if (parseInt(a.wifiScanSignalStrength) > parseInt(b.wifiScanSignalStrength)) {
                    return -1;
                } else {
                    return 1;
                }
            }),
            tableStr = '',
            signal;

        that.initObj = listObj;
        $("#selectNext").removeClass("none");

        for (var i = 0, l = listObj.length; i < l; i++) {

            tableStr = '<tr index="' + i + '"><td style="width: 15%"><input type="radio" name="wifiSelect"/></td>';
            tableStr += '<td style="width: 30%" class="fixed text-content-2 extend-wifi-target" title=""></td>';

            signal = parseInt(listObj[i].wifiScanSignalStrength, 10);
            if (signal >= -45) {
                signal = "signal-4";
            } else if (signal < -45 && signal >= -60) {
                signal = "signal-3";
            } else if (signal < -60 && signal >= -74) {
                signal = "signal-2";
            } else {
                signal = "signal-1";
            }
            tableStr += '<td style="width: 25%;padding-right: 10px;"><span class="' + signal + ' scan-icon"></span>';

            if (listObj[i].wifiScanSecurityMode !== "NONE") {
                tableStr += '<span class="icon-lock scan-icon"><input type="hidden" value=' + listObj[i].wifiScanSecurityMode + '><input type="hidden" value=' + listObj[i].wifiScanChannel + '></span>';
            } else {
                tableStr += '<span><input type="hidden" value="NONE"/></span>';
            }
            tableStr += '</td></tr>';
            $('#wifiScanTbody').append(tableStr);

            $("#wifiScanTbody").find(".extend-wifi-target").attr("title", listObj[i].wifiScanSSID);
            $("#wifiScanTbody").find(".extend-wifi-target").text(listObj[i].wifiScanSSID);
            $("#wifiScanTbody").find(".extend-wifi-target").removeClass("extend-wifi-target");
        }


    };
}

// Support change input type or not
function isSupChangeType(passwordElem) {
    try {
        passwordElem.attr("type", "text");
        if (passwordElem.attr("type") === 'text') {
            passwordElem.attr("type", "password");
            return true;
        }
    } catch (d) {
        return false;
    }

}

function ModuleView() {
    var that = this;
    this.currenPageId = null; //保存当前页面ID
    this.nextPageId = null; //保存下一个显示ID

    /*this.checkKeepUppserStauts = function () {
        var selected = $("#keepUpper").prop("checked");
        if (selected) {
            $("#extenderInfo").addClass("none");
        } else {
            $("#extenderInfo").removeClass("none");
        }
    };*/
    this.initHtml = function (obj) {
        $('#wifiName').text(obj.wifiName).attr("title", obj.wifiName);
        var extendSsid = "";
        if (obj.wifiName.length <= 28) {
            extendSsid = "EXT-" + obj.wifiName;
        } else {
            extendSsid = "EXT-" + obj.wifiName.slice(0, 28);
        }
        $("#extenderName").val(extendSsid);

        $('#wifiSecurityMode').val(obj.wifiSecurityMode);
        $('#wifiChannel').val(obj.wifiChannel);
        //$("#keepUpper").prop("checked", true);
        // that.checkKeepUppserStauts();
    };

    //最后设置
    function endSetup() {
        var checkBridgeT = null,
            timer = 0,
            bridgeReturnFlag = false; //是否请求进入了回调

        $("#savingWrap").show();
        $("#savedWrap").hide();
        checkBridgeT = setInterval(function () {

            //根据上一秒的数据进行判断
            if (timer > (30000 / 500)) {
                clearInterval(checkBridgeT);
                if (bridgeReturnFlag) { //如果30s时有返回

                    extendFail(_("Timed Out! Please extend again!"));
                } else {
                    $("#savingWrap").hide();
                    $("#savedWrap").show();
                    $("#successinternetWrap").html(_("Congratulations, your network is now extended successfully!")).show();
                    $("#savedWrap .content").html("&nbsp;").addClass("icon-success");
                }

            } else {
                timer++;
            }

            /*--------请求---------------*/
            bridgeReturnFlag = false;
            $.GetSetData.getJson("goform/getStatusBeforeBridge", function (data) {

                bridgeReturnFlag = true; //成功进入回调中
                // 0:disconnected  1:connected  2:connecting
                if (data.extended === "0") {
                    clearInterval(checkBridgeT);
                    extendFail(_("Failed to extend. Please extend again!"));
                } else if (data.extended === "1") {
                    clearInterval(checkBridgeT);
                    $("#savingWrap").hide();
                    $("#savedWrap").show();
                    $("#successinternetWrap").html(_("Congratulations, your network is now extended successfully!")).show();
                    $("#savedWrap .content").html("&nbsp;").addClass("icon-success");
                } else if (data.extended === "3") {
                    clearInterval(checkBridgeT);
                    extendFail(_("Not connected. <br />Please check the Wi-Fi Password you entered and try again."));
                }
            });
        }, 500);
    }

    function extendFail(msg) {
        $("#savingWrap").hide();
        $("#savedWrap").show();
        $("#successinternetWrap").html(msg).show();
        $("#nameModified").hide();
        $("#extend").show();
        $("#savedWrap .content").html("&nbsp;").addClass("icon-cancel").css("width", "202px");
    }
    //切换页面，不需要验证数据
    this.changePage = function (currenPage, nextPage) {
        $("#" + currenPage).hide();
        $("#" + nextPage).show();

        this.currenPageId = currenPage;
        this.nextPageId = nextPage;
        $(".breadcrumb .active").removeClass("active");
        if (nextPage === "details") {
            $(".breadcrumb").find("li").eq(1).addClass("active");
        } else if (nextPage === "select") {
            $(".breadcrumb").find("li").eq(0).addClass("active");
        } else {
            $(".text-right").hide();
        }

        if (nextPage == "doneWrap") {
            $("#ssid-msg").text("modifiedName");
            endSetup();
        }
    };

    this.validate = $.validate({
        custom: function () {},

        success: function () {
            that.preSubmit();
        },

        error: function (msg) {}
    });

    //提交数据
    this.preSubmit = function () {
        var checked = false;
        var data = {
            module1: "setExtenderWifi",
            wifiRelaySSID: $("#wifiName").text() || "",
            wifiRelaySecurityMode: $("#wifiSecurityMode").val() || "",
            wifiRelayPwd: $('#wifiPwd').val() || "",
            wifiRelayChannel: $("#wifiChannel").val() || "",
            //module2: "setWifiInfo",
            wizardSSID: $("#extenderName").val() || "",
            wizardSSIDPwd: $('#wifiPwd').val() || ""
        };

        $('#nameModified').removeClass("none").text(_('Extended Wireless Network Name has been changed to %s. Please reconnect to the new Wireless Network.', [data.wizardSSID]));

        that.changePage("details", "doneWrap");
        var subStr = objToString(data);
        $.post("goform/setWizard", subStr, function () {
            //console.log("set Wizard success.");
        });
    };
}

$(function () {
    var moduleView = new ModuleView();
    var moduleLogic = new ModuleLogic(moduleView);
    moduleLogic.init();
});