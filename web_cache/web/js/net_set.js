var G = {};
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
	"3": _("Connecting..."),//(之前在1203里面这个状态表示保存了数据但是没有连接上去的情况下提示的，保留之前的)"
	"4": _("Connected…Accessing the Internet…"),
	"5": _("Disconneted. Please contact your ISP!"),
	"6": _("Connected…Accessing the Internet…"),
	"7": _("Connected! You can surf the Internet."),
	//静态：
	"101": _("Please ensure that the cable between the router's Internet port and the modem is properly connected."),
	"102": _("Disconnected"),
	"103": _("Connecting…Detecting the Internet…"),//(之前在1203里面这个状态表示保存了数据但是没有连接上去的情况下提示的，保留之前的)"
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


$(function () {
	//initHtml();
	//getValue();
	//initEvent();
	netInfo.init();
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	top.showSaveMsg(num);
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
        case 0: {
            $("#ppoe_set").addClass("none");
            $("#double_access").addClass("none");
            $("#dnsType").removeClass("none");
            $("#static_ip").addClass("none");
            if(netInfo.currentWanType === "0") {
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
        case 1: {
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
            if(netInfo.currentWanType === "2") {
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
        case 3: {
            $("#ppoe_set").addClass("none");
            $("#double_access").removeClass("none");
            $("#double_access #serverInfo").removeClass("none");

            if(netInfo.currentWanType === "3") {
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
        case 4: {
            $("#ppoe_set").addClass("none");
            $("#double_access").removeClass("none");
            $("#double_access #serverInfo").removeClass("none");

            if(netInfo.currentWanType === "4") {
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
        case 5: {
            $("#ppoe_set").removeClass("none");
            $("#double_access").removeClass("none");
            $("#double_access #serverInfo").addClass("none");

            if(netInfo.currentWanType === "5") {
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
	time : 0,
	isConnect: false,//是否已经连上，即按钮是连接还是断开
	hasConnTime: false,//是否有联网时长
	saveType: "connect",//操作类型，是连接（connect）还是断开（disconnect）
	currentWanType: 0,
    	currentDnsType: "1",
    	currentVpnType: "1",
	ajaxInterval: null,
	initObj: null,
	saving: false,//保存中，连接中或断开中
	init: function () {
		if (!netInfo.loading) {
			$("#netWanType").on("change", netInfo.changeWanType);
            $("[name='vpnWanType']").on("click", netInfo.changeVpnType);
            $('#dnsAuto').on('change', netInfo.changeDnsAuto);

			$("#wan_submit").on("click", function () {
				if (!this.disabled)
				G.validate.checkAll();
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
			G.validate = $.validate({
				custom: function () {},

				success: function () {
					netInfo.preSubmit();
				},

				error: function (msg) {
					return;
				}
			});			
			netInfo.loading = true;
		}

		$("#gateway").attr("data-options",'{"type":"ip","msg":"'+_("Please enter a correct gateway.")+'"}');
		$("#dns1").attr("data-options",'{"type":"ip","msg":"'+_("Please enter a correct preferred DNS Server.")+'"}');
		$("#dns2").attr("data-options",'{"type":"ip","msg":"'+_("Please enter a correct alternate DNS Server.")+'"}');

		$.GetSetData.getJson("goform/getWanParameters?" + Math.random(), function(obj) {
			$("#loadingTip").addClass("none");
			$("#netWrap").removeClass("none");
			//定时刷新器
			netInfo.initObj = obj;
			if (!netInfo.ajaxInterval) {
				netInfo.ajaxInterval = new AjaxInterval({
					url: "goform/getWanParameters",
					successFun: function(data) {netInfo.setValue(data);},
					gapTime: 5000
				});
			} else {
				netInfo.ajaxInterval.startUpdate();
			}

			//client+ap 不允许配置外网设置，隐藏配置内容
			if (obj.wl_mode == "apclient") {
				$("#internet-form").addClass("none");
				$("#notAllowTip").removeClass("none");
			} else {
				$("#internet-form").removeClass("none");
				$("#notAllowTip").addClass("none");
			}

			//wisp下没有pppoe拨号
			var wanOptStr = '<option value="0">' + _("DHCP") + '</option><option value="1">' + _("Static IP") + '</option>';
			if (obj.wl_mode !== "wisp") {//wisp 隐藏pppoe选择框
				wanOptStr += '<option value="2">' + _('PPPoE') + '</option>';
				if(obj.country === "RU") {
					wanOptStr += '<option value="3">' + _("Russia PPTP") + '</option><option value="4">' + _("Russia L2TP") + '</option><option value="5">' + _("Russia PPPoE");
				}
			}

			$("#netWanType").html(wanOptStr);
			$("#netWanType").val(obj.wanType);
			inputValue(obj);
			$('#adslUser').addPlaceholder(_("Enter the user name from your ISP"));
            $('#adslPwd').initPassword(_("Enter the password from your ISP"), false, false);
            $('#vpnPwd').initPassword(_(""), false, false);
			netInfo.setValue(obj);
			netInfo.changeWanType();
		});

	},
	setValue: (function() {
		var statusType = 1,//连接状态类型，1错误， 2尝试，3成功
			isConnect = 1,//是否接上（显示接入时长）0未接上 1接上 
			statusClasses = ["text-error", "text-warning", "text-success"];

		return function (obj) {

			//如果当前连接方式不是所选方式，不更新
			if (obj.wanType != $("#netWanType").val()) {
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
			$("#connectStatus").html(statusTxtObj[parseInt(obj["connectStatus"].substr(obj["connectStatus"].length-4), 10) + ""]);
			
			statusType = parseInt(obj["connectStatus"].charAt(1), 10);
			$("#connectStatus").attr("class", statusClasses[statusType-1]);
			$("#connectStatusWrap").removeClass("none");

			//联网时长
			isConnect = parseInt(obj["connectStatus"].charAt(2), 10);
			$("#connectTime").html(formatSeconds(obj["connectTime"]));
			setTimeout(function() {$("#connectTime").html(formatSeconds(parseInt(obj["connectTime"], 10)+1))}, 1000);
			if (isConnect == 1) {
				$("#connect_time").removeClass("none");
			} else {
				$("#connect_time").addClass("none");
			}
			netInfo.hasConnTime = (isConnect == 1? true: false);

			//状态码第一个决定按钮是连接还是断开
			netInfo.isConnect = (parseInt(obj["connectStatus"].charAt(0)) == 1? true: false);

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
            if((dns1 === "") && (!($("#dns1").is(":hidden")))) {
                //服务器为域名（不是ip）则首选dns不能为空。
                if ((((!$("#vpnServer").is(":hidden"))) && (!$.validate.valid.ip.all(server)) || wan_type === "5") && (vpnWanType === "0")) {       
                } else {
                    return _("Please specify a Preferred DNS Server.");
                }
            }

            if ((wan_type == 1) || ((wan_type == 3) &&(vpnWanType == 0)) || ((wan_type == 4) &&(vpnWanType == 0)) || ((wan_type == 5) &&(vpnWanType == 0))) { //static IP

				//同网段判断
				if (checkIpInSameSegment(ip, mask, lanIp, lanMask)) {
					return _("%s and %s (%s) should not be in the same network segment.", [_("WAN IP"),_("LAN IP"),lanIp]);
				}
				if (netInfo.initObj.pptpSvrIp && checkIpInSameSegment(ip, mask, netInfo.initObj.pptpSvrIp, netInfo.initObj.pptpSvrMask)) {
					return _("%s and %s (%s) should not be in the same network segment.", [_("WAN IP"),_("PPTP Server IP"), netInfo.initObj.pptpSvrIp]);
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

            if((wan_type === "3") || (wan_type === "4")) {
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
            if(!($("#dns1").is(":hidden"))) {
                if(dns1 === "") {
                    subData = subData.replace("dnsAuto=0", "dnsAuto=1");
                } else {
                    subData = subData.replace("dnsAuto=1", "dnsAuto=0");
                }
            }
        }
        
        $.post("goform/WanParameterSetting?" + Math.random(), subData, netInfo.callback);
        $("#wan_submit")[0].disabled = true;
        $("#netWanType").prop("disabled", true);
        netInfo.saving = true;
        
    },
    callback: function(str) {
        if (!top.isTimeout(str)) {
            return;
        }

		var resultObj = $.parseJSON(str),
			num = resultObj.errCode,
			sleep_time = resultObj.sleep_time,
			isVpn = (sleep_time > 10? true: false),
			waitTime = -1,//连接或断开操作成功之后需要等待的时间
			minTime = 4;//连接或断开操作至少要花费的时间，

		if (num == 0) {
			showSaveMsg(num);
			$("#wan_submit").blur();
			netInfo.init();

		} else {
			showSaveMsg(num);
		}

		(function() {
			if (netInfo.saveType == "connect" && netInfo.hasConnTime && minTime <= 0) {
				//连接成功
				waitTime = 5;//非vpn多等5秒
                if((netInfo.currentWanType !== "0") && (netInfo.currentWanType !== "1")) {
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
					waitTime = (waitTime > sleep_time? sleep_time: (waitTime==-1? 0: waitTime));
				} else {
					//非vpn 到了后台传过来的等待时间且到了操作成功的等待时间，页面才可以操作
					waitTime = (waitTime==-1? 0: waitTime);
				}

				setTimeout(function() {
					$("#wan_submit")[0].disabled = false;
					$("#netWanType").prop("disabled", false);
					netInfo.saving = false;
					netInfo.changeWanType();					
				}, waitTime*1000);
			}		
		})();
	},

    changeWanType: function() {
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

		top.initIframeHeight();
	},

    changeVpnType: function() {
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
        } else {
            $("#dnsType").removeClass("none").val("1");
            $("#dnsContainer").addClass("none");
            $("#static_ip").addClass("none");
            if (netInfo.currentVpnType === "0") {
                $('#dnsAuto').val('1');
            }
        }
        top.initIframeHeight();
    },

    changeDnsAuto: function() {
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
        top.initIframeHeight();
    }
};