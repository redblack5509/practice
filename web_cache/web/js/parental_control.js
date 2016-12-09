// JavaScript Document

$(function() {
    var G_current_operate; //"1":add   "0":edit
    top.loginOut();

    getDevice();

    top.$("#head_title").off("click").on("click", showParentDeviceWrap);
    top.$("#head_title2").off("click").on("click", showRuleList);

    $("table").on("click", ".edit-new", getParentControl);
    $("#parental_list").on("click", ".add", addParentControl);
    $("table").on("click", ".enable", function() {
        $(this).removeClass("enable").addClass("disable").attr("title", _("Click to disable control"));
        var mac = $(this).parents("tr").find("td:eq(2)").attr("title");
        $.post("goform/parentControlEn", {
            mac: mac,
            isControled: "1"
        });
    });
    $("table").on("click", ".disable", function() {
        $(this).removeClass("disable").addClass("enable").attr("title", _("Click to enable control"));
        var mac = $(this).parents("tr").find("td:eq(2)").attr("title");
        $.post("goform/parentControlEn", {
            mac: mac,
            isControled: "0"
        });
    });
    $("table").on("click", ".delete", delMac);

    $("#whiteEnable").on("click", changeWhiteEn);
    $("[name='timeType']").on("click", changeTimeType);
    $("[name='limitType']").on("click", changeLimitType);
    $("#save").on("click", saveParentControlInfo);
    $("#cancel").on("click", cancelParentConrolInfo);

    $("#device_edit").on("click", editDevice);

    $('#parent_urls').addPlaceholder(_("Please enter the key words of websites.")).on("keyup blur", function() {
        if (/[A-Z]/.test(this.value)) {
            this.value = this.value.toLowerCase();
            showErrMsg("msg-err", _('Case-insensitive'));
        }
    });
    $('#deviceName').addPlaceholder(_("Optional"));

    top.$(".main-dailog").removeClass("none");
    top.$(".save-msg").addClass("none");
});

function getDevice() {
    $.getJSON("goform/GetParentCtrlList?" + Math.random(), initDeviceList);
}

function getParentControl() {
    G_current_operate = "0";
    var deviceId = $(this).parents("tr").find("td:eq(2)").attr("title");
    var deviceName = $(this).parents("tr").find("td:eq(0)").attr("title");

    initHtml();
    $("#device_name").text(deviceName).attr("title", deviceName);
    $("#device_mac").html(deviceId.toUpperCase());
    //显示大写，传输数据小写
    var data = "mac=" + deviceId + "&random=" + Math.random();
    $.getJSON("goform/GetParentControlInfo?" + data, initParentControl);
}

function addParentControl() {
    G_current_operate = "1";
    initHtml();
    $("#parental_wrap").removeClass("none");
    $('#addName').removeClass("none");
    $('#editName').addClass("none");
    initParentControl();
}


function initHtml() {
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
}

function initParentControl(obj) {
    $('#deviceMac').inputCorrect("mac");
    //{"enable":1,"mac":"aa:aa:aa:aa:aa:aa", "url_enable":1, "urls":"abcd,abcde", "time":"0:0-0:0", "day":"1,1,1,1,1,1,0"}
    //星期天开始
    if (G_current_operate === "0") {
        $('#addName').addClass("none");
        $('#editName').removeClass("none");
    }
    var defaultObj = {
        enable: 1,
        mac: "",
        url_enable: 1,
        urls: "",
        time: "19:00-21:00",
        day: "1,1,1,1,1,1,1",
        limit_type: 0
    };

    obj = $.extend(defaultObj, obj);
    if (typeof obj.enable == "undefined") {
        //说明现在没有这条规则
        obj.enable = 0;
        obj.url_enable = 0;
        obj.urls = "";
        obj.time = "19:00-21:00";
        obj.day = "1,1,1,1,1,1,1";
    }

    $("#parentcontrolEnable").attr("class", "btn-on").val(1);

    if (obj.url_enable == 1) {
        $("#whiteEnable").attr("class", "btn-on").val(1);
        $("#web_limit").removeClass("none").val(obj.urls);
    } else {
        $("#whiteEnable").attr("class", "btn-off").val(0);
        $("#web_limit").addClass("none");
    }

    if (obj.limit_type == 1) {
        $("[name='limitType']")[1].checked = true;
    } else {
        $("[name='limitType']")[0].checked = true;
    }
    changeLimitType();


    $("#parent_urls").val(obj.urls);
    $('#parent_urls').addPlaceholder(_("Please enter the key words of websites."));
    if (obj.time == "00:00-24:00") {
        obj.time = "00:00-00:00";
    }

    var start_time = obj.time.split("-")[0],
        end_time = obj.time.split("-")[1];
    $("#startHour").val(start_time.split(":")[0]);
    $("#startMin").val(start_time.split(":")[1]);
    $("#endHour").val(end_time.split(":")[0]);
    $("#endMin").val(end_time.split(":")[1]);

    if (obj.day == "1,1,1,1,1,1,1") {
        $("[name='timeType']")[0].checked = true;
    } else {
        $("[name='timeType']")[1].checked = true;
    }

    changeTimeType();
    var dayArr = obj.day.split(","),
        len = dayArr.length,
        i = 0,
        dayVal;

    for (i = 0; i < len; i++) {
        dayVal = dayArr[i];
        if (dayVal == 0) {
            $("#day" + (i)).attr("checked", false);
        } else {
            $("#day" + (i)).attr("checked", true);
        }
    }

    showParentalSet();
    top.initIframeHeight();
}

