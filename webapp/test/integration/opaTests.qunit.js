/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require(["sacia/transfer/out/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
