sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("zsd.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            // JSONModel seedha yahan banao — models.js pe depend mat karo
            var oModel = new JSONModel({
                showOperationSelector: true,
                showCreatePanel: false,
                showReadPanel: false,
                showUpdatePanel: false,
                showDeletePanel: false,
                showReadResult: false,
                showDeleteResult: false,
                editMode: false,
                createPayload: {},
                itemPayload: {},
                editPayload: {},
                salesOrders: [],
                readVBELN: "",
                searchVBELN: "",
                deleteVBELN: ""
            });

            this.setModel(oModel);

            // Router initialize — init ke BAAD
            this.getRouter().initialize();
        }
    });
});