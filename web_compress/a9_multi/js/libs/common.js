//处理ajax 错误时，刷新整个页面
$(document).ajaxError(function () {
    //top.location.reload(true);
});

/********判断是否同网段****************/
function checkIpInSameSegment(ip_lan, mask_lan, ip_wan, mask_wan) {
    if (ip_lan === '' || ip_wan === '') {
        return false;
    }
    var ip1Arr = ip_lan.split("."),
        ip2Arr = ip_wan.split("."),
        maskArr1 = mask_lan.split("."),
        maskArr2 = mask_wan.split("."),
        maskArr = maskArr1,
        i;
    for (i = 0; i < 4; i++) {
        if (maskArr1[i] != maskArr2[i]) {
            if (maskArr1[i] & maskArr2[i] == maskArr1[i]) {
                maskArr = maskArr1;
            } else {
                maskArr = maskArr2;
            }
            break;
        }
    }
    for (i = 0; i < 4; i++) {
        if ((ip1Arr[i] & maskArr[i]) != (ip2Arr[i] & maskArr[i])) {
            return false;
        }
    }
    return true;
}

/***********检查IP 是否为网段或广播IP合法性*/
function checkIsVoildIpMask(ip, mask, str) {
    var ipArry,
        maskArry,
        len,
        maskArry2 = [],
        netIndex = 0,
        netIndex1 = 0,
        broadIndex = 0,
        i = 0;
    str = str || _("IP Address");
    //ip = document.getElementById(ipElem).value;
    //mask = document.getElementById(maskElem).value;

    ipArry = ip.split("."),
    maskArry = mask.split("."),
    len = ipArry.length;

    for (i = 0; i < len; i++) {
        maskArry2[i] = 255 - Number(maskArry[i]);
    }

    for (var k = 0; k < 4; k++) { // ip & mask
        if ((ipArry[k] & maskArry[k]) == 0) {
            netIndex1 += 0;
        } else {
            netIndex1 += 1;
        }
    }
    for (var k = 0; k < 4; k++) { // ip & 255 - mask
        if ((ipArry[k] & maskArry2[k]) == 0) {
            netIndex += 0;
        } else {
            netIndex += 1;
        }
    }

    if (netIndex == 0 || netIndex1 == 0) {
        //document.getElementById(ipElem).focus();
        return _("%s can't be the network segment.", [str]);
    }

    for (var j = 0; j < 4; j++) {
        if ((ipArry[j] | maskArry[j]) == 255) {
            broadIndex += 0;
        } else {
            broadIndex += 1;
        }
    }

    if (broadIndex == 0) {
        //document.getElementById(ipElem).focus();
        return _("%s can't be the broadcast address.", [str]);
    }

    return;
}


/*********对象转换成字符串****************/
function objToString(obj) {
    var str = "",
        prop;
    for (prop in obj) {
        str += prop + "=" + encodeURIComponent(obj[prop]) + "&";
    }
    str = str.replace(/[&]$/, "");
    return str;
}

/**********赋值*************/
function inputValue(obj, callback) {
    var prop,
        tagName;

    for (prop in obj) {
        if (prop && $("#" + prop).length > 0) {
            tagName = document.getElementById(prop).tagName.toLowerCase();
            switch (tagName) {
            case "input":
            case "select":
                if (document.getElementById(prop).type == "checkbox") {
                    if (obj[prop] == "true") {
                        document.getElementById(prop).checked = true;
                    } else {
                        document.getElementById(prop).checked = false;
                    }
                } else {
                    $("#" + prop).val(obj[prop]);
                }
                break;
            default:
                if ($("#" + prop).hasClass("textboxs") || $("#" + prop).hasClass("input-append")) {
                    $("#" + prop)[0].val(obj[prop]);
                } else {
                    $("#" + prop).text(obj[prop]);
                }
                break;
            }
        } else if (prop && $("[name='" + prop + "']").length > 1) {
            if ($("[name='" + prop + "']").is("input")) {
                if ($("[name='" + prop + "'][value='" + obj[prop] + "']").length > 0) {
                    $("[name='" + prop + "'][value='" + obj[prop] + "']")[0].checked = true;
                }
            } else if ($("[name='" + prop + "']").is("span")) {
                $("[name='" + prop + "']").text(obj[prop]);
            }
        }
    };
    if (typeof callback == "function") {
        callback.apply();
    }
}

