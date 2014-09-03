
bb.chrome.listen();

// bb.onmessage = {

// 	notificate : function(req, sender, res) {
// 		var title = req.title;
// 		var preview = req.preview;
// 		var msg = req.msg;
// 		var url = sender.tab.url;

// 		var opts = {
// 			'type' : 'basic',
// 			'title' : title,
// 			'message' : msg,
// 			'iconUrl' : preview
// 		};

// 		chrome.notifications.create(notificationId, opts, function(notid){
// 			_notification_link = url;
// 		});
// 	},

// 	notificate_goods : function(req, sender, res) {

// 		var title = req.name;
// 		var price = req.price;
// 		var preview = req.preview;
// 		var intro = req.intro;
// 		var url = sender.tab.url;

// 		var opts = {
// 			'type' : 'image',
// 			'title' : title,
// 			'message' : intro,
// 			'iconUrl' : req.sourceicon,
// 			'items' : [
// 				{ 'title' : '价格', 'message' : price }
// 			],
// 			'imageUrl' : preview,
// 			'buttons' : [
// 				{ 'title': price.replace(/[^\d\.\-]/ig, ''), 'iconUrl':'pic/ico-yen-16.png' },
// 			]
// 		};

// 		chrome.notifications.create(url, opts, function(notid){
// 			_notification_link = url;
// 		});

// 	}
// }


// var _notification_link = "";
// chrome.notifications.onClicked.addListener(function(notid) {
// 	bb.tab.open(_notification_link);
// 	// chrome.notifications.clear(notid, function(){});
// });

// chrome.notifications.onButtonClicked.addListener(function(notid, idx) {

// });

// chrome.notifications.onClosed.addListener(function(notid, byUser) {
// 	if (byUser) {
// 		// alert('you did close.');
// 	}
// });

// chrome.webRequest.onCompleted.addListener(function(detail) {
// 	console.log(detail);
// }, {
// 	urls : [ "*://*" ],
// 	types : ["image", "object"]
// }, ["blocking"]);

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

//     chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
// 		console.log(tabs);
// 		var tab = tabs[0];
// 	    var url = tab.url;
// 	});
// });

// chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {

//    	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
// 		console.log(tabs);
// 		var tab = tabs[0];
// 	    var url = tab.url;
// 	});
// });

// var notOption = {
// 	basic : {
// 		"type" : "basic",
// 		"title" : "basic notice",
// 		"message" : "basic message",
// 		"iconUrl" : "pic/user-128.png",
// 		'expandedMessage' : 'expandedMessage',
// 		'buttons' : [
// 			{ 'title':'189 2500 9043', 'iconUrl':'pic/ico_phone_16.png' },
// 			{ 'title':'tvrcgo.com', 'iconUrl':'pic/ico_network_16.png' }
// 		]
// 	},
// 	list : {
// 		"type" : 'list',
// 		'title' : 'list notice',
// 		'message' : 'list message',
// 		"iconUrl" : "pic/user-128.png",
// 		'items' : [
// 			{ 'title':'item title', 'message':'item msg'},
// 			{ 'title':'item title 2', 'message':'item msg 2'},
// 			{ 'title':'item title 3', 'message':'item msg 3'},
// 			{ 'title':'item title 4', 'message':'item msg 4'}
// 		],
// 		'buttons' : [
// 			{ 'title':'189 2500 9043', 'iconUrl':'pic/ico_phone_16.png' },
// 			{ 'title':'tvrcgo.com', 'iconUrl':'pic/ico_network_16.png' }
// 		]
// 	},
// 	image : {
// 		'type' : 'image',
// 		'title' : 'image notice',
// 		'message' : 'image msg',
// 		'iconUrl' : 'pic/user-128.png',
// 		'imageUrl' : 'http://img.hb.aicdn.com/e733762a284984b334304fe7c83b77b661149eb2e731-Gtz2Kf_fw580',
// 		'buttons' : [
// 			{ 'title':'189 2500 9043', 'iconUrl':'pic/ico_phone_16.png' },
// 			{ 'title':'tvrcgo.com', 'iconUrl':'pic/ico_network_16.png' }
// 		]
// 	},
// 	progress : {
// 		'type' : 'progress',
// 		'title' : 'progress title',
// 		'message' : 'progress message',
// 		'iconUrl' : 'https://cdn2.iconfinder.com/data/icons/picons-essentials/57/user-128.png',
// 		'progress' : 23
// 	}
// };

// chrome.notifications.create("basic0", notOption.image, function(notid){

// 	chrome.notifications.onClicked.addListener(function(notid) {
// 		alert(notid);
// 	});

// 	chrome.notifications.onButtonClicked.addListener(function(notid, idx) {
// 		alert(idx);
// 	});

// 	chrome.notifications.onClosed.addListener(function(notid, byUser) {
// 		if (byUser) {
// 			// alert('you did close.');
// 		}
// 	});
// });



bb.websql.open('bb_trend');

// bb.websql.query("DROP TABLE IF EXISTS goods");
// bb.websql.query("DROP TABLE IF EXISTS goods_price");

bb.websql.query("CREATE TABLE IF NOT EXISTS goods(\
	gid INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
	subject, \
	body, \
	link, \
	update_time TIMESTAMP DEFAULT (datetime('now','localtime')))", [], function(rs){
	console.log('goods created.');
});

bb.websql.query("CREATE TABLE IF NOT EXISTS goods_price(\
	pid INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
	link, \
	price, \
	update_time TIMESTAMP DEFAULT (datetime('now','localtime')))", [], function(rs){
	console.log('goods_price created.');
});

bb.chrome.onmsg('save-goods', function(msg, sender, res){

	var goods = {};
	goods.subject = msg.subject;
	goods.body = msg.body;
	goods.link = sender.tab.url;
	goods.price = bb.filter.range(msg.price);

	if (goods.subject==null || goods.subject=="" || goods.price=="" || goods.link=="") {
		console.warn('warn: lack parameters.', goods);
		return false;
	}

	bb.websql.query('SELECT * FROM goods WHERE link=?', [goods.link], function(rs){
		if(rs.rows.length==0 && goods.subject!=null && goods.subject!="") {
			bb.websql.query("INSERT INTO goods(subject, body, link) VALUES(?,?,?)", [goods.subject, goods.body, goods.link], function(){
				if (goods.price != ""){
					bb.websql.query("INSERT INTO goods_price(link, price) VALUES(?,?)", [goods.link, goods.price], res);
				}
			});
		}
		else {
			bb.websql.query("UPDATE goods SET subject=?, body=? WHERE link=?", [goods.subject, goods.body, goods.link]);
			if (goods.price != ""){
				bb.websql.query("INSERT INTO goods_price(link, price) VALUES(?,?)", [goods.link, goods.price], res);
			}
		}
	});

});

