
bb.ready(function(){

var close_tab = function(){
	bb.chrome.sendmsg('close-focus-tab', {}, function(){});
};

$(document).keydown(function(e){

	// scroll to top on press 'T'.
	if ( e.keyCode === 84 ) {
		$("html, body").animate({ scrollTop: 0 }, "fast");
	}

	// press 'ESC'
	if ( e.keyCode === 27 ) {
		close_tab();
	}

});

// 微博 OAUTH 授权回调
if (bb.match.url(/api\.weibo\.com\/oauth2\/default\.html\?code=/ig)) {
	close_tab();
}

// 百度音乐盒
// if (bb.match.url(/play\.baidu\.com/ig)) {
// 	// 去掉右侧广告
// 	$("#lrcCol").css("right", "0");
// 	$('.main-wrapper .column2').css("right", "251px");
// }

// 1024
if (bb.match.url(/open.caoliutv.info\/o/ig)) {
	close_tab();
}

});
