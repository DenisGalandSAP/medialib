sap.ui.define(
  [
    "sap/ui/core/Control",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/ui/core/HTML",
    "sap/m/FlexJustifyContent",
    "sap/ui/model/resource/ResourceModel",
  ],
  function (
    Control,
    Dialog,
    Button,
    HBox,
    VBox,
    HTML,
    FlexJustifyContent,
    ResourceModel
  ) {
    "use strict";

    return Control.extend("flexso.be.medialib.controls.CaptureImage", {
      metadata: {
        manifest: "json",
        properties: {},
        events: {
          getImage: {
            parameters: {
              value: {
                type: "Object",
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
        },
      },

      init: function () {
        var i18nModel = new ResourceModel({
          bundleName: "flexso.be.medialib.i18n.i18n",
        });
        this.setModel(i18nModel, "i18n");

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

      onAttachmentPress: function (oEvent) {
        var sWidth = "";
        var sHeight = "";
        sWidth = sap.ui.Device.resize.width - 100;
        sHeight = sap.ui.Device.resize.height - 100;
        var sWidths = sap.ui.Device.resize.width - 100;
        var sHeights = sap.ui.Device.resize.height - 100;
        this.photoDialog = new Dialog({
          horizontalScrolling: false,
          verticalScrolling: false,
          contentWidth: sWidth + "px",
          contentHeight: sHeight + "px",
          showHeader: false,
          content: [
            new HBox({
              justifyContent: FlexJustifyContent.Center,
              items: new VBox({
                items: new HTML({
                  content:
                    "<video id='player' width='" +
                    sWidths +
                    "' height='" +
                    sHeights +
                    "' autoplay></video>",
                }),
              }),
            }),
          ],
          beginButton: new Button({
            text: this.getModel("i18n").getProperty("textCapture"),
            press: function () {
              /*eslint-disable sap-no-dom-access*/
              var objPlayer = document.getElementById("player");
              this.imageVal = objPlayer;
              this.setImage();
            }.bind(this),
          }),
          endButton: new sap.m.Button({
            text: this.getModel("i18n").getProperty("textCancelButton"),
            press: function () {
              this.photoDialog.destroy();
            }.bind(this),
          }),
        });
        this.photoDialog.open();
        var handleSuccess = function (stream) {
          /*eslint-disable no-undef*/
          player.srcObject = stream;
        };
        /*eslint-disable sap-no-navigator*/
        navigator.mediaDevices
          .getUserMedia({
            video: true,
          })
          .then(handleSuccess);
      },

      setImage: function () {
        /*eslint-disable*/
        var canvas = document.createElement("canvas");
        var sImageQuality = 1.0;
        canvas.width = this.imageVal.videoWidth || this.imageVal.width;
        canvas.height = this.imageVal.videoHeight || this.imageVal.height;
        if (
          canvas.width > 1280 ||
          canvas.height > 720 ||
          canvas.width > 720 ||
          canvas.height > 1280
        ) {
          sImageQuality = 0.4;
        }
        canvas
          .getContext("2d")
          .drawImage(this.imageVal, 0, 0, canvas.width, canvas.height);
        var sFileName =
          "imageMobile_" + new Date().getTime().toString() + ".jpg";
        this.fireGetImage({
          value: {
            sUrl: canvas.toDataURL("image/jpeg", sImageQuality),
            sFileName: sFileName,
            sExtension: "jpg",
            sWidth: canvas.width,
            sHeight: canvas.height,
          },
        });
        if (this.imageVal.srcObject !== undefined) {
          this.imageVal.srcObject.removeTrack(
            this.imageVal.srcObject.getTracks()[0]
          );
          this.photoDialog.destroy();
        }
      },
    });
  }
);
