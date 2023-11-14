sap.ui.define([
    "sacia/transfer/out/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessagePopover",
    "sap/m/MessageItem"
],
    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         */
    function (BaseController, JSONModel, MessageBox, MessageToast, Fragment, Filter, FilterOperator, MessagePopover, MessageItem) {
        "use strict";

        return BaseController.extend("sacia.transfer.out.controller.Main", {
            oViewModel: new JSONModel(),
            oDataModel: new JSONModel(),
            oEmbalagensListModel: new JSONModel(),
            aEmbalagens: [],

            onInit: function () {
                this.initViewModel();
                this.initDataModel();
                this.initEmbalagensListModel();
                this.getRouter().getRoute("RouteMainView").attachPatternMatched(this.onNavigation, this);
                //this.initErrorModel();
                //this.initMessagePopOver();
            },

            initViewModel: function () {
                var oViewModel = {
                    busy: false,
                    embalagensCount: "0",
                    dialogEnabled: false,
                    messagesButtonVisible: false
                };

                this.oViewModel.setData(oViewModel);
                this.setModel(this.oViewModel, "viewModel");
            },

            onNavigation: function(){
                this.initViewModel();
                this.initDataModel();
                this.initEmbalagensListModel();
            },

            initDataModel: function () {
                var oDataModel = {
                    hu: "",
                    destStorageLocationValue: "A9",
                    embalagens: [],
                    truckValue: "",
                    batch: "",
                    material: "",
                    plant: "",
                    armOrigem: "",
                    quantity: ""
                };

                this.oDataModel.setData(oDataModel);
                this.setModel(this.oDataModel, "dataModel");
            },

            initEmbalagensListModel: function () {
                this.aEmbalagens = [],
                this.oEmbalagensListModel.setData({});
                this.setModel(this.oEmbalagensListModel, "embalagensListModel");
            },

            initErrorModel: function () {
                var oErrorModel = new JSONModel();
                this.setModel(oErrorModel, "errorModel");
            },

            initMessagePopOver: function () {
                var oErrorModel = this.getModel("errorModel");
                var oMessageTemplate = new MessageItem("", {
                    type: "{severity}",
                    title: "{message}",
                    description: "{message}",
                });

                this._oMessagePopover = new MessagePopover("", {
                    items: {
                        path: "/",
                        template: oMessageTemplate,
                    },
                });
                this._oMessagePopover.setModel(oErrorModel);

                this.setModel(oErrorModel, "errorModel");
            },

            onAfterRendering: function () {
                var that = this;

                this.oEmbalagensListModel.setData(null);
                this.oViewModel.setProperty("/dialogEnabled", false);
                this.oDataModel.setProperty("/truckValue", "");
                this.oViewModel.setProperty("/messagesButtonVisible", false);
            },

            onAddPackId: function (oEvent) {
                var that = this;
                var found = false;
                var hu = oEvent.mParameters.value

                if (oEvent.mParameters.value !== "") {
                    for (var i = 0; i < this.aEmbalagens.length; i++) {
                        if (oEvent.mParameters.value == this.aEmbalagens[i].ExternalHandlingUnitNumber) {
                            found = true;
                        }
                    }
                }

                if (!found) {
                    var url = "/HUSet";
                    var aFilters = [];

                    aFilters.push(new Filter("Externalhandlingunitnumber", FilterOperator.EQ, oEvent.mParameters.value.toString().padStart(20, '0')));

                    sap.ui.core.BusyIndicator.show();

                    this.getModel().read(url, {
                        filters: aFilters,
                        success: function (oData) {
                            sap.ui.core.BusyIndicator.hide();

                            if (oData.results.length > 0) {
                                var reg = {
                                    ExternalHandlingUnitNumber: hu,
                                    Batch: oData.results[0].Batchnumber,
                                    Material: oData.results[0].Materialnumber,
                                    Quantity: oData.results[0].Quantity,
                                    Unit: oData.results[0].Quantityunit,
                                    Plant: oData.results[0].Plant,
                                    ArmOrigem: oData.results[0].Warehousenumber,
                                };

                                that.aEmbalagens.push(reg);
                                MessageToast.show(that.getResourceBundle().getText("packAdded"));

                                that.oEmbalagensListModel.setData({ modelData: that.aEmbalagens });
                                that.oViewModel.setProperty("/embalagensCount", that.aEmbalagens.length.toString());
                                that.getView().byId("__input0").setValue("");

                                if (that.aEmbalagens.length > 0) {
                                    that.oViewModel.setProperty("/dialogEnabled", true);
                                } else {
                                    that.oViewModel.setProperty("/dialogEnabled", false);
                                }
                            } else {
                                MessageBox.error(this.getResourceBundle().getText("packNotExists"));
                            }
                        },
                        error: function () {
                        }
                    });
                } else {
                    MessageBox.error(this.getResourceBundle().getText("packExists"));
                }

                this.oEmbalagensListModel.setData({ modelData: this.aEmbalagens });
                this.oViewModel.setProperty("/embalagensCount", this.aEmbalagens.length.toString());
                this.getView().byId("__input0").setValue("");

                if (this.aEmbalagens.length > 0) {
                    this.oViewModel.setProperty("/dialogEnabled", true);
                } else {
                    this.oViewModel.setProperty("/dialogEnabled", false);
                }
            },

            onDeleteEmbalagem: function (oEvent) {
                for (var i = 0; i < this.aEmbalagens.length; i++) {
                    if (oEvent.mParameters.listItem.mProperties.title == this.aEmbalagens[i].ExternalHandlingUnitNumber) {
                        MessageToast.show(this.getResourceBundle().getText("embalagemDeleted"));

                        this.aEmbalagens.splice(i, 1);

                        break;
                    }
                }

                if (this.aEmbalagens.length > 0) {
                    this.oViewModel.setProperty("/dialogEnabled", true);
                } else {
                    this.oViewModel.setProperty("/dialogEnabled", false);
                }

                this.oEmbalagensListModel.setData({ modelData: this.aEmbalagens });
                this.oDataModel.setProperty("/embalagens", this.aEmbalagens);
                this.oViewModel.setProperty("/embalagensCount", this.aEmbalagens.length.toString());
            },

            onMessagesButtonPress: function (oEvent) {
                this._oMessagePopover.openBy(oEvent.getSource());
            },

            onOpenTruckArmDestDialog: function (oEvent) {
                var event = oEvent.getSource();
                var oView = this.getView();
                var that = this;

                if (!that.byId("truckArmDestinoDialog")) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "sacia.transfer.out.view.TruckArmDestinoDialog",
                        controller: that
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.open();
                    }, this);
                } else {
                    that.byId("truckArmDestinoDialog").open();
                }
            },

            onCancel: function (oEvent) {
                oEvent.getSource().getParent().close();
            },

            onTransfer: function (oEvent) {
                var that = this;
                var oComponent = this.getOwnerComponent();
                var oModel = oComponent.getModel();

                var truck = this.oDataModel.getProperty("/truckValue");
                var armDestino = this.oDataModel.getProperty("/destStorageLocationValue");

                sap.ui.core.BusyIndicator.show();

                oModel.callFunction(
                    "/move_hu", { // function import name
                    method: "POST", // http method
                    urlParameters: {
                        I_HUID_LIST: JSON.stringify(this.aEmbalagens).toUpperCase(),
                        IV_TRUCK: truck,
                        IV_TARGET_LOCAL: armDestino,
                    },
                    success: function (oDataNew, response) {
                        sap.ui.core.BusyIndicator.hide();

                        var oSuccessModel = new JSONModel();
                        that.setModel(oSuccessModel, "successModel");

                        let oMsgModel = [];

                        var oMessageTemplate = new MessageItem("", {
                            type: "{severity}",
                            title: "{message}",
                            description: "{message}",
                        });

                        that._oMessagePopover = new MessagePopover("", {
                            items: {
                                path: "/",
                                template: oMessageTemplate,
                            },
                        });
                        that._oMessagePopover.setModel(oSuccessModel);

                        that.setModel(oSuccessModel, "successModel");

                        for (var i = 0; i < oDataNew.results.length; i++) {
                            oMsgModel.push({
                                "severity": sap.ui.core.MessageType.Success,
                                "message": oDataNew.results[i].Message
                            });
                        }

                        oSuccessModel.setData(oMsgModel);

                        let oButton = that.byId("idMsgPopover");

                        setTimeout(function () {
                            that._oMessagePopover.openBy(oButton);
                        }, 10);

                        that.oEmbalagensListModel.setData(null);
                        that.aEmbalagens = [];
                        that.oViewModel.setProperty("/dialogEnabled", false);
                    },
                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();

                        var oErrorModel = new JSONModel();
                        that.setModel(oErrorModel, "errorModel");

                        let oMsgModel = [];

                        var oMessageTemplate = new MessageItem("", {
                            type: "{severity}",
                            title: "{message}",
                            description: "{message}",
                        });

                        that._oMessagePopover = new MessagePopover("", {
                            items: {
                                path: "/",
                                template: oMessageTemplate,
                            },
                        });
                        that._oMessagePopover.setModel(oErrorModel);

                        that.setModel(oErrorModel, "errorModel");

                        if (oError.statusCode == "500") {
                            oMsgModel.push({
                                "severity": sap.ui.core.MessageType.Error,
                                "message": oError.statusText
                            });
                        } else {
                            var oReponseBody = JSON.parse(
                                oError.responseText
                            );

                            oMsgModel.push({
                                "severity": sap.ui.core.MessageType.Error,
                                "message": oReponseBody.error.innererror.errordetails[0].message
                            });
                        }

                        oErrorModel.setData(oMsgModel);

                        let oButton = that.byId("idMsgPopover");

                        setTimeout(function () {
                            that._oMessagePopover.openBy(oButton);
                        }, 10);
                    }
                });

                this.oViewModel.setProperty("/messagesButtonVisible", true);
                this.oDataModel.setProperty("/truckValue", "");
                oEvent.getSource().getParent().close();
            }
        })
    }
)