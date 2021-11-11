sap.ui.define(["sap/ui/core/Control"], function (Control) {
  "use strict";

  return Control.extend("flexso.be.medialib.controls.VoiceToSpeech", {
    metadata: {
      manifest: "json",
      properties: {},
      events: {
        getVoiceToSpeechText: {
          parameters: {
            value: {
              type: "String",
            },
          },
        },
        getSpeechAllowed: {
          parameters: {
            value: {
              type: "Boolean",
            },
          },
        },
      },
    },

    init: function () {
      //Check if the website has the permission to record audio
      navigator.permissions
        .query({
          name: "microphone",
        })
        .then((oMicroPermissionResult) => {
          //Check if speech recognition is available (Chromium feature)
          if (
            oMicroPermissionResult.state !== "denied" &&
            webkitSpeechRecognition
          ) {
            var grammer = "#JGSF V1.0";
            this.oRecognition = new webkitSpeechRecognition();
            var speechRecognitionGrammerList = new webkitSpeechGrammarList();
            speechRecognitionGrammerList.addFromString(grammer, 1);
            this.oRecognition.grammers = speechRecognitionGrammerList;
            if (sap.ui.getCore().getConfiguration().getLanguage() === "NL") {
              this.oRecognition.lang = "nl-NL";
            } else {
              this.oRecognition.lang = "fr-FR";
            }
            this.oRecognition.interimResults = false;
            this.oRecognition.onresult = (oEvent) => {
              var last = oEvent.results.length - 1;
              var sTranscript = oEvent.results[last][0].transcript;
              if (sTranscript) {
                this.fireGetVoiceToSpeechText({
                  value: sTranscript,
                });
              }
            };

            this.oRecognition.onspeechend = () => {
              clearTimeout(this.oTimer);
              this.oRecognition.stop();
            };

            this.oRecognition.onerror = () => {};
            this.fireGetSpeechAllowed({
              value: true,
            });
          } else {
            this.fireGetSpeechAllowed({
              value: false,
            });
          }
        });
    },

    onRecord: function () {
      this.oRecognition.start();
      this.oTimer = setTimeout(
        function () {
          this.oRecognition.stop();
        }.bind(this),
        8000
      );
    },
  });
});
