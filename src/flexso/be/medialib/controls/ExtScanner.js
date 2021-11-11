/* global ZXing:true */
sap.ui.define(
  [
    "sap/ui/core/Control",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/Device",
    "sap/ui/model/resource/ResourceModel",
    "flexso/be/medialib/libs/ZXing",
  ],
  function (
    Control,
    Fragment,
    JSONModel,
    MessageToast,
    Device,
    ResourceModel,
    ZXingLib
  ) {
    "use strict";

    return Control.extend("flexso.be.medialib.controls.ExtScanner", {
      metadata: {
        manifest: "json",
        properties: {
          // possible 'QR-Code', 'Barcode', 'Multi'
          type: {
            type: "string",
            defaultValue: "Multi",
          },
          settings: {
            type: "boolean",
            defaultValue: false,
          },
          decoderKey: {
            type: "string",
            defaultValue: "text",
          },
          decoders: {
            type: "object",
            defaultValue: null,
          },
          tryHarder: {
            type: "boolean",
            defaultValue: false,
          },
        },
        events: {
          valueScanned: {
            parameters: {
              value: {
                type: "string",
              },
            },
          },
          getCameraAllowed: {
            parameters: {
              value: {
                type: "Boolean",
              },
            },
          },
          cancelled: {},
        },
      },

      init: function () {
        // check if the camera funcitonality is enabled
        if (
          navigator &&
          navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia
        ) {
          navigator.mediaDevices
            .getUserMedia({
              video: true,
            })
            .then(() => {
              // set initial properties
              //this._oToolbar = null;
              this._oScanModel = null;
              this._oTD = null; // scan dialog
              this._oID = null; // input dialog

              // set main model
              this._oScanModel = new JSONModel({
                type: this.getType(),
                value: "",
                videoDeviceId: null,
              });
              var i18nModel = new ResourceModel({
                bundleName: "flexso.be.medialib.i18n.i18n",
              });
              this.setModel(i18nModel, "i18n");

              this.setModel(this._oScanModel, "scanModel");
              this.setModel(new JSONModel(Device), "device");
              // attach
              sap.ui.Device.orientation.attachHandler(
                this.adaptVideoSourceSize.bind(this)
              );
              this.fireGetCameraAllowed({
                value: true,
              });
            })
            .catch(() => {
              this.fireGetCameraAllowed({
                value: false,
              });
            });
        } else {
          this.fireGetCameraAllowed({
            value: false,
          });
        }
      },

      adaptByOrientationChange: function () {
        this.adaptVideoSourceSize();
        this._resetScan();
      },

      exit: function () {
        sap.ui.Device.orientation.detachHandler(this.adaptVideoSourceSize);
      },

      /**
       * Opens the dialog for selecting a customer.
       * @public
       */
      open: function () {
        this.onShowDialog();
      },

      onChangeDevice: function (oEvent) {
        var oItem = oEvent.getProperty("listItem");
        var sId = oItem.getValue();
        this.getChangePopover().close();
        this.changeDevice(sId);
      },

      changeDevice: function (sId) {
        this._oScanModel.setProperty("/videoDeviceId", sId);
        this._stopScan();
        this._startScan();
      },

      initDecoder: function () {
        this._oDecoder = this._getMultiCodeDecoder();
        return this._oDecoder;
      },

      onShowDialog: function () {
        this._oDecoder = this._getMultiCodeDecoder();
        if (this._oDecoder) {
          this._oDecoder
            .listVideoInputDevices()
            .then((aDevices) => {
              this._oScanModel.setProperty("/videoDevices", aDevices);
              if (aDevices && aDevices.length) {
              } else {
                throw new Error("No video devices");
              }
              return true;
            })
            .then(() => {
              this._openScanDialog();
            });
        }
      },

      onCancelPress: function (oEvent) {
        this._oTD.close();
        this.fireCancelled({});
        this._oScanModel.setProperty("/value", "");
      },

      _getMultiCodeDecoder: function () {
        if (!this._oMultiCodeDecoder) {
          //debugger;
          this._oMultiCodeDecoder = new ZXing.BrowserMultiFormatReader(
            new Map([["TRY_HARDER", this.getTryHarder()]])
          );
        }
        return this._oMultiCodeDecoder;
      },

      adaptVideoSourceSize: function () {
        var oDevice = this.getModel("device");
        var bPhone = oDevice.getProperty("/system/phone");
        var bPortain = oDevice.getProperty("/orientation/portrait");
        var iWidth = oDevice.getProperty("/resize/width");
        var iHeight = oDevice.getProperty("/resize/height");
        var tmp;
        if (bPhone) {
          if (bPortain) {
            iHeight -= 96;
          } else {
            tmp = iHeight;
            iHeight = iWidth - 96;
            iWidth = tmp;
          }
        }
        if (bPhone) {
          $('div[id$="videoContainer"]').width(iWidth);
          $('div[id$="videoContainer"]').height(iHeight);
        } else {
          $('div[id$="videoContainer"]').width("100%");
          $('div[id$="videoContainer"]').height("100%");
        }
      },

      _openScanDialog: async function () {
        if (!this._oTD) {
          this._oTD = await Fragment.load({
            id: this.getId(),
            name: "flexso.be.medialib.fragments.scanDialog",
            controller: this,
          });
          this._oTD.attachAfterOpen(this._onAfterOpen.bind(this));
          this._oTD.attachAfterClose(this._onAfterClose.bind(this));
          this.addDependent(this._oTD);
        }
        if (this.getModel("device").getProperty("/system/phone") === true) {
          this._oTD.setStretch(true);
        } else {
          this._oTD.setStretch(false);
        }
        this.adaptVideoSourceSize();
        this._oTD.open();
      },

      _startScan: function () {
        this._oDecoder
          .decodeFromVideoDevice(
            this._oScanModel.getProperty("/videoDeviceId"),
            this.getId() + "--scanVideo",
            this._saveScannedValue.bind(this)
          )
          .catch((err) => {
            if (err && err.name && err.name === "NotAllowedError") {
              MessageToast.show("Video device is blocked");
            } else {
              MessageToast.show(
                err.message ||
                  "Unexpected error in decoder, switch to input mode"
              );
            }
            this._oTD.close();
          });
      },

      _stopScan: function () {
        this._oDecoder.stopContinuousDecode();
        this._oDecoder.stopAsyncDecode();
        this._oDecoder.reset();
      },

      _onAfterOpen: function () {
        this._startScan();
      },

      _onAfterClose: function () {
        this._stopScan();
      },

      _resetScan: function () {
        this._stopScan();
        this._startScan();
      },

      onResetScan: function () {
        this._oScanModel.setProperty("/value", "");
        this._resetScan();
      },

      _saveScannedValue: function (result, error) {
        if (result) {
          var oDecoder = this.getDecoders().find(
            (oDecoder) => oDecoder.key === this.getDecoderKey()
          );
          var sResultText = oDecoder.decoder(result) || result.text;
          this.fireValueScanned({
            value: sResultText,
          });
          this._oTD.close();
        }
      },
    });
  }
);
