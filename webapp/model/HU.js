sap.ui.define(["sap/ui/base/Object"], function (t) {
    "use strict"; return t.extend("sacia.transfer.out.model.HU", {
        intNum: null, extNum: null,

        constructor: function (t) {
            this.extNum = t
        },

        convertToIntNum: function (t) {
            if (isNaN(this.extNum.charAt(0))) {
                this.extNum = this.extNum.substring(1, this.extNum.length)
            }

            var i = this.extNum.length;
            this.intNum = this.extNum;

            for (var u = 0; u < t - i; u++) {
                this.intNum = "0" + this.intNum
            }

            return this.intNum
        }
    })
});