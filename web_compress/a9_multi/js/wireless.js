define(function (require, exports, module) {
    function ModuleLogic(view, submit) {

        var that = this;
        var view = view;
        view.initFlag = false;
        this.init = function () {
            view.getValue('goform/getWifi', {
                module1: 'wifiBasic'
            });
            view.addEvent();
            // this.checkData();
        };
        this.reCancel = function () {
            $("#wifiSSID").removeValidateTip(true).parent().removeClass("has-feedback has-error");
            $("#wifiPwd").removeValidateTip(true).parent().removeClass("has-feedback has-error");
            view.getValue('goform/getWifi', {
                module1: 'wifiBasic'
            });
        };
        this.checkData = function () {
            //var noNeedPwd = $('#wifiNoPwd')[0].checked ? true : false;
            /*if ($('#wifiPwd').val() === "") {
                return _("Please specify a WiFi password.");
            }*/
        };
        this.validate = $.validate({
            custom: function () {
                var msg = that.checkData();
                if (msg) {
                    return msg;
                }
            },
            success: function () {
                var data = view.getSubmitData();
                var subObj = {
                    url: "goform/setWifi",
                    subData: data,
                    successCallback: view.successCallback,
                    errorCallback: view.showErrMsg
                };

                submit.preSubmit(subObj);
            },
            error: function (msg) {
                if (msg) {
                    view.showInvalidError(msg);
                }
            }
        });
    }

    var moduleView = new ModuleView();
    var moduleSubmit = new ModuleSubmit();
    var decode = new Decode();
    moduleView.initValue = function (obj) {
        moduleView.data = obj.wifiBasic;
        moduleView.data.wifiPwd = decode(moduleView.data.wifiPwd);
        inputValue(moduleView.data);

        //不加密时密码初始化为空
        if (moduleView.data.wifiSecurityMode == "NONE") {
            $("#wifiPwd").val('');
        }
        if (!$("#wifiPwd_").length) {
            $("#wifiPwd").initPassword('', true);
        }
        //G_last_password = moduleView.data.wifiPwd;
        //needPwd();
    };
    moduleView.addEvent = function () {
        //$('#wifiNoPwd').on('click', needPwd);

        // For IE6 not suppost change input type
        var newInput,
            $ele = $("#wifiPwd");
        if (isSupChangeType($ele)) {
            $('#iconContainer').on('click', '.icon-show', function () {
                $(this).removeClass('icon-show').addClass('icon-hide');
                $ele.attr('type', "text");
            });
            $('#iconContainer').on('click', '.icon-hide', function () {
                $(this).removeClass('icon-hide').addClass('icon-show');
                $ele.attr('type', "password");
            });
        } else {
            /*if (!document.getElementById('wifiPwd_')) {
                newInput = createTextInput(document.getElementById('wifiPwd'), "iconContainer");
            }*/
        }

        $.validate.valid.ssid2 = {
            all: function (str) {
                var ret = this.specific(str);

                if (ret) {
                    return ret;
                }
            },
            specific: function (str) {
                //ssid /^[!#; ]|[?"$\[\\+]+|(BTWifi)+|(Auto-BT)+|(BTOpenzone)+|(BTFON)+|( )$|[^ -~]/i
                //ssid /^(DIRECT)/
                var rel1 = /[?"$\[\\+]+/g,
                    rel2 = /^[!#;]/,
                    rel3 = /^( )|( )$/,
                    rel4 = /^(DIRECT)/i,
                    rel5 = /(BTWifi)+|(BTWi-fi)+|(Auto-BT)+|(BTOpenzone)+|(BTFON)/i,
                    rel6 = /[^ -~]/g;

                if (rel1.test(str)) {
                    return _("The following six characters are not allowed in an SSID:  ? \" $ [ \\ +");
                }

                if (rel2.test(str)) {
                    return _("The following three characters cannot be the first in the SSID string ! # ;")
                }

                if (rel3.test(str)) {
                    return _("A '&lt;space&gt;' MUST not be the first or last character in the SSID")
                }

                if (rel4.test(str)) {
                    return _("The SSID MUST not start with the string 'DIRECT'")
                }

                if (rel5.test(str)) {
                    return _("The wireless SSID must not contain the text \"BTWifi\", \"BTWi-fi\", \"Auto-BT\", \"BTOpenzone\" or \"BTFON\" (Case insensitive)")
                }

                if (rel6.test(str)) {
                    return _("Must be ASCII.");
                }
            }
        }
    };

    var G_last_password;

    /*function needPwd(event) { //如果选择无须密码,则disable密码输入框.
        var flag = $('#wifiNoPwd')[0].checked ? true : false;
        if (flag) {
            G_last_password = $('#wifiPwd').val() || $('#wifiPwd_').val();
            $('#wifiPwd').attr('disabled', true);
            $('#wifiPwd').parent().attr('disabled', true);
            $('#wifiPwd').val('');
            $('#wifiPwd_').attr('disabled', true);
            $('#wifiPwd_').val('');
            $("#wifiPwd").hideValidateTip();
        } else {
            $('#wifiPwd').attr('disabled', false);
            $('#wifiPwd').parent().attr('disabled', false);
            $('#wifiPwd_').attr('disabled', false);
            //if (event) {
            $('#wifiPwd').val(G_last_password);
            $('#wifiPwd_').val(G_last_password);
            //}
        }

    }*/

    moduleView.getSubmitData = function () {
        var obj = {
            module1: "setWifiBasic",
            wifiSSID: $('#wifiSSID').val(),
            wifiPwd: $('#wifiPwd').val(),
            //wifiNoPwd: "false",
            wifiHideSSID: $('#wifiHideSSID')[0].checked ? "true" : "false"
        }

        return objToString(obj);
    };

    // Support change input type or not
    function isSupChangeType(passwordElem) {
        try {
            passwordElem.attr("type", "text");
            if (passwordElem.attr("type") === 'text') {
                passwordElem.attr("type", "password");
                return true;
            }
        } catch (d) {
            return false;
        }

    }

    // module logic
    var moduleLogic = new ModuleLogic(moduleView, moduleSubmit);

    module.exports = moduleLogic;
})