function initDeviceList(obj) {
    var str = "",
        type = "",
        len = obj.length,
        i = 0,
        j = 0,
        initDataList = [],
        color,
        isCtrl_btn_str;
    for(j = 0; j < len; j++) {
        initDataList[j] = obj[j];
    }

    //排序：优先按是否在线排序(在线在前离线在后)，其次按照是否配置排序，未配置在前已配置在后
    initDataList.sort((function() {
        var splitter = /^(\d)$/;
        return function(item1, item2) {
            a = item1.line.match(splitter); b = item2.line.match(splitter);
            c = item1.isSet.match(splitter); d = item2.isSet.match(splitter);
            var anum = parseInt(a[1], 10), bnum = parseInt(b[1], 10);
            var cnum = parseInt(c[1], 10), dnum = parseInt(d[1], 10);
            if (anum === bnum) {
                return cnum < dnum ? -1 : cnum > dnum ? 1 : 0;
            } else {
                return bnum - anum;
            }
        }
    })());

    for (i = 0; i < len; i++) {
        isCtrl_btn_str = "";
        if (initDataList[i].block == 1) {
            continue;
        }

        str += "<tr class='tr-row'>";

        if (initDataList[i].devName === "") {
            str += "<td>---</td>";
        } else {
            str += "<td class='fixed dev-name'><span class='dev-name-txt'></span></td>";
        }
        if (initDataList[i].ip === "") {
            str += "<td>---</td>";
        } else {
            str += "<td>" + initDataList[i].ip + "</td>";
        }

        str += "<td title='" + initDataList[i].deviceId + "'>" + initDataList[i].deviceId + "</td>";

        if (initDataList[i].line === "0") {
            str += "<td><div class='offline'></div>" + "</td>";
        } else {
            str += "<td><div class='online'></div>" + "</td>";
        }

        str += "<td><div class='operate'><span title='" + _("Edit") + "' class='edit-new'></span>";

        if (initDataList[i].isSet === "1") {
            if (initDataList[i].isControled === "1") {
                str += "<span title='" + _("Click to disable control") + "' class='disable'></span>";
            } else {
                str += "<span title='" + _("Click to enable control") + "' class='enable'></span>";
            }
        }

        if ((initDataList[i].line === "0") && (initDataList[i].isSet === "1")) {
            str += "<span title='" + _("Delete") + "' class='delete'></span>";
        }

        str += "</div></td></tr>";
    }

    var index = 0;
    $("#list").html(str).find('.dev-name').each(function(i) {
        $(this).attr("title", initDataList[index].devName);
        $(this).find(".dev-name-txt").text(initDataList[index].devName);
        index ++;

    });;
    top.initIframeHeight();
}

