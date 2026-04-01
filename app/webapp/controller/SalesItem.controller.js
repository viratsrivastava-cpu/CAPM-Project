sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function (Controller, MessageBox) {

    "use strict";

    return Controller.extend("zsd.controller.SalesItem", {

        BASE: "/odata/v4/sales-order/ZSO_VBAK",
        ITEM_BASE: "/odata/v4/sales-order/ZSO_VBAP",

        /* ================= INIT ================= */

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("items").attachPatternMatched(this._onRouteMatched, this);
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
            m.setProperty("/editPayload", {});
            m.setProperty("/salesItems", []);
            m.setProperty("/readVBELN", "");
            m.setProperty("/readPOSNR", "");
            m.setProperty("/searchVBELN", "");
            m.setProperty("/searchPOSNR", "");
            m.setProperty("/deleteVBELN", "");
            m.setProperty("/deletePOSNR", "");
        },

        /* ================= CSRF TOKEN ================= */

        _fetchCsrfToken: function () {
            return fetch("/odata/v4/sales-order/", {
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
                VBELN: "", POSNR: "", MATNR: "",
                MATKL: "", MENGE: "", MEINS: "",
                NETPR: "", PEINH: ""
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
            m.setProperty("/readPOSNR", "");

            // Default — poori table load karo
            fetch(this.ITEM_BASE)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    m.setProperty("/salesItems", data.value || []);
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
            m.setProperty("/searchPOSNR", "");
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
            m.setProperty("/deletePOSNR", "");
        },

        /* ================= CREATE ================= */

        onSave: function () {
            var m = this.getView().getModel();
            var payload = m.getProperty("/createPayload");

            if (!payload.VBELN || payload.VBELN.trim() === "") {
                MessageBox.warning("VBELN required hai");
                return;
            }
            if (!payload.POSNR || payload.POSNR.trim() === "") {
                MessageBox.warning("POSNR required hai");
                return;
            }
            if (!payload.MATNR || payload.MATNR.trim() === "") {
                MessageBox.warning("MATNR required hai");
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
                return fetch(this.ITEM_BASE, {
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
                    MessageBox.success("Sales Order Item Created Successfully");
                    m.setProperty("/createPayload", {
                        VBELN: "", POSNR: "", MATNR: "",
                        MATKL: "", MENGE: "", MEINS: "",
                        NETPR: "", PEINH: ""
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

        onSearchItem: function () {
            var m = this.getView().getModel();
            var vbeln = m.getProperty("/readVBELN");
            var posnr = m.getProperty("/readPOSNR");
            var url = this.ITEM_BASE;
            var filters = [];

            if (vbeln && vbeln.trim() !== "") {
                filters.push("contains(VBELN,'" + vbeln.trim() + "')");
            }
            if (posnr && posnr.trim() !== "") {
                filters.push("contains(POSNR,'" + posnr.trim() + "')");
            }

            if (filters.length > 0) {
                url = this.ITEM_BASE + "?$filter=" + filters.join(" and ");
            }

            fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    m.setProperty("/salesItems", data.value || []);
                    m.setProperty("/showReadResult", true);
                })
                .catch(function () {
                    MessageBox.error("Search failed");
                });
        },

        /* ================= UPDATE LOAD ================= */

        onEditItem: function () {
            var m = this.getView().getModel();
            var vbeln = m.getProperty("/searchVBELN");
            var posnr = m.getProperty("/searchPOSNR");

            if (!vbeln || vbeln.trim() === "") {
                MessageBox.warning("VBELN enter karo");
                return;
            }
            if (!posnr || posnr.trim() === "") {
                MessageBox.warning("POSNR enter karo");
                return;
            }

            // Composite key — VBELN aur POSNR dono se fetch
            fetch(this.ITEM_BASE + "(VBELN='" + vbeln.trim() + "',POSNR='" + posnr.trim() + "')")
                .then(function (r) {
                    if (!r.ok) { throw new Error("Not found"); }
                    return r.json();
                })
                .then(function (data) {
                    m.setProperty("/editPayload", data);
                    m.setProperty("/editMode", true);
                })
                .catch(function () {
                    // Exact nahi mila — contains se try karo
                    var filters = ["contains(VBELN,'" + vbeln.trim() + "')"];
                    if (posnr.trim() !== "") {
                        filters.push("contains(POSNR,'" + posnr.trim() + "')");
                    }
                    fetch(this.ITEM_BASE + "?$filter=" + filters.join(" and "))
                        .then(function (r) { return r.json(); })
                        .then(function (data) {
                            if (data.value && data.value.length > 0) {
                                m.setProperty("/editPayload", data.value[0]);
                                m.setProperty("/editMode", true);
                            } else {
                                MessageBox.warning("Koi Item nahi mila");
                            }
                        });
                }.bind(this));
        },

        /* ================= UPDATE SAVE ================= */

        onUpdateItem: function () {
            var m = this.getView().getModel();
            var payload = m.getProperty("/editPayload");

            if (!payload.VBELN || !payload.POSNR) {
                MessageBox.warning("VBELN aur POSNR missing hain");
                return;
            }

            // Key fields nahi bhejna — sirf editable fields
            var sendPayload = {
                MATKL: payload.MATKL || "",
                MEINS: payload.MEINS || "",
                PEINH: payload.PEINH || ""
            };

            if (payload.MENGE !== undefined && payload.MENGE !== "") {
                sendPayload.MENGE = parseFloat(payload.MENGE);
            }
            if (payload.NETPR !== undefined && payload.NETPR !== "") {
                sendPayload.NETPR = parseFloat(payload.NETPR);
            }

            // Composite key URL
            var url = this.ITEM_BASE + "(VBELN='" + payload.VBELN + "',POSNR='" + payload.POSNR + "')";

            this._fetchCsrfToken().then(function (token) {
                return fetch(url, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": token
                    },
                    body: JSON.stringify(sendPayload)
                });
            })
            .then(function (r) {
                if (r.ok || r.status === 204) {
                    MessageBox.success("Item Updated Successfully");
                    m.setProperty("/editMode", false);
                    m.setProperty("/searchVBELN", "");
                    m.setProperty("/searchPOSNR", "");
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
            var vbeln = m.getProperty("/deleteVBELN");
            var posnr = m.getProperty("/deletePOSNR");
            var url = this.ITEM_BASE;
            var filters = [];

            if (vbeln && vbeln.trim() !== "") {
                filters.push("contains(VBELN,'" + vbeln.trim() + "')");
            }
            if (posnr && posnr.trim() !== "") {
                filters.push("contains(POSNR,'" + posnr.trim() + "')");
            }

            if (filters.length > 0) {
                url = this.ITEM_BASE + "?$filter=" + filters.join(" and ");
            }

            fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    m.setProperty("/salesItems", data.value || []);
                    m.setProperty("/showDeleteResult", true);
                })
                .catch(function () {
                    MessageBox.error("Search failed");
                });
        },

        /* ================= DELETE ================= */

        onDeleteSelected: function () {
            var table = this.byId("idDeleteItemTable");
            var indices = table.getSelectedIndices();

            if (indices.length === 0) {
                MessageBox.warning("Pehle rows select karo");
                return;
            }

            var model = this.getView().getModel();
            var rows = model.getProperty("/salesItems");
            var base = this.ITEM_BASE;

            MessageBox.confirm("Kya aap selected Items delete karna chahte hain?", {
                onClose: function (action) {
                    if (action === MessageBox.Action.OK) {
                        this._fetchCsrfToken().then(function (token) {
                            var promises = [];
                            for (var i = 0; i < indices.length; i++) {
                                var vbeln = rows[indices[i]].VBELN;
                                var posnr = rows[indices[i]].POSNR;
                                promises.push(
                                    fetch(base + "(VBELN='" + vbeln + "',POSNR='" + posnr + "')", {
                                        method: "DELETE",
                                        headers: { "X-CSRF-Token": token }
                                    })
                                );
                            }
                            return Promise.all(promises);
                        })
                        .then(function () {
                            MessageBox.success("Items Deleted Successfully");
                            model.setProperty("/showDeleteResult", false);
                            model.setProperty("/salesItems", []);
                            model.setProperty("/deleteVBELN", "");
                            model.setProperty("/deletePOSNR", "");
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