
/**
 * using videoGallery
 */ 
 
function disableScreenLock(b) {
	if (Titanium.Platform.name == 'iPhone OS') {
		// iphone
		Titanium.App.setIdleTimerDisabled(true);
	} else {
		// android
	}
}
/**
 * open video gallery iphone 
 */
function showIphoneGallery() {
	disableScreenLock(true);
	$.uploadProg.setMessage('Upload Progress.');
	$.uploadProg.setValue(0);
	$.labelUpload.setText('No selected vedeo !');
	Ti.Media.openPhotoGallery({
	    allowEditing: true,
	    mediaTypes: [Ti.Media.MEDIA_TYPE_VIDEO],
	    success:function(event) {   
			disableScreenLock(false);
	    	_selectEvent = event;
	    	_video = event.media ; 
	    	alert('You selected a video file.');
			// Titanium.UI.createAlertDialog({
				// title : 'You selected a video file.',
				// message : _video.file.name
			// }).show();
	    	$.labelUpload.setText('Upload selected video !');               
	    	}
		});
}

/**
 * get Blob from URI
 */
function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

/**
 * open gallery android 
 */
function showAndroidGallery() {
	disableScreenLock(true);
	$.uploadProg.setMessage('Upload Progress.');
	$.uploadProg.setValue(0);
	$.labelUpload.setText('No selected vedeo !');
	
	var win = Titanium.UI.createWindow({ 
	    backgroundColor: '#fff', layout: 'vertical'
	});
	var label = Titanium.UI.createLabel({
		top: '45%', height: '10%', left: '10%', width: '80%',
		color: "#576996", text: '', textAlign: 'center'
	});
	win.add(label);
	win.open();
	
	// Holds a reference to the media URI
	var videoURL = null;
	
	win.addEventListener('open', function() {
	    // Start an activity with an intent to capture video
	    // http://developer.android.com/reference/android/provider/MediaStore.html#ACTION_VIDEO_CAPTURE
	    var intent = Titanium.Android.createIntent({
	        action : Ti.Android.ACTION_PICK,
	        type : "video/*"
	    });
	    win.activity.startActivityForResult(intent, function(e) {
	        if (e.resultCode == Ti.Android.RESULT_OK) {
	            if (e.intent.data != null) {
	                // If everything went OK, save a reference to the video URI
	                label.setText('File is loading...');
	                videoURL = e.intent.data;
	                var source = Titanium.Filesystem.getFile(videoURL);
	                var target;
	                if (Titanium.Filesystem.isExternalStoragePresent()) 
	                	target = Titanium.Filesystem.getFile(Titanium.Filesystem.externalStorageDirectory, 'tmp');
	                else
	                	target = Titanium.Filesystem.getFile("file:///storage/sdcard0/com.pandasoft.upload/tmp");
	                var success = false;
	                if (source && target && source.copy(target.nativePath)) {
		                _video = target.read();
	                	success = true;
	                } 
					win.close();
	                if (success)
	                {
		                alert('You selected a video file.');
					   	$.labelUpload.setText('Upload selected video !');               
	                } else {
	                	alert('Could not retreive video!');
	                }
	    	    }
	            else {
					win.close();
                	alert('Could not retreive video!');
	            }
	        }
	        else if (e.resultCode == Ti.Android.RESULT_CANCELED) {
				win.close();
                alert('You canceled selecting video!');
	        }
	        else {
				win.close();
	            alert('Could not retreive video!');
	        }
	    });
	});
}

function showAndroidCamera() {
	disableScreenLock(true);
	$.uploadProg.setMessage('Upload Progress.');
	$.uploadProg.setValue(0);
	$.labelUpload.setText('No selected vedeo !');
	
	var win = Titanium.UI.createWindow({ 
	    backgroundColor: '#fff', layout: 'vertical'
	});
	win.open();
	
	// Holds a reference to the media URI
	var videoURL = null;
	
	win.addEventListener('open', function() {
	    // Start an activity with an intent to capture video
	    // http://developer.android.com/reference/android/provider/MediaStore.html#ACTION_VIDEO_CAPTURE
	    var intent = Titanium.Android.createIntent({ action: 'android.media.action.VIDEO_CAPTURE' });
	    win.activity.startActivityForResult(intent, function(e) {
	        if (e.resultCode == Ti.Android.RESULT_OK) {
	            if (e.intent.data != null) {
	                // If everything went OK, save a reference to the video URI
	                videoURL = e.intent.data;
	                var source = Titanium.Filesystem.getFile(videoURL);
	                _video = source.read();
					Titanium.UI.createAlertDialog({
						title : 'You selected a video file.',
						message : source.name
					}).show();
				   	$.labelUpload.setText('Upload selected video !');               
					win.close();
	    	    }
	            else {
	                Ti.API.error('Could not retrieve media URL!');
	            }
	        }
	        else if (e.resultCode == Ti.Android.RESULT_CANCELED) {
	            Ti.API.trace('User cancelled video capture session.');
	        }
	        else {
	            Ti.API.error('Could not record video!');
	        }
	    });
	});
	
}