function initRuleList(obj) {
    var str = "",
        type = "",
        len = obj.length,
        i = 0,
        color,
        btn_str;
    str = "";
    for (i = 0; i < len; i++) {

        str += "<tr class='tr-row'><td class='fixed' title='" + obj[i].devName + "'>" + obj[i].devName + "</td>" +
            "<td title='" + obj[i].mac + "'>" + _("MAC address:") + obj[i].mac.toUpperCase() + "</td>";
        if (obj[i].enable == 1) {
            btn_str = _("Enable");
        } else {
            btn_str = _("Disable");
        }
        str += "<td>" + btn_str + "</td><td><input type='button' value='" + _("Delete") + "' class='btn btn-mini del'></td></tr>";
    }

    if (len == 0) {
        str = "<td colspan=4>" + _("The controlled device list is empty.") + "</td>";
    }

    $("#rule_list #list2").html(str);
}

function showParentDeviceWrap() {
    //top.$("#head_title").addClass("selected");
    //top.$("#head_title2").removeClass("selected");
    $("#parental_list").removeClass("none");
    $("#parental_wrap, #rule_list").addClass("none");
    top.initIframeHeight();
    getDevice();
}

function showRuleList() {
    top.$("#head_title").removeClass("selected");
    top.$("#head_title2").addClass("selected");
    $("#rule_list").removeClass("none");
    $("#parental_list, #parental_wrap").addClass("none");

    $.getJSON("goform/getParentalRuleList?" + Math.random(), initRuleList);
    top.initIframeHeight();
}


function showParentalSet() {
    $("#device_edit").val(_("Edit"));
    $("#parental_wrap").removeClass("none");
    $("#parental_list, #rule_list").addClass("none");
    top.initIframeHeight();
}

function changeTimeType() {
    if ($("#everyday")[0].checked) {
        $("[id^='day']").attr("disabled", true).prop("checked", true);
    } else {
        $("[id^='day']").removeAttr("disabled");
    }
}

function changeLimitType() {
    if ($("#black")[0].checked) {
        $("#limit_label").html(_("Forbidden Websites:&nbsp;&nbsp;"));
        $(".help-block").html(_('Please enter the key words of the websites, and separate them with ",". For example："eHow,google" means that only ehow and google are forbidden.'));
    } else {
        $("#limit_label").html(_("Permitted Websites:&nbsp;&nbsp;"));
        $(".help-block").html(_('Please enter the key words of the websites, and delimit them with ",". For example："eHow,google" means that only ehow and google are accessible.'));
    }
}

function changeWhiteEn() {
    var className = $("#whiteEnable").attr("class");
    if (className == "btn-off") {
        $("#whiteEnable").attr("class", "btn-on").val(1);
        $("#web_limit").removeClass("none");
    } else {
        $("#whiteEnable").attr("class", "btn-off").val(0);
        $("#web_limit").addClass("none");
    }
    top.initIframeHeight();
}

