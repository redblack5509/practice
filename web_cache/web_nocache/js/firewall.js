$(function () {
    getValue();

    $("#firewall").on('click', '.btn-on', function() {
        $(this).attr("class", "btn-off");
    });

    $("#firewall").on('click', '.btn-off', function() {
        $(this).attr("class", "btn-on");
    });

    $("#submit").on("click", function () {
        preSubmit();
    });

    top.loginOut();
    top.$(".main-dailog").removeClass("none");
    top.$(".save-msg").addClass("none");
});

function getValue() {
    $.getJSON("goform/GetFirewallCfg?" + Math.random(), initValue);
}

function initValue(obj) {
    top.$(".main-dailog").removeClass("none");
    top.$("iframe").removeClass("none");
    top.$(".loadding-page").addClass("none");

    $("#icmpEn").attr("class", (obj["firewallEn"].charAt(0) === "1") ? "btn-on" : "btn-off");
    $("#tcpEn").attr("class", (obj["firewallEn"].charAt(1) === "1") ? "btn-on" : "btn-off");
    $("#udpEn").attr("class", (obj["firewallEn"].charAt(2) === "1") ? "btn-on" : "btn-off");
    $("#wanEn").attr("class", (obj["firewallEn"].charAt(3) === "1") ? "btn-on" : "btn-off");
    top.initIframeHeight();
}

function preSubmit() {
    var data = "firewallEn="+(($("#icmpEn").attr("class") === "btn-on") ? 1 : 0) +
                            (($("#tcpEn").attr("class") === "btn-on") ? 1 : 0) +
                            (($("#udpEn").attr("class") === "btn-on") ? 1 : 0) +
                            (($("#wanEn").attr("class") === "btn-on") ? 1 : 0);
    $.post("goform/SetFirewallCfg", data, callback);
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