//处理时间变成 天 时分秒
function formatSeconds(value) {
    var theTime = parseInt(value); // 秒 
    var theTime1 = 0; // 分 
    var theTime2 = 0; // 小时
    var theTime3 = 0; // 天
    // alert(theTime); 
    if (theTime > 60) {
        theTime1 = parseInt(theTime / 60);
        theTime = parseInt(theTime % 60);
        // alert(theTime1+"-"+theTime); 
        if (theTime1 > 60) {
            theTime2 = parseInt(theTime1 / 60);
            theTime1 = parseInt(theTime1 % 60);
            if (theTime2 > 24) {
                theTime3 = parseInt(theTime2 / 24);
                theTime2 = parseInt(theTime2 % 24);
            }
        }
    }
    var result = "" + parseInt(theTime) + _("s");
    if (theTime1 > 0) {
        result = "" + parseInt(theTime1) + _("m") + " " + result;
    }
    if (theTime2 > 0) {
        result = "" + parseInt(theTime2) + _("h") + " " + result;
    }
    if (theTime3 > 0) {
        result = "" + parseInt(theTime3) + _("d") + " " + result;
    }
    return result;
}

function Encode() {
    var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    function utf16to8(str) {
        var out,
            i,
            len,
            c;

        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }

    function base64encode(str) {
        var out,
            i,
            len;
        var c1,
            c2,
            c3;

        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += '=';
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    }
    return function (s) {
        return base64encode(utf16to8(s));
    }
}

function Decode() {
    var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

    function base64decode(str) {
        var c1, c2, c3, c4;
        var i, len, out;
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {

            do {
                c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c1 == -1);
            if (c1 == -1)
                break;

            do {
                c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c2 == -1);
            if (c2 == -1)
                break;
            out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

            do {
                c3 = str.charCodeAt(i++) & 0xff;
                if (c3 == 61)
                    return out;
                c3 = base64DecodeChars[c3];
            } while (i < len && c3 == -1);
            if (c3 == -1)
                break;
            out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

            do {
                c4 = str.charCodeAt(i++) & 0xff;
                if (c4 == 61)
                    return out;
                c4 = base64DecodeChars[c4];
            } while (i < len && c4 == -1);
            if (c4 == -1)
                break;
            out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
        }
        return out;
    }

    function utf8to16(str) {
        var out, i, len, c;
        var char2, char3;
        out = "";
        len = str.length;
        i = 0;
        while (i < len) {
            c = str.charCodeAt(i++);
            switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += str.charAt(i - 1);
                break;
            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
            }
        }
        return out;
    }

    return function (s) {
        return utf8to16(base64decode(s));
    }
}

/********获取随机数**************/
function getRandom() {
    return "?random=" + Math.random();
}


