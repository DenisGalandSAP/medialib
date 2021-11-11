/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library flexso.be.medialib.
 */
sap.ui.define([
	"sap/ui/core/library"
], function () {
	"use strict";

	// delegate further initialization of this library to the Core
	// Hint: sap.ui.getCore() must still be used to support preload with sync bootstrap!
	sap.ui.getCore().initLibrary({
		name: "flexso.be.medialib",
		version: "${version}",
		dependencies: [ // keep in sync with the ui5.yaml and .library files
			"sap.ui.core"
		],
		types: [
			"flexso.be.medialib.ExampleColor"
		],
		interfaces: [],
		controls: [
			"flexso.be.medialib.Example"
		],
		elements: [],
		noLibraryCSS: false // if no CSS is provided, you can disable the library.css load here
	});

	/**
	 * Some description about <code>medialib</code>
	 *
	 * @namespace
	 * @name flexso.be.medialib
	 * @author Denis Galand
	 * @version ${version}
	 * @public
	 */
	var thisLib = flexso.be.medialib;

	/**
	 * Semantic Colors of the <code>flexso.be.medialib.Example</code>.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.ExampleColor = {

		/**
		 * Default color (brand color)
		 * @public
		 */
		Default : "Default",

		/**
		 * Highlight color
		 * @public
		 */
		Highlight : "Highlight"

	};

	return thisLib;

});
