$(function() {
    initEvent();
    getValue();

    top.loginOut();
    top.$(".main-dailog").removeClass("none");
    top.$(".save-msg").addClass("none");
});

function initEvent() {
    $("#bfEn").on("click", function() {
        if($(this).hasClass("btn-on")) {
            $(this).attr("class", "btn-off");
            $(this).val(0)
        } else {
            $(this).attr("class", "btn-on");
            $(this).val(1)
        }

        $.post("goform/WifiBeamformingSet?", "beamformingEn=" + $("#bfEn").val(), callback);
        if($("#bfEn").val() === "1") {
            $("#waitingTip").html(_("Enabling beamforming…")).removeClass("none");
        } else {
            $("#waitingTip").html(_("Disabling beamforming…")).removeClass("none");
        }
    });
}

function callback(str) {
    if (!top.isTimeout(str)) {
        return;
    }
    var num = $.parseJSON(str).errCode;
    //top.showSaveMsg(num);
    if (num == 0) {
        top.wrlInfo.initValue();
        setTimeout(function() {
            getValue();
            $("#waitingTip").html(" ").addClass("none");            
        }, 2000);
    }
}

function getValue() {
    $.getJSON("goform/WifiBeamformingGet?" + Math.random(), initValue);
}

function initValue(obj) {
    initObj = obj;
    $("#bfEn").attr("class", (obj.beamformingEn === "1") ? "btn-on" : "btn-off" );
}