function uploadVideoToYoutube() {
	_upload = new YoutubeUpload({
	    authToken : _authToken,
	    contentLength : 0,
	    video : _video,
	    size : _video.length,
	    title : 'My video title',
	    description : 'This is a description of my video' 
	});
	
	_upload.startSession(function() {
		if (_upload.getLocation())	{
			disableScreenLock(true);
			_upload.startUpload(function(){
				
				//initialize progress bar
				$.uploadProg.setMessage('Upload Progress.');
				$.uploadProg.setValue(0);
				
			}, function(){
				
				//set progress
				var prog = _upload.getProgress();
				$.uploadProg.setValue(prog);
				var percent = prog * 100;
				var message = String.format('Uploading video... (%d', percent) + '% of ' + _video.length +' bytes)';
				$.uploadProg.setMessage(message);
				
			}, function(){
				
				//end progress
				$.uploadProg.setMessage('Uploading Completed.');
				disableScreenLock(false);

			}, function(){
				
				//resume upload
				resumeUploadToYoutube();
			});
		}
	});
}

function resumeUploadToYoutube() {
	_upload.checkStatus(function(){
		
		//set left video data
		var blobStream = Ti.Stream.createStream({ source: _video, mode: Ti.Stream.MODE_READ });
		var uploadedBuffer = Ti.createBuffer({ length: _upload.getRange() });
		blobStream.read(uploadedBuffer);
		var leftBuffer = Ti.createBuffer({ length: _video.length - _upload.getRange() });
		blobStream.read(leftBuffer);
		_left = leftBuffer.toBlob();
		
		//resume upload
		_upload.resumeUpload(function(){
				
				//set progress
				var prog = _upload.getProgress();
				prog = prog + (1 - prog) * _upload.getResumeProg();
				$.uploadProg.setValue(prog);
				var percent = prog * 100;
				var message = String.format('Uploading video... (%d', percent) + '%)';
				$.uploadProg.setMessage(message);
				
			}, function(){
				
				//end progress
				$.uploadProg.setMessage('Uploading Completed.');
				disableScreenLock(false);

			}, function(){
				
				//resume upload
				resumeUploadToYoutube();
			},	_left);
	});
}

/**
 * event functions
 */ 

/**
 * selecting video from video gallery
 * @param {Object} e
 */
function doSelectVideo(e) {
	if (Titanium.Platform.name == 'iPhone OS') {
		showIphoneGallery();
	} else {
		showAndroidGallery();
	}
	
}

/**
 * uploading selected video to youtube
 * @param {Object} e
 */
function doUploadVideo(e) {
	
    _oauth.isAuthorized(function() {
        Ti.API.info('Access Token: ' + _oauth.getAccessToken());
        //user is authorized so do something... just dont forget to add accessToken to your requests
 	   _authToken = _oauth.getAccessToken();
    }, function() {
        //authorize first
        _oauth.authorize();
    });

	if (!_authToken)
	{
		alert ('Please get access token.');
		return;
	}
	
	if ($.labelUpload.text == 'No selected vedeo !') {
		alert ('Please select a video file.');
		return;
	}
	
	uploadVideoToYoutube();
}


/**
 * begin point of project
 */
$.index.open();

/**
 * global variables
 */ 
var _selectEvent;
var _video;
var _left;
var _authToken;
var GoogleAuth = require('googleAuth').GoogleAuth;
var _oauth = new GoogleAuth({
    clientId : '662611222165-0pjp0jm38ut36esclus4d52j7pi5fq20.apps.googleusercontent.com',
    clientSecret : 'Ym1_pA81NmiX41ElfrA3t5Yq',
    propertyName : 'googleToken',
    scope : ['https://www.googleapis.com/auth/youtube.upload'],
    loginHint : 'huangdage0922@gmail.com'
});
_oauth.isAuthorized(function() {
    Ti.API.info('Access Token: ' + _oauth.getAccessToken());
    //user is authorized so do something... just dont forget to add accessToken to your requests

}, function() {
    //authorize first
    _oauth.authorize();
});

var YoutubeUpload = require('youtubeUpload').YoutubeUpload;
var _upload;

