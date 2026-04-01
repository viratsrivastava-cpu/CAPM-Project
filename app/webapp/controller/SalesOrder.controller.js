sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function (Controller, MessageBox) {

    "use strict";

    return Controller.extend("zsd.controller.SalesOrder", {

        BASE: "/odata/v4/sales-order/ZSO_VBAK",
        ITEM_BASE: "/odata/v4/sales-order/ZSO_VBAP",

        /* ================= INIT ================= */

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("orders").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var m = this.getView().getModel();
            if (!m) { return; }
            m.setProperty("/showOperationSelector", true);
            m.setProperty("/showCreatePanel", false);
            m.setProperty("/showReadPanel", false);
            m.setProperty("/showUpdatePanel", false);
            m.setProperty("/showDeletePanel", false);
            m.setProperty("/showReadResult", false);
            m.setProperty("/showDeleteResult", false);
            m.setProperty("/editMode", false);
            m.setProperty("/createPayload", {});
            m.setProperty("/itemPayload", {});
        },

        /* ================= CSRF TOKEN ================= */

        _fetchCsrfToken: function () {
            return fetch("/odata/v4/SalesOrderService/", {
                method: "GET",
                headers: { "X-CSRF-Token": "Fetch" }
            }).then(function (r) {
                return r.headers.get("X-CSRF-Token") || "";
            }).catch(function () {
                return "";
            });
        },

        /* ================= HOME NAVIGATION ================= */

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("home");
        },

        /* ================= PANEL NAVIGATION ================= */

        onCreate: function () {
            var m = this.getView().getModel();
            m.setProperty("/showOperationSelector", false);
            m.setProperty("/showCreatePanel", true);
            m.setProperty("/showReadPanel", false);
            m.setProperty("/showUpdatePanel", false);
            m.setProperty("/showDeletePanel", false);
            m.setProperty("/createPayload", {
                VBELN: "",
                ERDAT: "",
                KUNNR: "",
                ERNAM: ""
            });
        },

        onRead: function () {
            var m = this.getView().getModel();
            m.setProperty("/showOperationSelector", false);
            m.setProperty("/showCreatePanel", false);
            m.setProperty("/showReadPanel", true);
            m.setProperty("/showUpdatePanel", false);
            m.setProperty("/showDeletePanel", false);
            m.setProperty("/readVBELN", "");

            // Default table load
            fetch(this.BASE)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    m.setProperty("/salesOrders", data.value || []);
                    m.setProperty("/showReadResult", true);
                })
                .catch(function () {
                    MessageBox.error("Unable to fetch data");
                });
        },

        onUpdate: function () {
            var m = this.getView().getModel();
            m.setProperty("/showOperationSelector", false);
            m.setProperty("/showCreatePanel", false);
            m.setProperty("/showReadPanel", false);
            m.setProperty("/showUpdatePanel", true);
            m.setProperty("/showDeletePanel", false);
            m.setProperty("/editMode", false);
            m.setProperty("/searchVBELN", "");
        },

        onDelete: function () {
            var m = this.getView().getModel();
            m.setProperty("/showOperationSelector", false);
            m.setProperty("/showCreatePanel", false);
            m.setProperty("/showReadPanel", false);
            m.setProperty("/showUpdatePanel", false);
            m.setProperty("/showDeletePanel", true);
            m.setProperty("/showDeleteResult", false);
            m.setProperty("/deleteVBELN", "");
        },

        /* ================= CREATE ================= */

        onSave: function () {
            var m = this.getView().getModel();
            var payload = m.getProperty("/createPayload");

            if (!payload.VBELN || payload.VBELN.trim() === "") {
                MessageBox.warning("VBELN required");
                return;
            }

            // ERDAT format check — CAP ko ISO date chahiye
            var sendPayload = {
                VBELN: payload.VBELN.trim(),
                KUNNR: payload.KUNNR || "",
                ERNAM: payload.ERNAM || ""
            };

            if (payload.ERDAT && payload.ERDAT.trim() !== "") {
                sendPayload.ERDAT = payload.ERDAT.trim();
            }

            this._fetchCsrfToken().then(function (token) {
                return fetch(this.BASE, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": token
                    },
                    body: JSON.stringify(sendPayload)
                });
            }.bind(this))
            .then(function (r) {
                if (r.ok || r.status === 201) {
                    MessageBox.success("Sales Order Created Successfully");
                    m.setProperty("/createPayload", {
                        VBELN: "", ERDAT: "", KUNNR: "", ERNAM: ""
                    });
                } else {
                    return r.json().then(function (err) {
                        var msg = (err.error && err.error.message) ? err.error.message : "Creation Failed";
                        MessageBox.error(msg);
                    });
                }
            })
            .catch(function () {
                MessageBox.error("Network Error");
            });
        },

        /* ================= READ SEARCH ================= */

        onSearchSalesOrder: function () {
            var m = this.getView().getModel();
            var id = m.getProperty("/readVBELN");
            var url = this.BASE;

            if (id && id.trim() !== "") {
                url = this.BASE + "?$filter=contains(VBELN,'" + id.trim() + "')";
            }

            fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    m.setProperty("/salesOrders", data.value || []);
                    m.setProperty("/showReadResult", true);
                })
                .catch(function () {
                    MessageBox.error("Search failed");
                });
        },

        /* ================= SALES ORDER ITEM DIALOG ================= */

        onOpenCreateItemDialog: function () {
            var oView = this.getView();
            oView.getModel().setProperty("/itemPayload", {
                VBELN: "", POSNR: "", MATNR: "",
                MATKL: "", MENGE: "", MEINS: "",
                NETPR: "", PEINH: ""
            });
            oView.byId("createItemDialog").open();
        },

        onCloseItemDialog: function () {
            this.getView().byId("createItemDialog").close();
        },

        onSaveItem: function () {
            var m = this.getView().getModel();
            var payload = m.getProperty("/itemPayload");
            var that = this;

            if (!payload.VBELN || !payload.POSNR || !payload.MATNR) {
                MessageBox.warning("VBELN, POSNR and MATNR required");
                return;
            }

            var sendPayload = {
                VBELN: payload.VBELN.trim(),
                POSNR: payload.POSNR.trim(),
                MATNR: payload.MATNR.trim(),
                MATKL: payload.MATKL || "",
                MEINS: payload.MEINS || "",
                PEINH: payload.PEINH || ""
            };

            if (payload.MENGE && payload.MENGE !== "") {
                sendPayload.MENGE = parseFloat(payload.MENGE);
            }
            if (payload.NETPR && payload.NETPR !== "") {
                sendPayload.NETPR = parseFloat(payload.NETPR);
            }

            this._fetchCsrfToken().then(function (token) {
                return fetch(that.ITEM_BASE, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": token
                    },
                    body: JSON.stringify(sendPayload)
                });
            })
            .then(function (r) {
                if (r.ok || r.status === 201) {
                    MessageBox.success("Sales Order Item Created Successfully");
                    that.onCloseItemDialog();
                } else {
                    return r.json().then(function (err) {
                        var msg = (err.error && err.error.message) ? err.error.message : "Item Creation Failed";
                        MessageBox.error(msg);
                    });
                }
            })
            .catch(function () {
                MessageBox.error("Network Error");
            });
        },

        /* ================= UPDATE LOAD ================= */

        onEditSalesOrder: function () {
            var m = this.getView().getModel();
            var vbeln = m.getProperty("/searchVBELN");

            if (!vbeln || vbeln.trim() === "") {
                MessageBox.warning("VBELN enter karo");
                return;
            }

            fetch(this.BASE + "?$filter=contains(VBELN,'" + vbeln.trim() + "')")
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.value && data.value.length > 0) {
                        m.setProperty("/editPayload", data.value[0]);
                        m.setProperty("/editMode", true);
                    } else {
                        MessageBox.warning("Sales Order not found");
                    }
                })
                .catch(function () {
                    MessageBox.error("Sales Order not found");
                });
        },

        /* ================= UPDATE SAVE ================= */

        onUpdateSalesOrder: function () {
            var m = this.getView().getModel();
            var payload = m.getProperty("/editPayload");

            if (!payload.VBELN) {
                MessageBox.warning("VBELN missing");
                return;
            }

            var sendPayload = {
                KUNNR: payload.KUNNR || "",
                ERNAM: payload.ERNAM || ""
            };

            if (payload.ERDAT && payload.ERDAT.trim() !== "") {
                sendPayload.ERDAT = payload.ERDAT;
            }

            this._fetchCsrfToken().then(function (token) {
                return fetch(this.BASE + "('" + payload.VBELN + "')", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": token
                    },
                    body: JSON.stringify(sendPayload)
                });
            }.bind(this))
            .then(function (r) {
                if (r.ok || r.status === 204) {
                    MessageBox.success("Sales Order Updated Successfully");
                    m.setProperty("/editMode", false);
                    m.setProperty("/searchVBELN", "");
                } else {
                    return r.json().then(function (err) {
                        var msg = (err.error && err.error.message) ? err.error.message : "Update Failed";
                        MessageBox.error(msg);
                    });
                }
            })
            .catch(function () {
                MessageBox.error("Network Error");
            });
        },

        onCancelEdit: function () {
            this.getView().getModel().setProperty("/editMode", false);
        },

        /* ================= DELETE SEARCH ================= */

        onDeleteSearch: function () {
            var m = this.getView().getModel();
            var id = m.getProperty("/deleteVBELN");
            var url = this.BASE;

            if (id && id.trim() !== "") {
                url = this.BASE + "?$filter=contains(VBELN,'" + id.trim() + "')";
            }

            fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    m.setProperty("/salesOrders", data.value || []);
                    m.setProperty("/showDeleteResult", true);
                })
                .catch(function () {
                    MessageBox.error("Search failed");
                });
        },

        /* ================= DELETE ================= */

        onDeleteSelected: function () {
            var table = this.byId("idDeleteTable");
            var indices = table.getSelectedIndices();

            if (indices.length === 0) {
                MessageBox.warning("Select rows");
                return;
            }

            var model = this.getView().getModel();
            var rows = model.getProperty("/salesOrders");
            var base = this.BASE;

            MessageBox.confirm("Do you want to delete selected Sales Orders ?", {
                onClose: function (action) {
                    if (action === MessageBox.Action.OK) {

                        this._fetchCsrfToken().then(function (token) {
                            var promises = [];
                            for (var i = 0; i < indices.length; i++) {
                                var vbeln = rows[indices[i]].VBELN;
                                promises.push(
                                    fetch(base + "('" + vbeln + "')", {
                                        method: "DELETE",
                                        headers: { "X-CSRF-Token": token }
                                    })
                                );
                            }
                            return Promise.all(promises);
                        }.bind(this))
                        .then(function () {
                            MessageBox.success("Deleted Successfully");
                            model.setProperty("/showDeleteResult", false);
                            model.setProperty("/salesOrders", []);
                            model.setProperty("/deleteVBELN", "");
                        })
                        .catch(function () {
                            MessageBox.error("Delete failed");
                        });
                    }
                }.bind(this)
            });
        },

        /* ================= BACK ================= */

        onBack: function () {
            var m = this.getView().getModel();
            m.setProperty("/showOperationSelector", true);
            m.setProperty("/showCreatePanel", false);
            m.setProperty("/showReadPanel", false);
            m.setProperty("/showUpdatePanel", false);
            m.setProperty("/showDeletePanel", false);
            m.setProperty("/showReadResult", false);
            m.setProperty("/showDeleteResult", false);
            m.setProperty("/editMode", false);
        }

    });
});