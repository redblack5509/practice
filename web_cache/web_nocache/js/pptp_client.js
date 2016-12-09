var G = {};
var dotNum = 0;
var initObj = null;
var statusTxt = [_("Disconnected"), _("Connected"), _("Connecting")];
var refreshInterval = {};

function getValue() {
    $.getJSON("goform/GetPptpClientCfg?" + Math.random(), initValue);
}

$(function () {
    getValue();
    $("#clientIp, #clientMask, #serverMask").inputCorrect("ip");
    $("#clientEn").on("click", changeClientEn);
    $("[name=clientType]").on("click", changeClientType);
    $("#mppeEn").on("click", changeMppeEn);
    $("#submit").on("click", function () {
        G.validate.checkAll();
    });

    G.validate = $.validate({
        custom: function () {
            if ($("#clientEn").val() == "1") {
                if ($("#domain").val() == "") {
                    $("#domain").focus();
                    return _("Please specify a domain name.");
                }
                if ($("#userName").val() == "") {
                    $("#userName").focus();
                    return _("Please specify a user name.");
                }
                if ($("#password").val() == "") {
                    $("#password").focus();
                    return _("Please specify a password.");
                }
            }

            if ($("#domain").val() == G.data.wanIp) {
                return _("The IP address of the server cannot be the same as the WAN IP address.");
            }
        },

        success: function () {
            preSubmit();
        },

        error: function (msg) {
            if (msg) {
                showErrMsg("msg-err", msg);
            }
            return;
        }
    });

    top.loginOut();
    top.$(".main-dailog").removeClass("none");
    top.$(".save-msg").addClass("none");
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
});

function initValue(obj) {
    G.data = obj;
    initObj = obj;

    $("#clientEn").attr("class", obj.clientEn == "1" ? "btn-off" : "btn-on");
    changeClientEn();

    $("#mppeEn").attr("class", (obj.clientMppe == "1" ? "btn-off" : "btn-on"));
    changeMppeEn();
    if (obj.clientMppeOp.replace(/[^\d]/g, "") != "")
        $("[name='mppeNum'][value='" + obj.clientMppeOp + "']")[0].checked = true;

    if (G.data.clientType === "pptp") {
        $("#mppeWrap").removeClass("none");
        $("[name='clientType']")[0].checked = true;
        $("#vpnStatus").html(statusTxt[parseInt(G.data.pptpStatus, 10)]);
        if ((G.data.pptpIp !== "0") && (G.data.pptpIp !== "") && (G.data.pptpStatus === "1")) {
            $("#vpnIpWrap").removeClass("none").find("#vpnIp").html(G.data.pptpIp);
        } else {
            $("#vpnIpWrap").addClass("none");
        }
    } else {
        $("#mppeWrap").addClass("none");
        $("[name='clientType']")[1].checked = true;
        $("#vpnStatus").html(statusTxt[parseInt(G.data.l2tpStatus, 10)]);
        if ((G.data.l2tpIp !== "0") && (G.data.l2tpIp !== "") && (G.data.l2tpStatus === "1")) {
            $("#vpnIpWrap").removeClass("none").find("#vpnIp").html(G.data.l2tpIp);
            $("#vpnIpLabel").html($("#vpnIpLabel").html().replace("PPTP", "L2TP"));
        } else {
            $("#vpnIpWrap").addClass("none");
        }
    }

    $("#domain").val(obj.domain);
    $("#userName").val(obj.userName);
    $("#password").val(obj.password).initPassword(_(""), false, false);

    /*初始化完页面即刷新*/
    refreshStatus();
    top.initIframeHeight();
}

function refreshStatus() {
    var selectType;
    refreshInterval = setInterval(function () {
        $.GetSetData.getJson("goform/GetPptpClientCfg?" + Math.random(), function (obj) {
            G.data = obj;
            selectType = $("[name='clientType']:checked").val();
            if (obj[selectType + 'Status'] !== "2") {
                if (selectType === "pptp") {
                    $("#mppeWrap").removeClass("none");
                    $("[name='clientType']")[0].checked = true;
                    $("#vpnStatus").html(statusTxt[parseInt(G.data.pptpStatus, 10)]);
                    if ((G.data.pptpIp !== "0") && (G.data.pptpIp !== "") && (G.data.pptpStatus === "1")) {
                        $("#vpnIpWrap").removeClass("none").find("#vpnIp").html(G.data.pptpIp);
                        $("#vpnIpLabel").html($("#vpnIpLabel").html().replace("L2TP", "PPTP"));
                    } else {
                        $("#vpnIpWrap").addClass("none");
                    }
                } else {
                    $("#mppeWrap").addClass("none");
                    $("[name='clientType']")[1].checked = true;
                    $("#vpnStatus").html(statusTxt[parseInt(G.data.l2tpStatus, 10)]);
                    if ((G.data.l2tpIp !== "0") && (G.data.l2tpIp !== "") && (G.data.l2tpStatus === "1")) {
                        $("#vpnIpWrap").removeClass("none").find("#vpnIp").html(G.data.l2tpIp);
                        $("#vpnIpLabel").html($("#vpnIpLabel").html().replace("PPTP", "L2TP"));
                    } else {
                        $("#vpnIpWrap").addClass("none");
                    }
                }
            } else {
                $("#vpnIpWrap").addClass("none");
                dotNum++;
                switch (dotNum % 3) {
                case 0:
                    $("#vpnStatus").html(statusTxt[parseInt(obj[selectType + 'Status'], 10)] + " . . .");
                    break;
                case 1:
                    $("#vpnStatus").html(statusTxt[parseInt(obj[selectType + 'Status'], 10)] + " .");
                    break;
                case 2:
                    $("#vpnStatus").html(statusTxt[parseInt(obj[selectType + 'Status'], 10)] + " . .");
                    break;
                }
            }
        });
    }, 2000);
}

