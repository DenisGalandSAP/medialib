/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library flexso.be.medialib.
 */
sap.ui.define(["sap/ui/core/library"], function () {
  "use strict";

  // delegate further initialization of this library to the Core
  // Hint: sap.ui.getCore() must still be used to support preload with sync bootstrap!
  sap.ui.getCore().initLibrary({
    name: "flexso.be.medialib",
    version: "${version}",
    dependencies: [
      // keep in sync with the ui5.yaml and .library files
      "sap.ui.core",
    ],
    types: [],
    interfaces: [],
    controls: [
      "flexso.be.medialib.controls.ExtScanner",
      "flexso.be.controls.CaptureImage",
      "flexso.be.controls.VoiceToSpeech",
    ],
    elements: [],
    noLibraryCSS: false, // if no CSS is provided, you can disable the library.css load here
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

  return flexso.be.medialib;
});