function saveParentControlInfo() {
    var subObj = {},
        start_time = "",
        end_time = "",
        subStr = "",
        i = 0,
        dayList = "",
        index = 0,
        timeType,
        nameSubObj,
        editDeviceName,
        deviceName = $("#deviceName").val();

    if ($("#parentcontrolEnable").val() == "1") {
        start_time = $("#startHour").val() + ":" + $("#startMin").val();
        end_time = $("#endHour").val() + ":" + $("#endMin").val();

        for (i = 0; i < 7; i++) {
            if ($("#day" + (i))[0].checked) {
                dayList += "1,";
                index++;
            } else {
                dayList += "0,";
            }
        }
        dayList = dayList.replace(/[,]$/, "");

        if (index == 0 && $("#thatday")[0].checked) {
            showErrMsg("msg-err", _("Select at least one day"));
            return;
        }

        var time = start_time + "-" + end_time;
        if (start_time.replace(/[:]/g, "") == end_time.replace(/[:]/g, "")) {
            showErrMsg("msg-err", _("The start time and end time should not be the same."));
            return;
        }

        var urls = "";
        if ($("#whiteEnable").val() == "1") {
            urls = $("#parent_urls").val();
            //TODO:验证URLS
            if (urls == "") {
                if ($('[name="limitType"]:checked').val() === "1") {
                    showErrMsg("msg-err", _("When enabled, the White List of websites cannot be empty."));
                } else {
                    showErrMsg("msg-err", _("The Forbidden Websites cannot be blank if you enable blacklist feature."));
                }
                return;
            }
            var arr = urls.split(","),
                len = arr.length,
                dic = {};

            if (len > 10) {
                if ($('[name="limitType"]:checked').val() === "1") {
                    showErrMsg("msg-err", _("Up to %s white List URLs can be configured!", [10]));
                } else {
                    showErrMsg("msg-err", _("Up to %s blacklist URLs can be configured!", [10]));
                }
                return;
            }
            result = [];
            for (var i = 0; i < len; i++) {
                if (/^[-.a-z0-9]{2,31}$/ig.test(arr[i])) {
                    if (typeof dic[arr[i]] == "undefined") {
                        dic[arr[i]] = arr[i];
                        result.push(arr[i]);
                    }

                } else {

                    showErrMsg("msg-err", _('2~31 characters (only digits, letters, hyphens "-", dots ".") can be entered in one URL entry.'));
                    return;
                }
            }
            urls = result.join(",").toLowerCase();
        }

        if (G_current_operate === "1") {
            if ($('#deviceMac').val() === "") {
                showErrMsg("msg-err", _("Please specify a MAC address."));
                return;
            }

            if ($('#deviceMac').val() === "00:00:00:00:00:00") {
                showErrMsg("msg-err", _('Mac can not be 00:00:00:00:00:00'));
                return;
            }

            if ($('#deviceMac').val().charAt(1) && parseInt($('#deviceMac').val().charAt(1), 16) % 2 !== 0) {
                showErrMsg("msg-err", _('The second character must be even number.'));
                return;
            }

            if (!(/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/).test($('#deviceMac').val())) {
                showErrMsg("msg-err", _('Please input a valid MAC address'));
                return;
            }

            if (deviceName !== "") {
            	if (deviceName.replace(/\s/g, "") == "") {
	                showErrMsg("msg-err", _("The device name should not consist of spaces."));
	                return;
	            }

	            if (getStrByteNum(deviceName) > 20) {
	                showErrMsg("msg-err", _("The device name should be within %s characters.", [20]));
	                return false;
	            }
            }
            
            subObj = {
                "deviceId": $('#deviceMac').val().toLowerCase(),
                "deviceName": $('#deviceName').val(),
                "enable": $("#parentcontrolEnable").val(),
                "time": time,
                "url_enable": $("#whiteEnable").val(),
                "urls": urls,
                "day": dayList,
                "limit_type": $('[name="limitType"]:checked').val()
            }
        } else {
            //编辑保存时，若设备名称处于编辑状态，则走保存设备名称流程
            if($('#device_edit').val() === _("Complete")) {
                editDeviceName = $("#devName").val();
                if (editDeviceName == "") {
                    //top.$("#iframe-msg").removeClass("none");
                    showErrMsg("msg-err", _("Please enter a device name."));
                    return;
                }
                if (editDeviceName.replace(/\s/g, "") == "") {
                    showErrMsg("msg-err", _("The device name should not consist of spaces."));
                    return;
                }

                if (getStrByteNum(editDeviceName) > 20) {
                    showErrMsg("msg-err", _("The device name should be within %s characters.", [20]));
                    return false;
                }
                nameSubObj = "devName=" + encodeURIComponent($("#devName").val()) + "&mac=" + $("#device_mac").html().toLowerCase();
                $.post("goform/SetOnlineDevName", nameSubObj);
            }

            subObj = {
                "deviceId": $("#device_mac").html().toLowerCase(),
                "enable": $("#parentcontrolEnable").val(),
                "time": time,
                "url_enable": $("#whiteEnable").val(),
                "urls": urls,
                "day": dayList,
                "limit_type": $('[name="limitType"]:checked').val()
            }
        }



    } else {
        //禁用表示仅保存enable或disable和MAC地址
        subObj = {
            "deviceId": $("#device_mac").html().toLowerCase(),
            "enable": $("#parentcontrolEnable").val()
        }

    }

    subStr = objTostring(subObj);
    $.post("goform/saveParentControlInfo", subStr, parent_callback);
}



function delMac() {
    var mac = $(this).parents("tr").find("td:eq(2)").attr("title");

    $.post("goform/delParentalRule", "mac=" + mac, delMac_callback);
}

