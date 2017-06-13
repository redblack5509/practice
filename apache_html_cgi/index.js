// 初始化数据
$(function () {
    $.getJSON("cgi-bin/iplocation.cgi?" + Math.random(), initValue);
});

function initValue(obj) {
    $("#ip").text(obj["ip"]);
    $("#addr").text(obj["addr"]);
    $("#isp").text(obj["isp"]);
    $("#country").text(obj["country"]);
}
