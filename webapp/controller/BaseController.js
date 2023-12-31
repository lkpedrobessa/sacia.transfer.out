sap.ui.define(
    // eslint-disable-next-line linebreak-style
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/UIComponent"
    ],

    function (Controller, UIComponent) {
        "use strict";

        return Controller.extend("sacia.transfer.out.controller.BaseController", {
            /**
                 * Convenience method for getting the view model by name in every controller of the application.
                 * @public
                 * @param {string} sName the model name
                 * @returns {sap.ui.model.Model} the model instance
                 */
            getModel: function (sName) {
                return this.getView().getModel(sName);
            },

            getModel: function () {
                return this.getView().getModel();
            },

            /**
             * Convenience method for setting the view model in every controller of the application.
             * @public
             * @param {sap.ui.model.Model} oModel the model instance
             * @param {string} sName the model name
             * @returns {sap.ui.mvc.View} the view instance
             */
            setModel: function (oModel, sName) {
                return this.getView().setModel(oModel, sName);
            },

            /**
             * Convenience method for getting the resource bundle.
             * @public
             * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
             */
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

			getRouter: function () {
				return UIComponent.getRouterFor(this);
			},
        });
    }

);