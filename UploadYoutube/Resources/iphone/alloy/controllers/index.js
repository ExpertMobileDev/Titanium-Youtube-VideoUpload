function Controller() {
    function showVideoGallery() {
        Titanium.App.setIdleTimerDisabled(true);
        $.uploadProg.setMessage("Upload Progress.");
        $.uploadProg.setValue(0);
        $.labelUpload.setText("No selected vedeo !");
        Ti.Media.openPhotoGallery({
            allowEditing: true,
            mediaTypes: [ Ti.Media.MEDIA_TYPE_VIDEO ],
            success: function(event) {
                Titanium.App.setIdleTimerDisabled(false);
                _selectEvent = event;
                _video = event.media;
                Titanium.UI.createAlertDialog({
                    title: "You selected a video file.",
                    message: _video.file.name
                }).show();
                $.labelUpload.setText("Upload selected video !");
            }
        });
    }
    function uploadVideoToYoutube() {
        _upload = new YoutubeUpload({
            authToken: _authToken,
            contentLength: 0,
            video: _video,
            size: _video.length,
            title: "My video title",
            description: "This is a description of my video"
        });
        _upload.startSession(function() {
            if (_upload.getLocation()) {
                Titanium.App.setIdleTimerDisabled(true);
                _upload.startUpload(function() {
                    $.uploadProg.setMessage("Upload Progress.");
                    $.uploadProg.setValue(0);
                }, function() {
                    var prog = _upload.getProgress();
                    $.uploadProg.setValue(prog);
                    var percent = 100 * prog;
                    var message = String.format("Uploading video... (%d", percent) + "% of " + _video.length + " bytes)";
                    $.uploadProg.setMessage(message);
                }, function() {
                    $.uploadProg.setMessage("Uploading Completed.");
                    Titanium.App.setIdleTimerDisabled(false);
                }, function() {
                    resumeUploadToYoutube();
                });
            }
        }, function() {
            _oauth.authorize();
        });
    }
    function resumeUploadToYoutube() {
        _upload.checkStatus(function() {
            var blobStream = Ti.Stream.createStream({
                source: _video,
                mode: Ti.Stream.MODE_READ
            });
            var uploadedBuffer = Ti.createBuffer({
                length: _upload.getRange()
            });
            blobStream.read(uploadedBuffer);
            var leftBuffer = Ti.createBuffer({
                length: _video.length - _upload.getRange()
            });
            blobStream.read(leftBuffer);
            _left = leftBuffer.toBlob();
            _upload.resumeUpload(function() {
                var prog = _upload.getProgress();
                prog += (1 - prog) * _upload.getResumeProg();
                $.uploadProg.setValue(prog);
                var percent = 100 * prog;
                var message = String.format("Uploading video... (%d", percent) + "%)";
                $.uploadProg.setMessage(message);
            }, function() {
                $.uploadProg.setMessage("Uploading Completed.");
                Titanium.App.setIdleTimerDisabled(false);
            }, function() {
                resumeUploadToYoutube();
            }, _left);
        });
    }
    function doSelectVideo() {
        showVideoGallery();
    }
    function doUploadVideo() {
        _oauth.isAuthorized(function() {
            Ti.API.info("Access Token: " + _oauth.getAccessToken());
            _authToken = _oauth.getAccessToken();
        }, function() {
            _oauth.authorize();
        });
        if (!_authToken) {
            alert("Please get access token.");
            return;
        }
        if ("No selected vedeo !" == $.labelUpload.text) {
            alert("Please select a video file.");
            return;
        }
        uploadVideoToYoutube();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.index = Ti.UI.createWindow({
        backgroundColor: "white",
        id: "index"
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    $.__views.titleView = Ti.UI.createView({
        id: "titleView",
        backgroundColor: "#576996",
        top: "0%",
        width: "100%",
        height: "10%"
    });
    $.__views.index.add($.__views.titleView);
    $.__views.labelTitle = Ti.UI.createLabel({
        width: "100%",
        height: "40%",
        color: "#000",
        text: "Upload video to Youtube",
        id: "labelTitle",
        Color: "white",
        top: "30%",
        textAlign: "center"
    });
    $.__views.titleView.add($.__views.labelTitle);
    $.__views.mainView = Ti.UI.createView({
        id: "mainView",
        visible: "true",
        backgroundColor: "white",
        top: "10%",
        width: "100%",
        height: "90%"
    });
    $.__views.index.add($.__views.mainView);
    $.__views.selectView = Ti.UI.createView({
        id: "selectView",
        visible: "true",
        backgroundColor: "white",
        top: "0%",
        width: "100%",
        height: "30%"
    });
    $.__views.mainView.add($.__views.selectView);
    $.__views.labelSelect = Ti.UI.createLabel({
        width: "100%",
        height: "30%",
        color: "#000",
        text: "Select video to Upload !",
        id: "labelSelect",
        Color: "#576996",
        top: "20%",
        textAlign: "center"
    });
    $.__views.selectView.add($.__views.labelSelect);
    $.__views.buttonSelect = Ti.UI.createButton({
        id: "buttonSelect",
        backgroundColor: "#576996",
        top: "60%",
        height: "30%",
        left: "20%",
        width: "60%",
        borderRadius: "10",
        title: "Select Video",
        textAlign: "center",
        tintColor: "white"
    });
    $.__views.selectView.add($.__views.buttonSelect);
    doSelectVideo ? $.__views.buttonSelect.addEventListener("click", doSelectVideo) : __defers["$.__views.buttonSelect!click!doSelectVideo"] = true;
    $.__views.progView = Ti.UI.createView({
        id: "progView",
        visible: "true",
        backgroundColor: "white",
        top: "30%",
        width: "100%",
        height: "30%"
    });
    $.__views.mainView.add($.__views.progView);
    $.__views.uploadProg = Ti.UI.createProgressBar({
        id: "uploadProg",
        visible: "true",
        message: "Upload Progress",
        min: "0",
        max: "1",
        value: "0",
        Color: "#576996",
        top: "10%",
        height: "80%",
        left: "10%",
        width: "80%"
    });
    $.__views.progView.add($.__views.uploadProg);
    $.__views.uploadView = Ti.UI.createView({
        id: "uploadView",
        visible: "true",
        backgroundColor: "white",
        top: "60%",
        width: "100%",
        height: "30%"
    });
    $.__views.mainView.add($.__views.uploadView);
    $.__views.labelUpload = Ti.UI.createLabel({
        width: "100%",
        height: "30%",
        color: "#000",
        text: "No selected vedeo !",
        id: "labelUpload",
        Color: "#576996",
        top: "20%",
        textAlign: "center"
    });
    $.__views.uploadView.add($.__views.labelUpload);
    $.__views.buttonUpload = Ti.UI.createButton({
        id: "buttonUpload",
        backgroundColor: "#576996",
        top: "60%",
        height: "30%",
        left: "20%",
        width: "60%",
        borderRadius: "10",
        title: "Upload Video",
        textAlign: "center",
        tintColor: "white"
    });
    $.__views.uploadView.add($.__views.buttonUpload);
    doUploadVideo ? $.__views.buttonUpload.addEventListener("click", doUploadVideo) : __defers["$.__views.buttonUpload!click!doUploadVideo"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.index.open();
    var _selectEvent;
    var _video;
    var _left;
    var _authToken;
    var GoogleAuth = require("googleAuth").GoogleAuth;
    var _oauth = new GoogleAuth({
        clientId: "662611222165-0pjp0jm38ut36esclus4d52j7pi5fq20.apps.googleusercontent.com",
        clientSecret: "Ym1_pA81NmiX41ElfrA3t5Yq",
        propertyName: "googleToken",
        scope: [ "https://www.googleapis.com/auth/youtube.upload" ],
        loginHint: "huangdage0922@gmail.com"
    });
    _oauth.isAuthorized(function() {
        Ti.API.info("Access Token: " + _oauth.getAccessToken());
    }, function() {
        _oauth.authorize();
    });
    var YoutubeUpload = require("youtubeUpload").YoutubeUpload;
    var _upload;
    __defers["$.__views.buttonSelect!click!doSelectVideo"] && $.__views.buttonSelect.addEventListener("click", doSelectVideo);
    __defers["$.__views.buttonUpload!click!doUploadVideo"] && $.__views.buttonUpload.addEventListener("click", doUploadVideo);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;