define(function (require, exports, module) {
    function ModuleLogic(view, submit) {
        //ssid /^[!#; ]|[?"$\[\\+]+|(BTWifi)+|(Auto-BT)+|(BTOpenzone)+|(BTFON)+|( )$|[^ -~]/i
        //ssid /^(DIRECT)/
        var that = this;
        var view = view;
        view.initFlag = false;
        this.init = function () {
            view.addEvent();
            // this.checkData();
        };
    }

    var moduleView = new ModuleView();
    var moduleSubmit = new ModuleSubmit();
    moduleView.addEvent = function () {
        $(".help-back-top").on("click", function () {
            window.scrollTo(0, 0);
        });
    };

    // module logic
    var moduleLogic = new ModuleLogic(moduleView, moduleSubmit);

    module.exports = moduleLogic;
})