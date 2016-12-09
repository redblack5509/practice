var G = {},
	initDataList = [],
	addMacList = [],
	editing = false,
	ajaxInterval = {};

var selectObj = {
	"initVal": "",
	"editable": "1",
	"seeAsTrans": true,
	"size": "small",
	"options": [{
		//"0": _("Denied"),
		"0": _("Unlimited"),
		"1": "1Mbps",
		"2": "2Mbps",
		"4": "4Mbps",
		".divider": ".divider",
		".hand-set": _("Manual")
	}]
};

$(function () {
	$('#deviceInfo').inputCorrect('mac').addPlaceholder(_("MAC Address"));
	$('#deviceName').addPlaceholder(_("Optional"));

	$("#netControlEn").on("click", changeControlEn);
	$("#submit").on("click", function () {
		preSubmit();
	});
	$("#netList").on("click", ".add", addNetControl);
	$("table").on("click", ".enable", function() {
		$(this).removeClass("enable").addClass("disable").attr("title",_("Click to disable control"));
	});
	$("table").on("click", ".disable", function() {
		$(this).removeClass("disable").addClass("enable").attr("title",_("Click to enable control"));
	});
	$("table").on("click", ".delete", delNetControl);

	getValue();
	$('#limitUp').toSelect(selectObj)[0].val( _("Unlimited"));
	$('#limitDown').toSelect(selectObj)[0].val( _("Unlimited"));
	$("#limitDown input[type=text], #limitUp input[type=text]").inputCorrect("float").on("focus", function() {
		this.value = this.value.replace(/[^\d\.]/g, "");
	}).on("blur", function() {
		setIptValue.call(this);
	}).each(function() {
		setIptValue.call(this);
	});

	checkData();
	top.loginOut();
	top.initIframeHeight();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function setIptValue() {
	var val = this.value.replace(/[^\d\.]/g, "");

	val = (val == ""?0:val);
	val = parseFloat(val > 2000 ? 2000 : parseFloat(val).toFixed(2));
	$(this).parent(".input-append").find("[type=hidden]").val(val);
	/*if (parseFloat(val, 10) >= 2000) {
		this.value = _("Unlimited");
	} else */
	if (parseFloat(val, 10) === 0) {
		this.value = _("Unlimited");
	} else {
		this.value = val + "Mbps";
	}		
}
	
function addNetControl() {
	G.validate.checkAll();
}

var delMacList = [];
function delNetControl() {
	var delMac = $(this).parents("tr").find("td:eq(1)").attr("title");
	delMacList.push(delMac);
	$(this).parents("tr").remove();
	ajaxInterval.startUpdate();
}

function getValue() {
	$.getJSON("goform/GetNetControlList?" + Math.random(), function(list) { 
		var initEn = list[0];
		updateData(list);

		ajaxInterval = new AjaxInterval({
			url: "goform/GetNetControlList",
			successFun: updateData,
			failFun: failUpdate,
			gapTime: 2000
		});

		$("#netControlEn").attr("class", (initEn.netControlEn == "1"?"btn-off":"btn-on"));
		changeControlEn();

	});
}

function changeControlEn() {
	var className = $("#netControlEn").attr("class");
	if (className == "btn-off") {
		$("#netControlEn").attr("class", "btn-on");
		$("#netControlEn").val(1);
		$("#netList").removeClass("none");
		ajaxInterval.startUpdate();
	} else {
		$("#netControlEn").attr("class", "btn-off");
		$("#netControlEn").val(0);
		$("#netList").addClass("none");
		ajaxInterval.stopUpdate();

	}
	top.initIframeHeight();
}

function checkData() {
	G.validate = $.validate({
		custom: function () {
			var deviceName = $("#deviceName").val();
			var deviceMac = $("#deviceInfo").val();
			var exist = false;
			if (deviceName !== "") {
				if (deviceName.replace(/\s/g, "") == "") {
					showErrMsg("msg-err", _("The device name should not consist of spaces."));
					return true;
				}

		        if (getStrByteNum(deviceName) > 20) {
		            showErrMsg("msg-err", _("The device name should be within %s characters.", [20]));
		            return true;
		        }
			}

			if(deviceMac === "") {
				showErrMsg("msg-err", _("Please specify a MAC address."));
                return true;
			}

			if($.validate.valid.mac.all(deviceMac)) {
                showErrMsg("msg-err", $.validate.valid.mac.all(deviceMac));
                return true;
            }

			if ($('#netBody tr').length >= 30) {
				showErrMsg("msg-err", _("Up to %s bandwidth control rules are allowed.", [30]));
		            return true;
			}

			$('#netBody tr').each(function() {
				if ($(this).find('td:eq(1)').html().indexOf(deviceMac) > -1) {
					exist = true;
					return;
				}
			});
			if(exist) {
				showErrMsg("msg-err", _("The MAC address already exists."));
		        return true;
			}

		},

		success: function () {
			var addItem = {};
			addItem.hostName = $('#deviceName').val();
			addItem.ip = "";
			addItem.mac = $('#deviceInfo').val();
			addItem.upSpeed = false;
			addItem.downSpeed = false;
			addItem.limitUp = parseFloat($('#limitUp input:hidden').val());
			addItem.limitDown = parseFloat($('#limitDown input:hidden').val());
			/*addItem.limitUp = parseFloat($('#limitUp input').val().replace(/[^\d\.]/g, ""));
			addItem.limitDown = parseFloat($('#limitDown input').val().replace(/[^\d\.]/g, ""));*/
			addItem.offline = "1";
			addItem.isSet = "1";
			addItem.isControled = "1";

			initDataList = initDataList.concat(addItem);

			addMacList.push(addItem.mac);
			drawList(initDataList);
		},

		error: function (msg) {
			$("#deviceName").val("");
			$("#deviceInfo").val("");
			$("#limitUp .input-box").val(_("Unlimited"));
			$("#limitDown .input-box").val(_("Unlimited"));
			return;
		}
	});
}

//更新数据
function updateData(dataList) {
	for(var i = 0; i < initDataList.length; i++) {
		for (var j = dataList.length - 1; j >= 1; j--) {
			if(dataList[j].mac == initDataList[i].mac){
				initDataList[i] = dataList[j];
				dataList.splice(j, 1);
				break;
			}	
		};
	}
	dataList.shift();

	initDataList = initDataList.concat(dataList);

	//排序：优先按是否在线排序(在线在前离线在后)，其次按照是否配置排序，未配置在前已配置在后
    initDataList.sort((function() {
        var splitter = /^(\d)$/;
        return function(item1, item2) {
            a = item1.offline.match(splitter); b = item2.offline.match(splitter);
            c = item1.isSet.match(splitter); d = item2.isSet.match(splitter);
            e = item1.mac; f = item2.mac;
            var anum = parseInt(a[1], 10), bnum = parseInt(b[1], 10);
            var cnum = parseInt(c[1], 10), dnum = parseInt(d[1], 10);
            if (anum === bnum) {
            	if(cnum === dnum) {
            		return e < f ? -1 : e > f ? 1 : 0;
            	} else {
            		return cnum < dnum ? -1 : cnum > dnum ? 1 : 0;
            	}
            } else {
                return anum - bnum;
            }
        }
    })());


	//不显示删除项
	for(var k = 0; k < delMacList.length; k++) {
		for(var len = initDataList.length -1; len >=1; len--) {
			if(delMacList[k] === initDataList[len].mac) {
				initDataList.splice(len, 1);
			}
		}
	}

	drawList(initDataList);
}

//更新数据失败
function failUpdate() {
	updateData([""]);
}

//用数据创建（更新）列表：table 
function drawList(dataList) {
	var rowData = {},
		addData = {},
		limitUp,
		limitDown,
		upSpeed,
		downSpeed;

	$("#netBody tr").each(function() {
		var mac = $(this).attr('alt');
		for (var i = dataList.length-1; i >= 0; i--) {
			rowData = dataList[i];
			if (mac == rowData["mac"]) {
				//通过mac匹配对应行 更新该行数据
				//速度统一转换成Mbps
				upSpeed = (parseFloat(rowData.upSpeed)/128).toFixed(2);
				downSpeed = (parseFloat(rowData.downSpeed)/128).toFixed(2);
				limitUp = (parseFloat(rowData.limitUp)/128).toFixed(2);
				limitDown = (parseFloat(rowData.limitDown)/128).toFixed(2);

				$(this).find('[alt=hostName]').html(rowData["hostName"] || "---");
				$(this).find('[alt=netIp]').html(rowData["mac"] + "<br>" + rowData["ip"]);
				if((!rowData.upSpeed && !rowData.downSpeed) || (rowData.offline === "1")) {
					$(this).find('[alt=netSpeed]').html("---");
				} else {
					if(rowData.isControled == "0") { //未控制时直接显示返回值
						$(this).find('[alt=netSpeed]').html(upSpeed + "Mbps<br>" + downSpeed + "Mbps");
					} else {
						$(this).find('[alt=netSpeed]').html((((Number(limitUp) > Number(upSpeed)) || (limitUp == 0.00)) ? upSpeed : limitUp) + "Mbps<br>" + (((Number(limitDown) > Number(downSpeed)) || (limitDown == 0.00)) ? downSpeed : limitDown) + "Mbps");
					}
					
				}
				
				dataList[i].exist = true;
				return;
			}
		}
	});

	//新记录添加到表尾
	for (var i = 0; i < dataList.length; i++) {
		addData = dataList[i];
		if (!addData.exist) {
			addRow(addData);
		}
	};
}

//添加一条记录
function addRow(obj) {
	var limitUp = (!obj.upSpeed && !obj.downSpeed) ? obj.limitUp+"Mbps" : ((parseFloat(obj.limitUp)/128).toFixed(2));
	var limitDown = (!obj.upSpeed && !obj.downSpeed) ? obj.limitDown+"Mbps" : ((parseFloat(obj.limitDown)/128).toFixed(2));
	str = "";


	str += "<tr alt='"+obj.mac+"'>";
	if(obj.hostName !== "") {
		str += "<td alt='hostName' class='dev-name fixed' title='"+ obj.hostName +"'>" + obj.hostName + "</td>";
	} else {
		str += "<td alt='hostName' class='dev-name fixed' title='"+ obj.hostName +"'>---</td>";

	}

	if(obj.ip !== "") {
		str += "<td alt='netIp' title='" +  obj.mac + "'>" + obj.mac + "<br>" + obj.ip + "</td>";
	} else {
		str += "<td alt='netIp' title='" +  obj.mac + "'>" + obj.mac + "</td>";
	}
	
	if((!obj.upSpeed && !obj.downSpeed) || (obj.offline === "1")) {
		str += "<td alt='netSpeed'>---</td>";
	} else {
		//速度统一转换成Mbps
		upSpeed = (parseFloat(obj.upSpeed)/128).toFixed(2);
		downSpeed = (parseFloat(obj.downSpeed)/128).toFixed(2);
		if(obj.isControled == "0") {
			str += "<td alt='netSpeed' class='net-speed-txt-td'>" + upSpeed + "Mbps<br>" + downSpeed + "Mbps</td>";
		} else {
			str += "<td alt='netSpeed' class='net-speed-txt-td'>" + (((Number(limitUp) > Number(upSpeed)) || (limitUp == 0.00)) ? upSpeed : limitUp) + "Mbps<br>" + (((Number(limitDown) > Number(downSpeed)) || (limitDown == 0.00)) ? downSpeed : limitDown) + "Mbps</td>";
		}
	}
	str += "<td><span alt='limitUp' class='validatebox'> </span></td>";
	str += "<td><span alt='limitDown' class='validatebox'> </span></td>";
	if (obj.offline === "1") {
		str += "<td><div class='offline'></div></td>";
	} else {
		str += "<td><div class='online'></div>" + "</td>";
	}

	str += "<td><div class='operate'>";
	if(obj.isSet === "1") {
		if(obj.isControled === "1") {
			str += "<span class='disable' title='" + _("Click to disable control") + "'></span>";
		} else {
			str += "<span class='enable' title='" + _("Click to enable control") + "'></span>";
		}
	}
	if (obj.offline === "1") {
		str += "<span class='delete' title='" + _("Delete") + "'></span>";
	}
	str +="</div></td>";

	$("#netBody").append(str);
	$("#netBody tr:last").find(".dev-name").attr("title", obj.hostName);
	$("#netBody tr:last").find("span[alt=limitUp]").toSelect(selectObj)[0].val(limitUp);
	$("#netBody tr:last").find("span[alt=limitDown]").toSelect(selectObj)[0].val(limitDown);
	$("#netBody tr:last input[type=text]").inputCorrect("float").on("focus", function() {
		this.value = this.value.replace(/[^\d\.]/g, "");
	}).on("blur", function() {
		setIptValue.call(this);
	}).each(function() {
		setIptValue.call(this);
	});

	top.initIframeHeight();
}

function preSubmit() {
	var data = "",
		ip = "",
		i = 0,
		str = "",
		$row = $("#netBody tr"),
		len = $("#netBody").children().length,
		limitUp = 0,
		limitDown = 0;

	if (len > 30) {
		showErrMsg("msg-err", _("Up to %s bandwidth control rules are allowed.", [30]));
		return;
	}

	data += "netControlEn=" + $("#netControlEn").val();
	str = "&list=";
	if ($("#netControlEn").val() == "1") {
		for (i = 0; i < len; i++) {
			limitUp = parseFloat($row.eq(i).find("[alt=limitUp]")[0].val().replace(/[^\d\.]/g, ""));
			limitDown = parseFloat($row.eq(i).find("[alt=limitDown]")[0].val().replace(/[^\d\.]/g, ""));
			en = ($row.eq(i).find('.operate span').hasClass("enable"))?"0":"1";

			str += ($.inArray($row.eq(i).attr('alt'), addMacList) > -1) ? $row.eq(i).find('td:eq(0)').attr('title') : "";
			str += ";";
			str += en + ";";
			str += $row.eq(i).attr("alt") + ";";
			str += limitUp*128 + ";";
			str += limitDown*128 + "~";
		}
	}
	str = str.replace(/[~]$/, "");
	data = data + str;
	$.post("goform/SetNetControlList", data, callback);
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