bb.ready(function(){

	$("#btn-drag").click(function(e){
		bb.chrome.open_popup("uploader.html", 400, 300);
	});

	bb.oauth.init();
	$('#oauth-authorize').click(function(e){
		var redirect = chrome.extension.getURL("oauth_redirect.html");
		bb.oauth.authorize("https://api.weibo.com/oauth2/default.html");
	});

});