function cancelParentConrolInfo() {
    //clear set

    $("#parentcontrolEnable").attr("class", "btn-off").val(0);


    $("#whiteEnable").attr("class", "btn-off").val(0);
    //$("#parent_urls").attr("disabled", "disabled");	


    $("#startHour,#startMin,#endHour,#endMin").val("00");


    $("[name='timeType']")[0].checked = true;

    $("#device_name").html("");
    $("#device_mac").html("");
    $("#device_edit").val(_("Edit"));
    changeTimeType();
    $("input[type='checkbox']").prop("checked", true).attr("disabled", true);
    showParentDeviceWrap();
}

function parent_callback(str) {
    if (!top.isTimeout(str)) {
        return;
    }

    var num = $.parseJSON(str).errCode;
    top.$("#iframe-msg").removeClass("text-success red");
    //top.$("#iframe-msg").removeClass("none");
    if (num == 0) {
        top.$("#iframe-msg").addClass("text-success").html(_("Configured Successfully!"));
        top.advInfo.initValue();
    } else if (num == 1) {
        top.$("#iframe-msg").addClass("red").html(_("The total devices in Blacklist and controlled by Parental Controls should be within %s.", [30]));
        setTimeout(function() {
            top.$("#iframe-msg").html("&nbsp;");
        }, 2000);
        return;
    } else {
        top.$("#iframe-msg").addClass("red").html(_("Configured Failure!"));
        setTimeout(function() {
            top.$("#iframe-msg").html("&nbsp;");
        }, 2000);
        return;
    }
    setTimeout(function() {
        top.$("#iframe-msg").html("");
        top.$("#iframe-msg").removeClass("text-success").addClass("red");
        //top.$("#iframe-msg").addClass("none");
        //showParentDeviceWrap();
        cancelParentConrolInfo();
    }, 800);



    /*if(num != 0) {
		top.location.reload(true);
	}*/
}

function delMac_callback(str) {
    if (!top.isTimeout(str)) {
        return;
    }
    var num = $.parseJSON(str).errCode;

    //top.$("#iframe-msg").removeClass("none");
    if (num == "0") {
        top.$("#iframe-msg").html(_("Delete"));
    } else {
        top.$("#iframe-msg").html(_("Fail to delete it!"));
    }
    setTimeout(function() {
        top.$("#iframe-msg").html("");
        //top.$("#iframe-msg").addClass("none");
        getDevice();
    }, 800);



    /*if(num != 0) {
		top.location.reload(true);
	}*/
}

function editDevice() {
    var deviceName = $("#device_name").text(),
        str,
        data;
    if ($(this).val() == _("Edit")) {
        str = "<input type='text' class='input-medium' id='devName' maxlength='20'>";
        $("#device_name").html(str);
        $("#devName").val(deviceName);
        $("#device_edit").val(_("Complete"));

	} else {
		data = "devName=" + encodeURIComponent($("#devName").val()) + "&mac=" + $("#device_mac").html().toLowerCase();

		deviceName = $("#devName").val();
		if (deviceName == "") {
			//top.$("#iframe-msg").removeClass("none");
			showErrMsg("msg-err", _("Please enter a device name."));
			return;
		}
		if (deviceName.replace(/\s/g, "") == "") {
			showErrMsg("msg-err", _("The device name should not consist of spaces."));
			return;
		}

        if (getStrByteNum(deviceName) > 20) {
            showErrMsg("msg-err", _("The device name should be within %s characters.", [20]));
            return false;
        }

        $.post("goform/SetOnlineDevName", data, handDeviceName);

        $("#device_edit").val(_("Edit"));
    }
}



function handDeviceName(data) {


    var num = $.parseJSON(data).errCode;

    //top.$("#iframe-msg").removeClass("none");
    top.$("#iframe-msg").removeClass("text-success red");
    if (num == 0) {
        $("#device_name").text($("#devName").val());
        top.$("#iframe-msg").addClass("text-success").html(_("Configured Successfully!"));

    } else {
        top.$("#iframe-msg").addClass("red").html(_("Configured Failure!"));
    }
    setTimeout(function() {
        top.$("#iframe-msg").removeClass("text-success").addClass("red");
        top.$("#iframe-msg").html("");

    }, 800);
}
