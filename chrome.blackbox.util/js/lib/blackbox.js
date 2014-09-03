
var bb = (function(){

	return {

		wait : function(seconds, fn){
			setTimeout(fn, seconds*1000);
		},

		ready : function(f) {
			/in/.test(document.readyState)?setTimeout('bb.ready('+f+')',9):f();
		},

		match : {
			url : function(pat) {
				if (pat.test(location.href)) return true;
				return false;
			},

			uri : function(instr) {
				var pat = /^(http|https):\/\/([a-z0-9-]+\.[a-z]{2,6}(\.[a-z]{2})?(\:[0-9]{2,6})?)((\/[^?#<>\/\\*":]*)+(\?[^#]*)?(#.*)?)?$/ig;
				if (pat.test(bb.filter.trim(instr))) return true;
				return false;
			},

			ip : function(instr) {
				var pat = /^((1?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(1?\d{1,2}|2[0-4]\d|25[0-5])$/ig;
				if (pat.test(instr)) return true;
				return false;
			}

		},

		filter : {

			number : function(instr) {
				return instr.replace(/[^\d\.]+/ig, "");
			},

			range : function(instr) {
				return instr.replace(/[^\d\.\-]+/ig, "");
			},

			trim : function(instr) {
				return instr.replace(/(^[\s]+|[\s]+$)/ig,"");
			}

		},

		random : function(length){
			length = length || 16;
			var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
			var str = "";
			for (var i=0; i<length; i++) {
				str += chars.charAt(Math.floor(Math.random()*chars.length));
				// str += chars.charAt(Math.ceil(Math.random()*100000000)%chars.length);
			}
			return str;
		},

		random_item : function(items){
			if (items.length>0)
				return items[Math.floor(Math.random()*items.length)];
		},

		connect : function(url, callback) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", url, true);
			xhr.onreadystatechange = function() {
			  	if (xhr.readyState == 4 && xhr.status==200) {
					callback(xhr.responseText);
				}
			};
			xhr.send();
		},

		copyText : function(txt) {
			document.oncopy = function(event) {
			    event.clipboardData.setData("Text", txt);
			    event.preventDefault();
			};
			document.execCommand("Copy", false, null);
		},

		HTMLSelection : function(){
			var range;
      		if (document.selection && document.selection.createRange) {
	        	range = document.selection.createRange();
	        	return range.htmlText;
      		}
      		else if (window.getSelection) {
        		var selection = window.getSelection();
        		if (selection.rangeCount > 0) {
          			range = selection.getRangeAt(0);
          			var clonedSelection = range.cloneContents();
          			var div = document.createElement('div');
          			div.appendChild(clonedSelection);
          			return div.innerHTML;
        		}
        		else {
          			return '';
        		}
      		}
      		else {
        		return '';
      		}
		},

		join : function(obj){

			if (obj.constructor == Array && obj.length>0) {
				return obj.join("&");
			}

			if (typeof obj == 'object') {
				var s = [];
				for(var key in obj) {
				   if (obj.hasOwnProperty(key)) {
				       var val = obj[key];
				       s.push(key+"="+val);
				   }
				}
				return s.join("&");
			}

			return "";
		}

	};

})();

bb.chrome = (function(){

	var _act_pool = {};
	var _notice_handler = {};

	if (chrome.notifications) {
		chrome.notifications.onClicked.addListener(function(notid) {
			if (_notice_handler[notid].clicklink) {
				bb.chrome.open_tab(_notice_handler[notid].clicklink);
			}
			clear_notification(notid);
		});

		chrome.notifications.onClosed.addListener(function(notid, byUser) {
			if (byUser) {
				clear_notification(notid);
			}
		});

		var show_notification =  function(notificationOptions, customOptions, fn){

			var not_id = customOptions.notificationId || ("notid_"+Date.now());
			if (_notice_handler[not_id]) {
				clear_notification(not_id);
			}

			chrome.notifications.create(not_id, notificationOptions, function(notid){
				_notice_handler[notid] = {};
				if (typeof fn == 'function') fn(notid);
			});

		};

		var clear_notification = function(not_id) {
			chrome.notifications.clear(not_id, function(){});
			_notice_handler[not_id] = null;
		};

	};

	if (chrome.storage) {

		chrome.storage.onChanged.addListener(function(obj, area){
	    	console.warn(area,'chrome.storage','changed:', obj);
	    });

	}

	return {

		open_tab : function(url) {
			chrome.tabs.create({ url:url });
		},

		open_popup : function(url, width, height, fn) {
			var posiLeft = Math.round((screen.width - width)/2);
			var posiTop = Math.round((screen.height - height)/2);
			fn = fn || function(win){};
			chrome.windows.create({'url': url, 'type': 'popup', 'width':width, 'height':height, 'top':posiTop, 'left':posiLeft}, fn);
		},

		close_tab : function(tab, fn) {
			chrome.tabs.remove(tab.id, fn);
		},

		insertcss : function(tab, css, fn){
			chrome.tabs.insertCSS(tab, {file: css}, fn);
		},

		loadjs : function(jsfile, fn) {
			jsfile = jsfile || "";
			chrome.tabs.executeScript(null, {file:jsfile}, fn);
		},

		sendmsg : function(target, message, callback) {
			message = message || {};
			callback = callback || function(){};
			if (chrome.runtime.sendMessage) { // send msg to background from content script.
				message.action = target; // target is custom string
				chrome.runtime.sendMessage(message, callback);
			}
			else if (chrome.tabs.sendMessage) {	// send msg to content script from background.
				// target is tab.
				chrome.tabs.sendMessage(target, message, callback);
			}
		},

		listen : function(handler) {
			chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
				var action = message.action || message.sign;
			    if (action!=="" && action!==null && _act_pool[action]!==null) {
			    	var act_count = _act_pool[action].length;
		    		for (var i = 0; i < act_count; i++) {
		    			_act_pool[action][i](message, sender, sendResponse);
		    		};
		    		console.log('trigger: ',action,' (',act_count,')');
		    		console.dir(message);
			    }
			    return true;
			});
		},

		onmsg : function(action, fn) {
			if (_act_pool[action]==null) _act_pool[action] = [];
			if (typeof fn == 'function') _act_pool[action].push(fn);
			console.log('listen: ',action);
		},

		basic_notice : function(title, message, opt){ // background available
			opt = opt || {};
			var opts = {
				"type" : "basic",
				"title" : title,
				"message" : message || "",
				"iconUrl" : opt.icon
			};
			show_notification(opts, opt, function(notid){
				_notice_handler[notid].clicklink = opt.link;
			});
		},

		image_notice : function(title, message, imageurl, opt) { // background available
			opt = opt || {};
			var opts = {
				'type' : 'image',
				'title' : title,
				'message' : message || "",
				'iconUrl' : opt.icon,
				'imageUrl' : imageurl
			};
			show_notification(opts, opt, function(notid){
				_notice_handler[notid].clicklink = opt.link||imageurl;
			});
		},

		clear_notice : function(notid){
			clear_notification(notid);
		}

	};

})();


bb.websql = (function(){

	var _db_size = 10*1024*1024; // db size 10MB
	var _db;

	return {

		"open" : function(db_name, db_size) {
			_db_size = db_size || _db_size;
			_db = window.openDatabase(db_name, "1.0", "", _db_size);
		},

		"query" : function(sql, param, fn) {
			_db.transaction(function(tx){
				tx.executeSql(sql, param||[],
				function(tx, rs){	// on success
					if (typeof fn == 'function') fn(rs);
				},
				function(tx, e) { // on error
					console.log('executeSql error');
					console.log(e);
				});
			});
		}
	};

})();

bb.storage = {};

bb.map = (function(){

	var PI = 3.14159265358979324;
	var x_pi = PI * 3000.0 / 180.0;

    var outofchina = function(lat, lng) {
    	if (lng < 72.004 || lng > 137.8347)
            return true;
        if (lat < 0.8293 || lat > 55.8271)
            return true;
        return false;
    }

    var transformLat =  function(x, y){
    	var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
        return ret;
    };

    var transformLng = function(x, y){
    	var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
        return ret;
    };

    var baidu_map_ak = "D0e65cb1fd94fa56c6951a4aadc0888b";
    var google_map_key = "AIzaSyDXIOpFEBKjWWCjWF3djJXirIR7KcjFLr8";

    var last_gps_point, last_gps_time, last_geocode, gps_cache_time;
    if (chrome.storage) {
	    chrome.storage.local.get(["last_gps_point", "last_gps_time", "last_geocode"], function(res){
	    	last_gps_point = res.last_gps_point;
	    	last_gps_time = res.last_gps_time;
	    	last_geocode = res.last_geocode;
	    	console.log(res);
	    });
    }
    else {
    	last_gps_point = null;
    	last_gps_time = 0;
    	last_geocode = null;
    }

    gps_cache_time = 5*60*1000;

   //  var geo_watcher = navigator.geolocation.watchPosition(function(posi){
   //  	if (posi.coords) {
   //  		last_gps_point = posi.coords;
   //  		last_gps_time = Date.now();
   //  		// WGS-84 ==> GCJ-02
			// var latlng = bb.map.wgs2gcj(posi.coords.latitude, posi.coords.longitude);
			// posi.coords.mlat = latlng.lat;
			// posi.coords.mlng = latlng.lng;
			// // Google Geocoding
			// bb.map.google_geocode(latlng.lat, latlng.lng, function(result){
			// 	last_geocode = result;	// cache geo
			// });
   //  	}
   //  }, function(err){
   //  	console.warn(err);
   //  }, {
   //  	enableHighAccuracy: false,
  	// 	timeout: 30000,
  	// 	maximumAge: 0
   //  });

	return {

		// WGS-84 ==> GCJ-02
		wgs2gcj : function(wlat, wlng){

			if (outofchina(wlat, wlng)) {
				return { "lat":wlat, "lng":wlng };
			}

			// Krasovsky 1940
		    //
		    // a = 6378245.0, 1/f = 298.3
		    // b = a * (1 - f)
		    // ee = (a^2 - b^2) / a^2;
		    var a = 6378245.0;
		    var ee = 0.00669342162296594323;

			var dlat = transformLat(wlng - 105.0, wlat - 35.0);
			var dlng = transformLng(wlng - 105.0, wlat - 35.0);
			var radlat = wlat / 180.0 * PI;
			var magic = Math.sin(radlat);
			magic = 1 - ee * magic * magic;
			var sqrtmagic = Math.sqrt(magic);

			dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
			dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);

			var mlat = wlat + dlat;
            var mlng = wlng + dlng;

            return { "lat":mlat, "lng":mlng };
		},

		// GCJ-02 ==> WGS-84
		gcj2wgs : function(mlat, mlng) {

			var mlatlng = this.wgs2gcj(mlat, mlng);

			var dlat = mlatlng.lat - mlat;
			var dlng = mlatlng.lng - mlng;

			var wlat = mlat - dlat;
			var wlng = mlng - dlng;

			return { "lat":wlat, "lng":wlng };
		},

		// GCJ-02 ==> BD-09
		gcj2bd : function(mlat, mlng) {
			var x = mlng, y = mlat;
		    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
		    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
		    var bdlng = z * Math.cos(theta) + 0.0065;
		    var bdlat = z * Math.sin(theta) + 0.006;
		    return { "lat":bdlat, "lng":bdlng };
		},

		// BD-09 ==> GCJ-02
		bd2gcj : function(bdlat, bdlng) {
			var x = bdlng - 0.0065, y = bdlat - 0.006;
		    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
		    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
		    var mlng = z * Math.cos(theta);
		    var mlat = z * Math.sin(theta);
		    return { "lat":mlat, "lng":mlng };
		},

		geolocate : function(success, failed, opt) {
			opt = opt || {};

			// if gps cache expires
			var now = Date.now();
			var expires = opt.cache_expires || gps_cache_time;
			if ( now - last_gps_time < expires && last_gps_point && last_geocode ) {
				if (success) success(last_geocode, last_gps_point);
				return;
			}

			// gps positioning
			navigator.geolocation.getCurrentPosition(function(posi){
				if (posi.coords) {
					// cache position
					last_gps_point = posi.coords;
					last_gps_time = posi.timestamp;
					chrome.storage.local.set({ last_gps_point:posi.coords, last_gps_time:posi.timestamp });
					// WGS-84 ==> GCJ-02
					var latlng = bb.map.wgs2gcj(posi.coords.latitude, posi.coords.longitude);
					posi.coords.mlat = latlng.lat;
					posi.coords.mlng = latlng.lng;
					// Google Geocoding
					bb.map.google_geocode(latlng.lat, latlng.lng, function(result){
						if (success) success(result, posi.coords);
						bb.map.geocache = last_geocode = result;	// cache geo
						chrome.storage.local.set({ last_geocode:result });
					});
				}
			}, function(error){
				if (failed)	failed(error);
			}, {
				enableHighAccuracy: false,
		  		timeout: 5000,
		  		maximumAge: 0
			});
		},

		google_geocode : function(lat, lng, fn) {
			// Google Geocoding
			var geocode_api = "https://maps.googleapis.com/maps/api/geocode/json?";
			var geoparam = [];
			geoparam.push("latlng="+lat+','+lng);
			geoparam.push("language=zh-CN");
			geoparam.push("sensor=false");
			bb.connect(geocode_api+geoparam.join("&"), function(res){
				res = JSON.parse(res);
				console.log('google geocode result:', res);
				var results = res.results;
				if (results.length>0 && fn) {
					fn(results[0]);
				}
			});
		},

		google_staticmap : function(opt){
			// https://developers.google.com/maps/documentation/imageapis/
			opt = opt || {};
			opt.center = opt.center || (opt.lat+','+opt.lng);
			opt.sensor = opt.sensor || false;
			return encodeURI("http://maps.googleapis.com/maps/api/staticmap?"+bb.join(opt));
		},

		baidu_iplocate : function(fn){
			// baidu ip locate
			// http://developer.baidu.com/map/ip-location-api.htm
			var api = "http://api.map.baidu.com/location/ip?";
			var params = {};
			params.ak = baidu_map_ak;
			params.coor = "bd09ll";

			bb.connect(api+bb.join(params), function(res){
				res = JSON.parse(res);
				var bdlat = res.content.point.y, bdlng = res.content.point.x;
				var latlng = bb.map.bd2gcj(bdlat, bdlng);
				bb.map.baidu_geocode(latlng.lat, latlng.lng, function(result){
					result.mlat = latlng.lat;
					result.mlng = latlng.lng;
					result.bdlat = res.content.point.y;
					result.bdlng = res.content.point.x;
					if (fn) fn(result, res.content);
				});
			});
		},

		baidu_geocode : function(lat, lng, fn) {
			// Baidu Map Geocoding Service
			// http://developer.baidu.com/map/webservice-geocoding.htm
			var geocode_api = "http://api.map.baidu.com/geocoder/v2/?";
			var params = {};
			params.ak = baidu_map_ak;
			params.coordtype = "gcj02ll";
			params.callback = "geo";
			params.location = lat+","+lng;
			params.output = "json";
			params.pois = 0;

			bb.connect(geocode_api+bb.join(params), function(res){
				res = res.substr(9);
				res = res.substr(0, res.length-1);
				res = JSON.parse(res);
				if (fn && res.result) fn(res.result);
			});
		},

		baidu_staticmap : function(lat, lng, opt){
			opt = opt || {};
			opt.center = opt.center || lng+','+lat;
			return "http://api.map.baidu.com/staticimage?"+bb.join(opt);
		}

	};

})();

bb.oauth = (function(){

	var CLIENT_ID = "2898001260";
	var CLIENT_SECRET = "4997f7a3d8932c3f6e5273db0f9686d9";

	var AUTHORIZE_URL = "https://api.weibo.com/oauth2/authorize?";
	var ACCESS_TOKEN_URL = "https://api.weibo.com/oauth2/access_token?";
	var REDIRECT_URI = "";

	return {

		init : function(opts){
			opts = opts || {};
			CLIENT_ID = opts.client_id || CLIENT_ID;
			CLIENT_SECRET = opts.client_secret || CLIENT_SECRET;
			AUTHORIZE_URL = opts.authorize_url || AUTHORIZE_URL;
			ACCESS_TOKEN_URL = opts.access_token_url || ACCESS_TOKEN_URL;
			REDIRECT_URI = opts.redirect_uri || REDIRECT_URI;
		},

		authorize : function(redirect_uri){
			var keys = {};
			keys.client_id = CLIENT_ID;
			keys.response_type = "code";
			keys.redirect_uri = redirect_uri||REDIRECT_URI;
			bb.chrome.open_tab(AUTHORIZE_URL+bb.join(keys));
		}
	};
})();


bb.fs = bb.filesystem = (function(){ })();


bb.util = {};
bb.util.dragloader = (function(){

	var _holder = {};
	FileReader = FileReader||{};
	FileReader.prototype.file = null;

	var prevent = function(e) {
		e.stopPropagation();
	    e.preventDefault();
	};

	var drop = function(e){

		e.stopPropagation();
    	e.preventDefault();

    	var files = e.dataTransfer.files;
    	for (var i = 0, file; file = files[i]; i++) {

    		// file type filter
    		var imageType = /image(\/|\.)*/;
			if (!file.type.match(imageType)) {
				continue;
			}

			var freader = new FileReader();
			freader.file = file;
			freader.onload = _holder.oncomplete || function(e){};
			freader.onprogress = _holder.onprogress || function(e){};
			freader.onerror = function(e){
				console.log("FileReader Error: ", e);
			};

			// freader.readAsBinaryString(file);
			freader.readAsDataURL(file);
			if (_holder.onstart) _holder.onstart(e);

    	}
	};

	return function(deck, mode){
		if (deck) {
			deck.addEventListener("dragenter", prevent, false);
			deck.addEventListener("dragover", prevent, false);
			deck.addEventListener("dragleave", prevent, false);
			deck.addEventListener("drop", drop, false);
		}
		return _holder;
	};

})();

bb.util.uploader = (function(){})();
