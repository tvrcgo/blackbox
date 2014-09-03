
bb.chrome.listen();

bb.chrome.onmsg('get-focus-tab', function(msg, sender, res){
	res(sender.tab);
});

bb.chrome.onmsg('close-focus-tab', function(msg, sender, res){
	bb.chrome.close_tab(sender.tab, res);
});

bb.chrome.onmsg('open-link-in-tab', function(msg, sender, res){
	bb.chrome.open_tab(msg.url);
});

var bookmark_menu = chrome.contextMenus.create({
	type:'normal',
	id:'bb_page_bookmark_menu',
	title:'书签',
	contexts:['page','link'],
	onclick : function(info, tab){
		var link = info.linkUrl || info.pageUrl;
		link = encodeURIComponent(link);
		var title = tab.title;
		bb.connect("http://tvrcgo.com/pocket/bookmark/add?title="+title+"&link="+link, function(result){
			// result = JSON.parse(result);
			bb.chrome.basic_notice( (info.linkUrl||tab.title), '书签已添加', {
				"notificationId" : "bookmark_notice",
				"icon":"pic/bookmark-128.png",
				"delay" : 3000
			});
		});
	}
});

var shortlink_menu = chrome.contextMenus.create({
	type : 'normal',
	id : 'bb_page_shortlink_menu',
	title : '短链接',
	contexts : ['page', 'link'],
	onclick : function(info, tab) {

		var key = bb.random_item(["2495979531", "293518880", "2148987715", "2749062915"]);
		var url = info.linkUrl || info.pageUrl;
		url     = encodeURIComponent(url);

		bb.connect("https://api.weibo.com/2/short_url/shorten.json?source="+key+"&url_long="+url, function(result){

			// console.log(result);
			if (bb.filter.trim(result) == "") {
				bb.chrome.basic_notice("新浪服务器无响应", tab.url, {"icon":"pic/alert-128.png"});
				return;
			}

			result = JSON.parse(result);
			var short_url = result.urls[0].url_short;
			if (short_url && short_url!="") {
				bb.copyText(short_url);
				bb.chrome.basic_notice( (info.linkUrl||tab.title), '短链接（'+short_url+'）已复制到剪贴板', {
					"notificationId" : "shortlink_notice",
					"icon":"pic/link-128.png",
					"delay" : 6000
				});
			}
			else {
				bb.chrome.basic_notice("链接有风险，新浪不接收", tab.url, {"icon":"pic/alert-128.png"});
				// console.log("链接无法缩短", result);
			}

		});
	}
});

var qr_menu = chrome.contextMenus.create({
	type : "normal",
	id : "bb_page_qr_menu",
	title : "二维码",
	contexts : ["page", "image", "link"],
	onclick : function(info, tab) {

		var link;
		if (info.linkUrl) {
			link = info.linkUrl;
		}
		else if (info.selectionText && bb.match.uri(info.selectionText)) {
			link = bb.filter.trim(info.selectionText);
		}
		else {
			link = (info.srcUrl ? info.srcUrl : info.pageUrl);
		}

		// var qr_url = "https://chart.googleapis.com/chart?cht=qr&chs=360x360&choe=UTF-8&chld=L|6&chl="+encodeURIComponent(link);
		var qr_url = "http://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=20&data="+encodeURIComponent(link);
		// var winWidth = 236;
		// var winHeight = 259;
		// bb.chrome.open_popup(url, winWidth, winHeight);
		bb.chrome.image_notice((info.linkUrl||info.srcUrl||tab.title), ((info.linkUrl||info.srcUrl) ? "" : link), qr_url, {
			"notificationId" : "qr_code",
			"icon" : "pic/scan_qr-128.png",
			"last" : true
		});
	}
});

// var shareQQ = chrome.contextMenus.create({
// 	type : "normal",
// 	id : "bb_page_shareqq_menu",
// 	title : "分享到QQ",
// 	contexts : ["page", "selection", "image", "link"],
// 	onclick : function(info, tab) {
// 		var link = (info.linkUrl ? info.linkUrl : (info.srcUrl ? info.srcUrl : info.pageUrl));
// 		var opt = {
// 			url : link,
// 			desc : info.selectionText || '',
// 			title : tab.title || '',
// 			summary : link || '',
// 			pics : info.srcUrl || '',
// 			flash : '',
// 			site : '黑匣子'
// 		};
// 		var s = [];
// 		for(var i in opt)	s.push(i + '=' + encodeURIComponent(opt[i]||''));
// 		var url = "http://connect.qq.com/widget/shareqq/index.html?"+s.join('&');
// 		var winWidth = 753;
// 		var winHeight = 642;
// 		bb.chrome.open_popup(url, winWidth, winHeight);
// 	}
// });

// var getlocation = chrome.contextMenus.create({
// 	type : "normal",
// 	id : "bb_page_geolocation_menu",
// 	title : "定位",
// 	contexts : ['page'],
// 	onclick : function(info, tab){

// 		bb.chrome.basic_notice("正在定位您的位置", "...", {
// 			"icon":"pic/target-128.png",
// 			"notificationId" : "geolocation"
// 		});

// 		bb.map.geolocate(function(geo, gps){
// 			var loc = geo.location || geo.geometry.location;
// 			var latlng = loc.lat+','+loc.lng;
// 			var address = geo.formatted_address;
// 			var staticmap = bb.map.google_staticmap({
// 				center : latlng,
// 				zoom : 14,
// 				size : "360x360",
// 				markers : "size:mid|color:red|"+latlng
// 			});

// 			bb.chrome.image_notice("当前位置", address, staticmap, {
// 				"icon":"pic/location-128.png",
// 				"notificationId" : "geolocation",
// 				"link" : "https://ditu.google.cn/maps?q="+latlng,
// 				"last" :true
// 			});
// 		}, function(err){

// 			bb.map.baidu_iplocate(function(geo, gps){
// 				var address = geo.formatted_address;
// 				var latlng = geo.mlat+','+geo.mlng;
// 				var bdlatlng = geo.location.lng+","+geo.location.lat;
// 				var bdstaticmap = "http://api.map.baidu.com/staticimage?center="+bdlatlng+"&width=360&height=360&zoom=14&markers="+bdlatlng;

// 				bb.chrome.image_notice("当前位置", address, bdstaticmap, {
// 					"icon":"pic/location-128.png",
// 					"notificationId" : "geolocation",
// 					"link" : "https://ditu.google.cn/maps?q="+latlng,
// 					"last" :true
// 				});
// 			});

// 		}, {
// 			cache_expires : 1000*600
// 		});

// 	}
// });
