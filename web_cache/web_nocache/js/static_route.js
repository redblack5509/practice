var G = {};
var listMax = 0;
var wanIp = "";
$(function () {
    getValue();
    $("#submit").on("click", function () {
        preSubmit();
    });

    $("#network").inputCorrect("ip");
    $("#gateway").inputCorrect("ip");
    $("#mask").inputCorrect("ip");
    $("#network, #mask").on("blur", function() {
        var routeArray = [];
        var maskArray = [];
        var routeStr = $("#network").val(),
            maskStr = $("#mask").val(),
            str = "";
        if((routeStr !== "") && (maskStr !== "")) {
            maskArray = maskStr.split(".");
            routeArray = routeStr.split(".");
            if((maskArray.length == 4) && (routeArray.length == 4)) {
                for(var index = 0 ; index < 4 ; index++)
                {
                    str += (maskArray[index] & routeArray[index]);
                    if(index != 3) {
                         str += '.';
                    }
                }
                $('#network').val(str);
            }
        }
    });

    checkData();
    top.loginOut();
    top.initIframeHeight();
    $(".add").on("click", function () {
        G.validate.checkAll();
    });
    $("#portList").delegate(".del", "click", delList);
    $(".input-append ul").on("click", function (e) {
        $("#gateway")[0].value = ($(this).parents(".input-append").find("input")[0].value || "");
    });
    top.$(".main-dailog").removeClass("none");
    top.$(".save-msg").addClass("none");
});

function addList() {
    var str = "",
        addNum = 0;
    $("#portBody tr").each(function() {
        if($(this).find("td:eq(4)").children('span').length === 0) {
            addNum++;
        }
    });
    if (addNum >= 10) {
        $("#msg-err").html(_("Up to %s rules is allowed.",[10]));
        return;
    }

    str += "<tr>";
    str += "<td title='" + _("This route will not take effect") + "' id='network" + (listMax + 1) + "'>" + $("#network").val() + "</td>";
    str += "<td title='" + _("This route will not take effect") + "' id='mask" + (listMax + 1) + "'>" + $("#mask").val() + "</td>";
    str += "<td title='" + _("This route will not take effect") + "' alt='gateway' id='gateway" + (listMax + 1) + "'>" + $("#gateway").val() + "</td>";
    str += "<td title='" + _("This route will not take effect") + "'>---</td>";
    str += "<td><input type='button' value='" + _("Delete") + "' class='btn del btn-small'></td></tr>";

    $("#portBody").append(str);
    $("#network").val("");
    $("#mask").val("");
    $("#gateway").val("");
    listMax++;
    top.initIframeHeight();
};

function delList() {
    var data;
    $(this).parent().parent().remove();
    top.initIframeHeight();
}

function checkData() {
    G.validate = $.validate({
        custom: function () {
            var network = "",
            gateway = "",
            mask = "",
            str = "",
            i = 0;

            network = $("#network").val();
            mask = $("#mask").val();
            gateway = $("#gateway").val();

            if($.validate.valid.routeCheck.all(network)) {
                $("#network").focus();
                return $.validate.valid.routeCheck.all(network);
            }
            if($.validate.valid.mask.all(mask)) {
                $("#mask").focus();
                return $.validate.valid.mask.all(mask);
            }
            if($.validate.valid.ip.all(gateway)) {
                $("#gateway").focus();
                return $.validate.valid.ip.all(gateway);
            }

            /*判断目标网络是否重复*/
            var netExist = false;
            $("#portBody tr").each(function() {
                var existIP = $(this).find("td:eq(0)").html();

                if (network == existIP) {
                    netExist = true;
                    return false;
                }
            });

            if(netExist) {
                return _("The destination network already exists.");
            }

        },

        success: function () {
            addList();
        },

        error: function (msg) {
            if (msg) {
                $("#msg-err").html(msg);
                setTimeout(function () {
                    $("#msg-err").html("&nbsp;");
                }, 3000);
            }
            return;
        }
    });
}


function getValue() {
    $.getJSON("goform/GetStaticRouteCfg?" + Math.random(), initValue);
}

function initValue(obj) {
    var list = obj.routeList,
        i = 0,
        str = "";

    wanIp = obj.wanIp;

    for (i = 0; i < list.length; i++) {
        str += "<tr>";
        if (list[i].effective === "1") {
            str += "<td id='network" + (i + 1) + "'>" + (list[i].network || "") + "</td>";
            str += "<td id='mask" + (i + 1) + "'>" + (list[i].mask || "") + "</td>";
            str += "<td alt='gateway' id='gateway" + (i + 1) + "'>" + (list[i].gateway || "") + "</td>";
            str += "<td alt='interface' id='interface" + (i + 1) + "'>" + (list[i].ifname || "") + "</td>";
        } else {
            str += "<td title='" + _("This route will not take effect") + "' id='network" + (i + 1) + "'>" + (list[i].network || "") + "</td>";
            str += "<td title='" + _("This route will not take effect") + "' id='mask" + (i + 1) + "'>" + (list[i].mask || "") + "</td>";
            str += "<td title='" + _("This route will not take effect") + "' alt='gateway' id='gateway" + (i + 1) + "'>" + (list[i].gateway || "") + "</td>";
            str += "<td title='" + _("This route will not take effect") + "' alt='interface' id='interface" + (i + 1) + "'>" + (list[i].ifname || "") + "</td>";
        }
        
   

        if(list[i].operateType === "1") {
            str += "<td><input type='button' value='" + _("Delete") + "' class='btn del btn-small'></td></tr>";
        } else {
            str += "<td><span>" + _("System") + "</span></td></tr>";
        }

    }
    listMax = list.length;
    $("#portBody").html(str);
    top.initIframeHeight();
}

function preSubmit() {
    $("#msg-err").html("&nbsp;");
    var trArry = $("#portBody").children(),
        len = trArry.length,
        i = 0,
        data = "list=";
    for (i = 0; i < len; i++) {
        if($(trArry[i]).children().eq(4).children().hasClass("del")) {
            data += $(trArry[i]).children().eq(0).html() + ",";
            data += $(trArry[i]).children().eq(1).html() + ",";
            data += $(trArry[i]).children().eq(2).html();
            data += "~";
        }
    }
    data = data.replace(/[~]$/, "");
    $.post("goform/SetStaticRouteCfg", data, callback);

}

function callback(str) {
    if (!top.isTimeout(str)) {
        return;
    }
    var num = $.parseJSON(str).errCode;


    top.showSaveMsg(num);
    if (num == 0) {
        //getValue();
        top.advInfo.initValue();
    }
}