sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    return {
        createDefaultModel: function () {
            return new JSONModel({
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
        }
    };
});