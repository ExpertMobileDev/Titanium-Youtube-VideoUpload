exports.YoutubeUpload = function(o) {
	o = (o) ? o : {};
	var _opt = {
		authToken : (o.authToken) ? o.authToken : null,
		contentLength : (o.contentLength) ? o.contentLength : null,
		video : (o.video) ? o.video : null,
		size : (o.size) ? o.size : 3000000,
		title : (o.title) ? o.title : 'My video title',
		description : (o.description) ? o.description : 'This is a description of my video',
		url : 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails',
	};

	var _prop = {};
	_prop.location = null;
	_prop.progress = 0;
	_prop.resumeProg = 0;
	_prop.range = 0;
	_prop.left = null;

	function getLocation() {
		return _prop.location;
	};
	function getProgress() {
		return _prop.progress;
	};
	function getResumeProg() {
		return _prop.resumeProg;
	};
	function getRange() {
		return _prop.range;
	};
	
	var xhr;
	function startSession(f) {
		f = (f) ? f : function() {
		};
		_prop.location = null;
		xhr = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload : function(e) {
				//log.info("Received text: " + this.responseText);
				Titanium.UI.createAlertDialog({
					title : 'Session success.',
					message : 'Upload URL = \n' + xhr.getResponseHeader('Location')
				}).show();
				_prop.location = xhr.getResponseHeader('Location');
				f();
				
			},
			// function called when an error occurs, including a timeout
			onerror : function(e) {
				//log.info(e.error);
				//log.info(e.responseText);
				//TODO: show some error message
				Titanium.UI.createAlertDialog({
					title : 'Session failed.',
					message : (this.responseText)?this.responseText:e
				}).show();
			}
		});
		// Prepare the connection.
		xhr.open('POST', _opt.url);
		xhr.setRequestHeader('Authorization', 'Bearer ' + _opt.authToken);
		xhr.setRequestHeader('Content-Length', _opt.contentLength);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.setRequestHeader('X-Upload-Content-Length', _opt.size);
		xhr.setRequestHeader('X-Upload-Content-Type', 'video/*');
		var d = {
			'kind' : 'youtube#video',
			'snippet' : {
			    'title': _opt.title,
			    'description': _opt.description,
			    'tags': ['cool', 'video', 'more keywords'],
			    'categoryId': '22'
			},
			'status' : {
			    'privacyStatus': 'public',
			    'embeddable': true,
			    'license': 'youtube'
			}			
		};
		d = JSON.stringify(d);
		// Send the request.
		xhr.send(d);
	};

	function startUpload(f1, f2, f3, f4) {
		initProg = (f1) ? f1 : function() {
		};
		setProg = (f2) ? f2 : function() {
		};
		endProg = (f3) ? f3 : function() {
		};
		handleErr = (f4) ? f4 : function() {
		};
		_prop.progress = 0;
		_prop.resumeProg = 0;
		xhr = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload : function(e) {
				//log.info("Received text: " + this.responseText);
				Titanium.UI.createAlertDialog({
					title : 'Uploading Completed.',
					message : ''
				}).show();
				endProg();
			},
			// function called when an error occurs, including a timeout
			onerror : function(e) {
				//log.info(e.error);
				//log.info(e.responseText);
				if (_prop.progress == 0)
				{
					Titanium.UI.createAlertDialog({
						title : 'Uploading can not start.',
						message : (this.responseText)?this.responseText:e.error
					}).show();
				}
				else
				{
					
					Titanium.UI.createAlertDialog({
						title : 'Uploading is paused.',
						message : (this.responseText)?this.responseText:e
					}).show();
					handleErr();
				}
			},
		    onsendstream: function(e) {
		        // function called as data is uploaded
		        Ti.API.info('onsendstream called, readyState = '+this.readyState);
		        _prop.progress = e.progress ;
		        setProg();
		    }
		});
		
		// Prepare the connection.
		xhr.open('PUT', _prop.location);
		xhr.setRequestHeader('Authorization', 'Bearer ' + _opt.authToken);
		xhr.setRequestHeader('Content-Length', _opt.size);
		xhr.setRequestHeader('Content-Type', 'video/*');
		
		// Send the request.
		xhr.send(_opt.video);
		
		// show progressbar
		initProg();
	};
		
	function checkStatus(f1) {
		resume = (f1) ? f1 : function() {
		};
		_prop.range = 0;
		xhr = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload : function(e) {
				//log.info("Received text: " + this.responseText);
				Titanium.UI.createAlertDialog({
					title : 'Press OK to resume.',
					message : 'Uploaded ' + xhr.getResponseHeader('Range')
				}).show();
				var values = (xhr.getResponseHeader('Range')).split('-');
				_prop.range = values[1];
				_prop.range++;
				resume();
			},
			// function called when an error occurs, including a timeout
			onerror : function(e) {
				//log.info(e.error);
				//log.info(e.responseText);
				Titanium.UI.createAlertDialog({
					title : 'Check upload status failed.',
					message : (this.responseText)?this.responseText:e
				}).show();
			}
		});
		
		// Prepare the connection.
		xhr.open('PUT', _prop.location);
		xhr.setRequestHeader('Authorization', 'Bearer ' + _opt.authToken);
		xhr.setRequestHeader('Content-Length', 0);
		xhr.setRequestHeader('Content-Range', 'bytes */' + _opt.size);
		
		// Send the request.
		xhr.send();
	};
	
	function resumeUpload(f1, f2, f3, b) {
		setProg = (f1) ? f1 : function() {
		};
		endProg = (f2) ? f2 : function() {
		};
		handleErr = (f3) ? f3 : function() {
		};
		_prop.left = (b)? b: null;
		_prop.resumeProg = 0;
		xhr = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload : function(e) {
				//log.info("Received text: " + this.responseText);
				Titanium.UI.createAlertDialog({
					title : 'Upload Completed.',
					message : ''
				}).show();
				endProg();
			},
			// function called when an error occurs, including a timeout
			onerror : function(e) {
				//log.info(e.error);
				//log.info(e.responseText);
				if (_prop.resumeProg == 0)
				{
					Titanium.UI.createAlertDialog({
						title : 'Upload can not resume.',
						message : (this.responseText)?this.responseText:e
					}).show();
				}
				else
				{
					Titanium.UI.createAlertDialog({
						title : 'Upload did not succeed.',
						message : (this.responseText)?this.responseText:e
					}).show();
					if(this.status)
						alert(this.status);
					_prop.progress = _prop.progress + (1 - _prop.progress) * _prop.resumeProg;
					handleErr();
				}
			},
		    onsendstream: function(e) {
		        // function called as data is uploaded
		        Ti.API.info('onsendstream called, readyState = '+this.readyState);
		        _prop.resumeProg = e.progress ;
		        setProg();
		    }
		});
		
		// Prepare the connection.
		xhr.open('PUT', _prop.location);
		xhr.setRequestHeader('Authorization', 'Bearer ' + _opt.authToken);
		xhr.setRequestHeader('Content-Length', _opt.size - _prop.range);
		var bytes = String.format('bytes %d-%d/%d', _prop.range, _opt.size-1, _opt.size);
		xhr.setRequestHeader('Content-Range', bytes);
		
		// Send the request.
		xhr.send(_prop.left);		
	};
	
	return {
		startSession : startSession,
		getLocation : getLocation,
		startUpload : startUpload,
		getProgress : getProgress,
		checkStatus :checkStatus,
		getRange: getRange,
		resumeUpload : resumeUpload,
		getResumeProg : getResumeProg
	};
	
};