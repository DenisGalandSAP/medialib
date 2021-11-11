# UI5 Library `medialib`

This library has been created to facilitate the development of SAPUI5 applications with native media functionalities of the recent browsers.

It contains 3 features for the moment,

[Video Scanner Multi Type ](#Video-Scanner-Multi-Type)

[Voice To Speech](#Voice-To-Speech)

[Capture Image](#Capture-Image)

## Video Scanner Multi Type

The Video Scanner Multi Type can scan multiple types of code, such as Barcode, Data Matrix or QR Code
The instantiated component uses a dialog where a video player is running, and tries to find a scan code in one of the formats as stated as above, to return the associated text.

The component is based on [Andrey Danilin excellent blog post](https://blogs.sap.com/2021/02/01/native-js-zxing-scanner-in-sapui5/), which is based on [ZXing](https://zxing-js.github.io/library/)

## Voice To Speech

The library englobes the [Web Speech API](https://wicg.github.io/speech-api/)
Once the instantiated is triggered, it will return the speech given by the microphone in a text format.
The dictionary to recognize the text is based on the language used by the SAPUI5 application, and the recognition works in offline mode, no need for an internet connection.

## Capture image

The CaptureImage component opens a dialog with a html5 video player, and with a press of the Capture button, returns the image content and some more properties like this:

sExtension: "jpg"
sFileName: "imageMobile_1635510326384.jpg"
sHeight: 480
sUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA
sWidth: 640

## Application test

A library containing the 3 functionalities is available in the Dev environment [here](http://myapps-dev.stib-mivb.be/sap/bc/ui5_ui5/sap/zmedtest/index.html)

## How to use the library

In the controller you desire to use the functionalities

```text
sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'flexso/be/medialib/controls/ExtScanner',
    'flexso/be/medialib/controls/VoiceToSpeech',
    'flexso/be/medialib/controls/CaptureImage'
  ],
  function (Controller, ExtScanner, VoiceToSpeech, CaptureImage) {
    'use strict';
    return Controller.extend('z.controller.TestController', {
      _initializeExtScanner: function () {
        this.oScanner = new ExtScanner({
          valueScanned: this.onScanned.bind(this),
          decoderKey: 'text',
          decoders: this.getDecoders(),
          getCameraAllowed: oCameraAllowed => {
            console.log(oCameraAllowed ? console.log('The camera is allowed') : console.log('The camera is not allowed'));
          }
        });
      },

      getDecoders: function () {
        return [
          {
            key: 'text',
            text: 'TEXT',
            decoder: this.parserText
          }
        ];
      },

      parserText: function (oResult) {
        var sText = '';
        var iLength = oResult.text.length;
        for (var i = 0; i !== iLength; i++) {
          if (oResult.text.charCodeAt(i) < 32) {
            sText += ' ';
          } else {
            sText += oResult.text[i];
          }
        }
        return sText;
      },

      onOpenScanDialog: function (sScanProperty) {
        this.sScanProperty = sScanProperty;
        this.oScanner.open();
      },

      onScanned: function (oEvent) {
        console.log(oEvent.getParameter('value'));
      },

      _initializeVoiceToSpeech: function () {
        this.oRecord = new VoiceToSpeech({
          getVoiceToSpeechText: this._onReceiveText.bind(this),
          getSpeechAllowed: oSpeechAllowed => {
            console.log(oSpeechAllowed ? console.log('The audio recording is allowed') : console.log('The audio recording is not allowed'));
          }
        });
      },

      _onReceiveText: function (oEvent) {
        this.getModel('app').setProperty('/recording', false);
        console.log(oEvent.getParameter('value'));
      },

      /**
       * Initialize the Voice to Speech
       */
      onRecord: function (sRecordProperty) {
        this.sRecordProperty = sRecordProperty;
        this.oRecord.onRecord();
      },

      _initializeCaptureImage: function () {
        this.oCaptureImage = new CaptureImage({
          getImage: this._onRetrieveImage.bind(this),
          getCameraAllowed: oCameraAllowed => {
            console.log(oCameraAllowed ? console.log('The camera is allowed') : console.log('The camera is not allowed'));
          }
        });
      },

      _onRetrieveImage: async function (oEvent) {
        console.log(oEvent.getParameters().value);
      }
    });
  }
);
```

This project has been generated with 💙 and [generator-ui5-library](https://github.com/geert-janklaps/generator-ui5-library).