function changeClientEn() {
    var className = $("#clientEn").attr("class");
    if (className == "btn-off") {
        $("#submit").val(_("Connect"));
        $("#clientEn").attr("class", "btn-on");
        $("#clientEn").val(1);
        $("#client_set").removeClass("none");
    } else {
        $("#submit").val(_("Save"));
        $("#clientEn").attr("class", "btn-off");
        $("#clientEn").val(0);
        $("#client_set").addClass("none");
    }
    top.initIframeHeight();
}

function changeClientType() {
    var selectType = $("[name='clientType']:checked").val();
    if (selectType !== G.data.clientType) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    } else {
        refreshStatus();
    }
    if (selectType === "pptp") {
        $("#mppeWrap").removeClass("none");
        $("[name='clientType']")[0].checked = true;
        $("#vpnStatus").html(statusTxt[parseInt(G.data.pptpStatus, 10)]);
        if ((G.data.pptpIp !== "0") && (G.data.pptpIp !== "") && (G.data.pptpStatus === "1")) {
            $("#vpnIpWrap").removeClass("none").find("#vpnIp").html(G.data.pptpIp);
            $("#vpnIpLabel").html($("#vpnIpLabel").html().replace("L2TP", "PPTP"));
        } else {
            $("#vpnIpWrap").addClass("none");
        }
    } else {
        $("#mppeWrap").addClass("none");
        $("[name='clientType']")[1].checked = true;
        $("#vpnStatus").html(statusTxt[parseInt(G.data.l2tpStatus, 10)]);
        if ((G.data.l2tpIp !== "0") && (G.data.l2tpIp !== "") && (G.data.l2tpStatus === "1")) {
            $("#vpnIpWrap").removeClass("none").find("#vpnIp").html(G.data.l2tpIp);
            $("#vpnIpLabel").html($("#vpnIpLabel").html().replace("PPTP", "L2TP"));
        } else {
            $("#vpnIpWrap").addClass("none");
        }
    }
}

function changeMppeEn() {
    var className = $("#mppeEn").attr("class");
    if (className == "btn-off") {
        $("#mppeEn").attr("class", "btn-on");
        $("#mppeEn").val(1);
        $("#mppeNumWrap").removeClass("none");
    } else {
        $("#mppeEn").attr("class", "btn-off");
        $("#mppeEn").val(0);
        $("#mppeNumWrap").addClass("none");
    }
    top.initIframeHeight();
}

function preSubmit() {
    var data,
        subObj = {};

    if ($("#clientEn").val() == 1) {
        subObj = {
            "clientEn": $("#clientEn").val(),
            "clientType": $("[name='clientType']:checked").val(),
            "clientMppe": $("[name='clientType']:checked").val() == "l2tp" ? initObj.clientMppe : $("#mppeEn").val(),
            "clientMppeOp": $("[name='clientType']:checked").val() == "l2tp" ? initObj.clientMppeOp : $("[name='mppeNum']:checked").val(),
            //"clientIp": $("#clientIp").val(),
            //"clientMask": $("#clientMask").val(),
            "domain": $("#domain").val(),
            "userName": $("#userName").val(),
            "password": $("#password").val()
        }
    } else {
        subObj = {
            "clientEn": $("#clientEn").val(),
            "clientType": initObj.clientType,
            "clientMppe": initObj.clientMppe,
            "clientMppeOp": initObj.clientMppeOp,
            //"clientIp": $("#clientIp").val(),
            //"clientMask": $("#clientMask").val(),
            "domain": initObj.domain,
            "userName": initObj.userName,
            "password": initObj.password
        }
    }

    data = objTostring(subObj);

    if ($("#clientEn").val() === "1") { //submit and refresh
        $.post("goform/SetPptpClientCfg", data, function () {
            refreshStatus();
            top.vpnInfo.initValue();
        });
    } else { //submit and close
        $.post("goform/SetPptpClientCfg", data, callback);
    }
}

function callback(str) {
    if (!top.isTimeout(str)) {
        return;
    }
    var num = $.parseJSON(str).errCode;

    top.showSaveMsg(num);
    if (num == 0) {
        top.vpnInfo.initValue();
    }
}