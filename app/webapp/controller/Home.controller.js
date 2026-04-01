sap.ui.define(["sap/ui/core/mvc/Controller"], function(Controller) {
    "use strict";
    return Controller.extend("zsd.controller.Home", {
        onInit: function() {},
        onSalesOrder: function() {
            this.getOwnerComponent().getRouter().navTo("orders");
        },
        onSalesItem: function() {
            this.getOwnerComponent().getRouter().navTo("items");
        }
    });
});