/********模块化***************/
function ModuleView() {
    var that = this;
    this.rebootIP = null; //重启IP
    this.moduleRequireObj = {};
    this.getValue = function (url, requireObj) { //获取数据
        that.url = url;
        that.moduleRequireObj = requireObj;
        $.GetSetData.setData(url, $.extend({
            random: Math.random()
        }, requireObj), function (obj) {
            var jsonObj = $.parseJSON(obj);
            that.initValue(jsonObj);
        });
    };

    this.initValue = function (obj) {

    };

    this.showInvalidError = function (str) { //显示错误提示
        pageLogic.showModuleMsg(str);
    };
    this.successCallback = function (str) { //成功之后的回调
        var num = $.parseJSON(str).errCode || "-1";
        var ip = that.rebootIP || "";
        if (num == 0) { //success
            pageLogic.showModuleMsg(_("Saved successfully!"));
            that.getValue(that.url, that.moduleRequireObj);
        } else if (num == "2") {
            pageLogic.showModuleMsg(_("Old Password is incorrect."));
        } else if (num == "100") {
            progressLogic.init("", "reboot", 200, ip);
        } else if (num == "101") { // 新密码不为空
            top.location.href = "./login.html";
        } else if (num == "102") { // 新密码为空
            pageLogic.showModuleMsg(_("Saved successfully!"));
            that.getValue(that.url, {
                module1: "sysPwd",
                module2: "firmware"
            });
        }

        $("#submit").removeAttr("disabled");
    };

    this.showErrMsg = function () { //提交错误函数
        pageLogic.showModuleMsg(_("Upload data error!"));
        $("#submit").removeAttr("disabled");
    };
}

function ModuleSubmit() {
    this.preSubmit = function (obj) {
        $.ajax({
            url: obj.url,
            type: "POST",
            data: obj.subData,
            success: obj.successCallback,
            error: obj.errorCallback
        });
        $("#submit").attr("disabled", true);
    };
}

function reInitDialogHeight(_id) {
    var height = parseInt($("#" + _id + " .dialog-content").css("height"), 10) + 100;

    height = height > 350 ? height : 350; //保证基本高度

    top.$(".main-dailog").css({
        "top": "50%",
        "margin-top": -height / 2 - 30 + "px",
        "height": height + "px"
    });
    if (top.$(".main-dailog").offset().top < 0) {
        top.$(".main-dailog").css({
            "top": "10px",
            "margin-top": "0"
        });
    }
}

function showDialog(Id, width, height, extraDataStr) {
    extraDataStr = extraDataStr || "";
    if (!$('#progress-overlay').hasClass('in')) {
        $('#progress-overlay').addClass('in');
    }

    $("#" + Id).removeClass("none");
    //位置调整
    $(".dailog-iframe").css("width", width + "px");
    $(".main-dailog").css({
        "top": "50%",
        "padding-left": "0px",
        "padding-right": "0px",
        "margin-top": -$(".main-dailog").outerHeight() / 2 + "px"
    });

    $("#" + Id + " .head_title2").addClass("none").removeClass("selected");
    $(".fopare-ifmwrap-title").removeClass("border-bottom");
    $("#" + Id + " .head_title").removeClass("selected");
}

function closeIframe(dialogId) {
    $("#" + dialogId).addClass("none");
    $('#progress-overlay').removeClass('in');
}

/**
 * 获取数据包装
 */

/**
 * [GetSetData description]
 * @type {Object}
 */

if (window.JSON) {
    $.parseJSON = JSON.parse;
}

