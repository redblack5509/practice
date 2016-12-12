define(function (require, exports, module) {
    var dialogModuleView = new DialogModuleView(),
        dialogModuleLogic = new DialogModuleLogic(dialogModuleView),
        fistPopDialog = true,
        closeTimeFlag = null;

    function moduleLogic() {
        var that = this;

        // notice(for dialog use)
        this.selectedObj = {};
        this.extendInfo = {};

        this.wifiObj = {};

        this.init = function () {
            that.getData();
            that.initEvent();
            dialogModuleLogic.initEvent();
        };
        this.getData = function () {
            //一次性取值或较慢，两模块分别取值
            that.getConnectInfo();
            that.getScanResult();
        };
        this.getConnectInfo = function () {
            var queryData = {
                random: Math.random(),
                module1: "connectInfo"
            };

            clearInterval(that.timer);
            that.timer = null;
            $(".main-footer button").addClass("none");

            $.GetSetData.setData("goform/getWifiRelay", queryData, function (obj) {
                var seconds = 1,
                    connectTime;

                that.extendInfo = $.parseJSON(obj).connectInfo;
                if ($.parseJSON(obj).timeout) {
                    //alert("扫描超时");
                    return;
                }
                connectTime = parseDecimalInt(that.extendInfo.connectDuration);

                $("#upperWifiSsid").text(that.extendInfo.upperWifiSsid);
                $("#upperWifiSsid").attr("title", that.extendInfo.upperWifiSsid);
                showConnectStatus(that.extendInfo.connectState);

                if (that.extendInfo.connectState === "2") {
                    /*success*/
                    $("#connectDuration").html(formatSeconds(connectTime));
                    that.timer = setInterval(function () {
                        $("#connectDuration").html(formatSeconds(connectTime + seconds));
                        seconds++;
                    }, 1000);
                } else {
                    $("#connectDuration").html("");
                }
            });
        };
        this.getScanResult = function () {
            var scanResult,
                seconds = 1;

            var queryData = {
                random: Math.random(),
                module1: "wifiScan"
            };

            //获取之前隐藏表头
            $("#wifiScan").prev().addClass("invisible");
            $("#refreshTable").addClass("none");
            $("#loading").removeClass("none");
            $("#wifiScanTbody").html("");

            $.GetSetData.setData("goform/getWifiRelay", queryData, function (obj) {
                $("#loading").addClass("none");
                $("#refreshTable").removeClass("none");

                //显示表头
                $("#wifiScan").prev().removeClass("invisible");

                var timeoutStr = '<tr><td colspan="3" class="text-danger">' + _("SSID Scanning timed out!") + '</td></tr>';

                try {
                    scanResult = $.parseJSON(obj).wifiScan;
                    var len = scanResult.length;
                } catch (e) {
                    $('#wifiScanTbody').html(timeoutStr);
                    return;
                }

                if ($.parseJSON(obj).timeout) {
                    $('#wifiScanTbody').html(timeoutStr);
                    return;
                }

                createTable(scanResult);
                top.pageLogic.initModuleHeight();
            });

        };

        this.initEvent = function () {
            $("#refreshTable").on("click", that.getScanResult);

            // 弹出扩展框
            $("#wifiScan").delegate('input[type="radio"]', "click", popExtendDialog);
        };

        function showConnectStatus(status) {
            var str = "",
                stArr = [_("Not Connected"), _("Connected"), _("Password Error"), _("Not Setup")];

            status = +status;
            if (status === 1) { //未连接
                str = "text-primary";
            } else if (status === 2) { //扩展成功
                str = "text-success";
            } else if (status === 4) {
                str = "text-warning1";
            } else { //错误;
                str = "text-danger"; //密码错误
            }

            //class中用于表示颜色的类(text-primary, text-success, text-danger)去掉后再添加，防止因css类定义样式位置的先后影响实际生效的class@windy
            $("#connectState").attr("class", "form-control-static").addClass(str).html(stArr[status - 1]);
        }

        /**********创建ssid表格**************/
        function createTable(obj) {
            var tableStr = '';
            var ssidList = filterSsid(obj);
            var listObj = ssidList.sort(function (a, b) {
                if (parseDecimalInt(a.wifiScanSignalStrength) > parseDecimalInt(b.wifiScanSignalStrength)) {
                    return -1;
                } else {
                    return 1;
                }
            });
            var noSsidStr = '<tr><td colspan="3" class="text-content-2">' + _("There are no active Broadband Routers or Access Points within range.") + '</td></tr>' + '<tr><td colspan="3" class="text-content-2">' + _("Please check your Broadband Router or Access Point is switched on or reposition the Wi-Fi Extender to be closer.") + '</td></tr>';

            //未扫描到ssid，此时已过滤不显示的ssid
            if (ssidList.length === 0) {
                $('#wifiScanTbody').html('');
                $('#wifiScanTbody').append(noSsidStr);
                return;
            }
            that.wifiObj = listObj;

            var trBackColor = "";

            for (var i = 0, l = listObj.length; i < l; i++) {

                if (i % 2 == 0) {
                    trBackColor = "bk-white";
                } else {
                    trBackColor = "bk-gray";
                }

                tableStr = '<tr class="' + trBackColor + '" index="' + i + '"><td style="width: 20%"><input type="radio" name="wifiSelect"/></td>';
                tableStr += '<td style="width: 30%" class="fixed text-content-1 extend-scan-target" title=""></td>';

                signal = parseDecimalInt(listObj[i].wifiScanSignalStrength);
                if (signal >= -45) {
                    signal = "signal-4";
                } else if (signal < -45 && signal >= -60) {
                    signal = "signal-3";
                } else if (signal < -60 && signal >= -74) {
                    signal = "signal-2";
                } else {
                    signal = "signal-1";
                }
                tableStr += '<td style="width: 25%;text-align:right;padding-right:10px;"><span class="' + signal + ' scan-icon"></span>';

                if (listObj[i].wifiScanSecurityMode !== "NONE") {
                    tableStr += '<span class="icon-lock scan-icon"><input type="hidden" value=' + listObj[i].wifiScanSecurityMode + '><input type="hidden" value=' + listObj[i].wifiScanChannel + '></span>';
                } else {
                    tableStr += '<span><input type="hidden" value="NONE"/></span>';
                }

                tableStr += '</td></tr>';
                $('#wifiScanTbody').append(tableStr);
                $('#wifiScanTbody').find(".extend-scan-target").attr("title", listObj[i].wifiScanSSID);
                $('#wifiScanTbody').find(".extend-scan-target").text(listObj[i].wifiScanSSID);
                $('#wifiScanTbody').find(".extend-scan-target").removeClass("extend-scan-target");
            }

        }

        /*******选择ssid******/
        function popExtendDialog() {
            var selectedIndex,
                ssid,
                signal,
                securityMode;

            selectedIndex = $(this).parents('tr').attr('index');
            that.selectedObj = that.wifiObj[selectedIndex];
            signal = that.selectedObj.wifiScanSignalStrength;

            if (that.selectedObj.wifiScanSecurityMode === "UNKNOW") {
                top.pageLogic.showModuleMsg(_("The encryption of the base station is WEP. The extender doesn't support this encryption (WEP)."));
                return;
            }

            // signal weak
            if (parseDecimalInt(signal) < -72) {
                top.pageLogic.showModuleMsg(_("The selected Wi-Fi signal is weak. For stable connection, move the extender close to the wireless router or access point."));
            }

            showDialog("re-extend-wrapper", '', "300");
            //只初始化内容
            dialogModuleView.initHtml();
            reInitDialogHeight("re-extend-wrapper");

        }

        // parse decimal int
        function parseDecimalInt(num) {
            return parseInt(num, 10);
        }

        /***Time format XX天 XX小时 XX分 XX秒***/
        function formatSeconds(value) {
            var result = "",
                second = parseDecimalInt(value),
                minute = 0,
                hour = 0,
                day = 0;

            if (second > 60) {
                minute = parseDecimalInt(second / 60);
                second = parseDecimalInt(second % 60);

                if (minute > 60) {
                    hour = parseDecimalInt(minute / 60);
                    minute = parseDecimalInt(minute % 60);
                    if (hour > 24) {
                        day = parseDecimalInt(hour / 24);
                        hour = parseDecimalInt(hour % 24);
                    }
                }
            }

            result = "" + parseDecimalInt(second) + _("s");
            if (minute > 0) {
                result = "" + parseDecimalInt(minute) + _("min") + " " + result;
            }
            if (hour > 0) {
                result = "" + parseDecimalInt(hour) + _("h") + " " + result;
            }
            if (day > 0) {
                result = "" + parseDecimalInt(day) + _("day") + " " + result;
            }

            return result;
        }

    }

    function DialogModuleLogic(view) {
        var that = this;

        this.initEvent = function () { //初始化事件
            $("#ok").on("click", function () {
                view.validate.checkAll();
            });

            $("#back").on("click", function () {
                $("#backWrap").addClass("none");
                $("#doneWrap").addClass("none");
                $("#savedWrap").addClass("none");
                $("#details").removeClass("none");
            });

            $('.iframe-close').on("click", function () {
                clearTimeout(closeTimeFlag);
                closeIframe("re-extend-wrapper");
            });

            view.validate.init();
            //$("#keepUpper").on("click", view.checkKeepUppserStauts);

            // For IE6 not suppost change input type
            /* var newInput,
                 $ele = $("#extenderPwd");
             if (isSupChangeType($ele)) {
                 $('#iconContainer').on('click', '.icon-show', function () {
                     $(this).removeClass('icon-show').addClass('icon-hide');
                     $ele.attr('type', "text");
                 });
                 $('#iconContainer').on('click', '.icon-hide', function () {
                     $(this).removeClass('icon-hide').addClass('icon-show');
                     $ele.attr('type', "password");
                 });
             } else {
                 //newInput = createTextInput(document.getElementById('extenderPwd'), "iconContainer");
             }*/

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
                        rel5 = /(BTWifi)+|(Auto-BT)+|(BTOpenzone)+|(BTFON)/i,
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
                        return _("The wireless SSID must not contain the text \"BTWifi\", \"Auto-BT\", \"BTOpenzone\" or \"BTFON\" (Case insensitive)")
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

            /*var newInput1,
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
            }*/
            $("#wifiPwd").initPassword(_(""));
        };
    }

    function DialogModuleView() {
        var selectedObj;
        var extendInfo;
        var that = this;

        this.initHtml = function (obj) {

            selectedObj = pageLogic.modules.selectedObj;
            extendInfo = pageLogic.modules.extendInfo;
            var securityMode = selectedObj.wifiScanSecurityMode;

            // defaultExtendSsid = extendInfo.extenderSsid || selectedObj.wifiScanSSID;

            //初始化显示
            //$("#extenderName").val(extendInfo.extenderSsid);
            //$("#extenderPwd").val(extendInfo.extenderPwd);

            $("#details").removeClass("none");
            $("#doneWrap").addClass("none");

            if (securityMode === 'NONE') {
                $('#wifiPwdCon').addClass("none");
            } else {
                $('#wifiPwdCon').removeClass("none");
                $('#wifiPwd').val('').attr({
                    disabled: false
                });

            }

            $('#wifiPwd_').parent().find(".placeholder-text").css("width", "285px");
            $("#wifiName").text(selectedObj.wifiScanSSID);
            $("#wifiName").attr("title", selectedObj.wifiScanSSID);
            var extendSsid = "";
            if (selectedObj.wifiScanSSID.length <= 28) {
                extendSsid = "EXT-" + selectedObj.wifiScanSSID;
            } else {
                extendSsid = "EXT-" + selectedObj.wifiScanSSID.slice(0, 28);
            }
            $("#extenderName").val(extendSsid);
        };

        //检查静扩展器名称的合法性
        function checkWifiData() {
            return "";
        }

        this.validate = $.validate({
            custom: function () {},

            success: function () {
                var msg;
                msg = checkWifiData();
                if (msg) {
                    alert(msg);
                    return;
                }

                $("#extendStatus").html(_("Connecting…Please wait..."));
                $("#details, #savedWrap, #nameModified").addClass("none");
                $("#doneWrap, #savingWrap").removeClass("none");
                that.preSubmit();
            },

            error: function (msg) {}
        });

        //提交数据
        this.preSubmit = function () {
            selectedObj = pageLogic.modules.selectedObj;
            //var checked = $("#keepUpper").prop("checked");
            var data = {
                module1: "setExtenderWifi",
                wifiRelaySSID: $("#wifiName").text() || "",
                wifiRelaySecurityMode: selectedObj.wifiScanSecurityMode || "",
                wifiRelayPwd: $('#wifiPwd').val() || "",
                wifiRelayChannel: selectedObj.wifiScanChannel || "",
                //  module2: "setWifiInfo",
                wizardSSID: $("#extenderName").val() || "",
                wizardSSIDPwd: $("#wifiPwd").val() || ""
            };

            var subStr = objToString(data);

            $.post("goform/setWifiRelay", subStr, function (str) {
                var num = $.parseJSON(str).errCode;
                if (num == "0") {
                    endSetup();
                }
            });
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
    //最后设置
    function endSetup() {
        var checkBridgeT = null,
            timer = 0,
            bridgeReturnFlag = false; //是否请求进入了回调
        var ssidVal = $("#extenderName").val() || "";

        checkBridgeT = setInterval(function () {
            //根据上一秒的数据进行判断
            if (timer > (30000 / 500)) {
                clearInterval(checkBridgeT);

                if (bridgeReturnFlag) { //如果30s时有返回
                    $("#savingWrap").addClass("none");
                    $("#savedWrap").removeClass("none");
                    $("#successinternetWrap").addClass("none");
                    $("#savedWrap .content").html("&nbsp;").removeClass("icon-success").addClass("icon-cancel");
                    $('#nameModified').removeClass("none").html(_("Timed Out! Please extend again!"));
                    closeDialog();
                } else {
                    $("#savingWrap").addClass("none");
                    $("#savedWrap").removeClass("none");
                    $("#successinternetWrap").removeClass("none");
                    $("#savedWrap .content").html("&nbsp;").addClass("icon-success").removeClass("icon-cancel");
                    $('#nameModified').removeClass("none").html(_('Extended Wireless Network Name has been changed to %s.Please reconnect to the new Wireless Network.', [ssidVal]));
                }

            } else {
                timer++;
            }

            /*************获取数据*******/
            bridgeReturnFlag = false;
            $.GetSetData.getJson("goform/getStatusBeforeBridge", function (data) {
                bridgeReturnFlag = true;
                // 0:disconnected  1:connected  2:connecting  3: password error
                if (data.extended === "0") {
                    clearInterval(checkBridgeT);
                    $("#savingWrap").addClass("none");
                    $("#savedWrap").removeClass("none");
                    $("#savedWrap .content").html("&nbsp;").removeClass("icon-success").addClass("icon-cancel");
                    $("#successinternetWrap").addClass("none");
                    $('#nameModified').removeClass("none").html(_("Failed to extend. Please extend again!"));
                    closeDialog();
                } else if (data.extended === "1") {
                    clearInterval(checkBridgeT);
                    $("#savingWrap").addClass("none");
                    $("#savedWrap").removeClass("none");
                    $("#successinternetWrap").removeClass("none");
                    $("#savedWrap .content").html("&nbsp;").addClass("icon-success").removeClass("icon-cancel");
                    $('#nameModified').removeClass("none").text(_('Extended Wireless Network Name has been changed to %s.Please reconnect to the new Wireless Network.', [ssidVal]));
                    //closeDialog();
                } else if (data.extended === "3") {
                    clearInterval(checkBridgeT);
                    $("#savingWrap").addClass("none");
                    $("#savedWrap").removeClass("none");
                    $("#savedWrap .content").html("&nbsp;").removeClass("icon-success").addClass("icon-cancel");
                    $("#successinternetWrap").addClass("none");
                    $('#nameModified').removeClass("none").html(_("Not connected. <br />Please check the Wi-Fi Password you entered and try again."));
                    //closeDialog();
                    $("#backWrap").removeClass("none");
                }
            });
        }, 500);
    }

    function closeDialog() {
        closeTimeFlag = setTimeout(function () {
            top.closeIframe("re-extend-wrapper");
            //刷新扫描数据
            top.pageLogic.modules.getData();
        }, 4000);
    }
    module.exports = new moduleLogic();
});