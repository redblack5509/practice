var blackNum = 0,
	maxBlackNum = 30,
	initObj = null;

$(function () {
	getValue();
	top.loginOut();

	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");

	$("#list").delegate(".edit-btn","click",function() {
		showEditNameArea($(this).parents("tr")[0], $(this).parents("tr").find(".dev-name").attr("title"));
	});


	$("#list").delegate(".btn-save","click",function() {
		var mac = $(this).parents("tr").attr("alt");
			newName = $(this).parents("tr").find("input.dev-name-input").val();
		changeDevName(mac, newName);
	});

	$("#list").delegate(".del","click",function() {
		var mac = $(this).parents("tr").attr("alt");
		delList(mac);
	});

});

function getValue() {
	$.getJSON("goform/getOnlineList?" + Math.random(), initValue);
}

function initValue(obj) {
	var i = 0,
		k = 0,
		len = obj.length,
		str = "",
		initDataList = [],
		connectTypeStr = [_("Wired"), _("2.4G"), _("5G")];

	initObj = obj;
	blackNum = obj[0].blackNum;
	for(k = 1; k < len; k++) {
		if(obj[k].black == 1) {
			continue;
		}
		initDataList.push(obj[k]);
	}

	initDataList.sort((function() {
		var splitter = /^(\d+)([A-Z]*)/;
		return function(a, b) {
			a = a.line.match(splitter); b = b.line.match(splitter);
			var anum = parseInt(a[1], 10), bnum = parseInt(b[1], 10);
			if (anum === bnum) {
				return a[2] < b[2] ? -1 : a[2] > b[2] ? 1 : 0;
			} else {
				return anum - bnum;
			}
		}
	})());
	if (initDataList.length != 0) {
		for (i = 0; i < initDataList.length; i++) {
			str += "<tr alt='" + initDataList[i].deviceId + "' class='tr-row'>" + 
		"<td class='dev-name fixed edit-td' title=''><span class='dev-name-txt'></span><img class='edit-btn edit-btn-txt-append' src='img/edit.png' /></td>" +
				"<td>" + initDataList[i].ip + "</td>" +
				"<td>" + initDataList[i].deviceId.toUpperCase() + "</td>" +
				"<td>" + connectTypeStr[initDataList[i].line] + "</td>" +
				"<td><input type='button' class='btn del' value='" +_("Add ")+"'></td></tr>";
		}
	} else {
		str = "<tr><td colspan=5 >" + _("No online client")+"</td></tr>";
	}
	if (str == "") {
		str = "<tr><td colspan=5 >" + _("No online client")+"</td></tr>";
	}

	var j = 0;
	$("#list").html(str).find(".dev-name").each(function(i) {
		$(this).attr("title", initDataList[j].devName);
		$(this).find(".dev-name-txt").text(initDataList[j].devName);
		j++;
	});

	top.initIframeHeight();
}

function delList(mac) {
	var isParentCtrled = false;

	for (var i = initObj.length - 1; i >= 1; i--) {
		if (initObj[i].deviceId == mac) {
			if (initObj[i].parentCtrl == 1) {
				isParentCtrled = true;
				break;
			}
		}
	};

	/*if (!isParentCtrled && blackNum >= maxBlackNum) {
		//showErrMsg("msg-err",_("Up to %s device can be added to the blacklist.", [maxBlackNum]));
		showErrMsg("msg-err",_("The total devices in Blacklist and controlled by Parental Controls should be within %s.", [maxBlackNum]));
		return;
	}*/

	var data;

	data = "mac=" + mac;
	$.post("goform/setBlackRule", data, callback);
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	if(num == 0) {
		top.showSaveMsg(num, _("Adding to the blacklist"), 3);
	} else if(num == 1) {
		showErrMsg("msg-err",_("The total devices in Blacklist and controlled by Parental Controls should be within %s.", [maxBlackNum]));
		return;
	}
	
}

function showEditNameArea(rowEle, name) { 
	var htmlStr = '<div class="table-btn-group"><input type="text" class="input-small dev-name-input" maxlength="20"/><input type="button" class="btn btn-mini btn-save" value="' + _("Save") + '" /></div>';
	$(rowEle).find(".dev-name").html(htmlStr);
	$(rowEle).find(".dev-name .dev-name-input").val(name);
}

function hideEditNameArea(rowEle, devName) {
	$(rowEle).find(".dev-name").text(devName).append('<img class="edit-btn edit-btn-txt-append" src="img/edit.png" />');	
}

function changeDevName(macAddress, newName) {
	var submitStr = "mac=" + macAddress + "&devName=" + encodeURIComponent(newName);

	$("#msg-err").addClass("red").removeClass("text-success");
	if (newName == "") {
		showErrMsg("msg-err", _("Please enter a device name."));
		return false;
	} 
	if (newName.replace(/\s/g, "") == "") {
		//top.$("#iframe-msg").removeClass("none");
		showErrMsg("msg-err", _("The device name should not consist of spaces."));
		return;
	}

	if (getStrByteNum(newName) > 20) {
		showErrMsg("msg-err", _("The device name should be within %s characters.",[20]));
		return false;
	}

	$.post("goform/SetOnlineDevName", submitStr, function(str) {		
		if ($.parseJSON(str).errCode == "0") {
			$("#msg-err").removeClass("red").addClass("text-success");
			showErrMsg("msg-err", _("Saved Successfully!"));
			$("#list tr").each(function() {
				if ($(this).attr("alt") == macAddress) {
					$(this).find(".dev-name").attr("title", newName).find(".dev-name-txt").text(newName);
					hideEditNameArea(this, newName);
					return false;
				}
			}); 
			top.staInfo.initValue();
		} else {
			showErrMsg("msg-err", _("Fail to change"));
		}

	});
}