$.GetSetData = {
    getData: function (url, handler) {
        if (url.indexOf("?") < 0) {
            url += "?" + Math.random();
        }
        $.ajax({
            url: url,
            cache: false,
            type: "get",
            dataType: "text",
            async: true,
            success: function (data, status) {
                if (data.indexOf("login.js") > 0) {
                    top.location.href = "login.html";
                    return;
                }

                if (typeof handler == "function") {
                    handler.apply(this, arguments);
                }
            },
            error: function (msg, status) {
                //Debug.log("get Data failed,msg is ", msg);
                if (typeof handler == "function") {
                    handler.apply(this, arguments);
                }
            },
            complete: function (xhr) {
                xhr = null;
            }
        });

    },
    getDataSync: function (url, handler) {
        if (url.indexOf("?") < 0) {
            url += "?" + Math.random();
        }
        $.ajax({
            url: url,
            cache: false,
            type: "get",
            dataType: "text",
            async: false,
            success: function (data, status) {
                if (data.indexOf("login.js") > 0) {
                    top.location.href = "login.html";
                    return;
                }

                if (typeof handler == "function") {
                    handler.apply(this, arguments);
                }
            },
            error: function (msg, status) {
                //Debug.log("get Data failed,msg is ", msg);
                if (typeof handler == "function") {
                    handler.apply(this, arguments);
                }
            },
            complete: function (xhr) {
                xhr = null;
            }
        });
    },
    getJson: function (url, handler) {
        this.getData(url, function (data) {
            handler($.parseJSON(data));
        });
    },
    getHtml: function (elems, url, handler) {
        this.getData(url, function (data, status) {
            if (status == "success") {
                elems.html(data);
            }
            handler(status);
            data = null;
            elems = null;
        });
    },
    setData: function (url, data, handler) {
        var ajaxSet = $.ajax({
            url: url,
            cache: false,
            type: "get",
            dataType: "text",
            async: true,
            data: data,
            timeout: 10000,
            success: function (data) {
                if (data.indexOf("login.js") > 0) {
                    top.location.href = "login.html";
                    return;
                }
                if ((typeof handler).toString() == "function") {
                    handler(data);
                }
            },
            complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
                　　　　
                if (status == 'timeout' || status == "error") { //超时,status还有success,error等值的情况　　　　
                    ajaxSet.abort();

                    //以下只处理扫描操作
                    if (url != "goform/getWizard" && url != "goform/getWifiRelay") {
                        return;
                    }

                    //超时时调用超时处理
                    if ((typeof handler).toString() == "function") {
                        handler('{"timeout": true}');
                    }
                }
            }
        });
    }
};

/**
 * [createTextInput: Create text input]
 * @param  {[String]} elem [ID of Input Element]
 * @param  {[DOM Object]} wrapper [input contaniner]
 */
function createTextInput(elem, wrapper) {
    var $elem = $(elem),
        newField = document.createElement('input'),
        $newField;

    newField.setAttribute("type", "text");
    newField.setAttribute("maxLength", elem.getAttribute("maxLength"));
    newField.setAttribute("id", elem.id + "_");
    newField.className = elem.className;
    newField.setAttribute("placeholder", elem.getAttribute("placeholder") || "");
    if (elem.getAttribute('data-options')) {
        newField.setAttribute("data-options", elem.getAttribute('data-options'));
    }

    if (elem.getAttribute('required')) {
        newField.setAttribute("required", elem.getAttribute('required'));
    }
    elem.parentNode.insertBefore(newField, elem);
    $newField = $(newField);

    $('#' + wrapper).on('click', '.icon-show', function () {
        $(this).removeClass('icon-show').addClass('icon-hide');
        newField.value = elem.value;
        $elem.hide();
        $newField.show();
    });
    $('#' + wrapper).on('click', '.icon-hide', function () {
        $(this).removeClass('icon-hide').addClass('icon-show');
        elem.value = newField.value;
        $newField.hide();
        $elem.show();
    });

    if (elem.value !== "") {
        $elem.hide();
        $newField.show();
    } else {
        $newField.hide();
        newField.value = elem.value;
    }

    return newField;
}

/**
 * Escape text for attribute or text content.
 */
function escapeText(s) {
    if (!s) {
        return "";
    }
    s = s + "";

    // Both single quotes and double quotes (for attributes)
    return s.replace(/['"<>&]/g, function (s) {
        switch (s) {
        case "'":
            return "&#039;";
        case "\"":
            return "&quot;";
        case "<":
            return "&lt;";
        case ">":
            return "&gt;";
        case "&":
            return "&amp;";
        }
    });
}

//过滤某些ssid
function filterSsid(ssidList) {
    var len = ssidList.length,
        i = 0,
        rel = /^(Auto-BT)|^(BTOpenzone)|^(BTWifi)|^(BTFON)|^(BTWi-fi)/i,
        ssid,
        newList = [];
    if (len == 0) {
        return [];
    }

    for (i = 0; i < len; i++) {
        ssid = ssidList[i].wifiScanSSID;
        if (rel.test(ssid)) {
            continue;
        }

        newList.push(ssidList[i]);
    }

    return newList;
}