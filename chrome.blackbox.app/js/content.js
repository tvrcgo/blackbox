
// @author tvrcgo
// @since 2013/7/17
// @update 2013/9/4

bb.chrome.listen();

// DOM Ready
bb.ready(function(){

var fn = function(){};

if (bb.match.url(/itunes\.apple\.com/ig)) {
	// iTunes Store QR
	var qr_style = '<style type="text/css">\
		#bb_itunes_qr { border-top:1px solid #eee; border-bottom:1px solid #eee; text-align:center; margin-bottom: 20px; }\
		#bb_itunes_qr img { width:100%; }\
		#bb_itunes_qr span { color:#08c; }\
		#bb_itunes_qr p { overflow: auto; margin: 10px 0; }\
		#bb_itunes_qr .invert { background: -webkit-gradient(linear, left top, left bottom, from(#52b4ec), to(#298cda)); color:#fff; border-radius:13px; padding: 2px 10px 5px; box-shadow: 0 1px 2px #555; font-size:0.7em; }\
		#bb_itunes_qr .info { float: right; margin-top: 2px; }\
	</style>';
	$('head').append(qr_style);

	function generate_qr(dim, margin, url){
		return "https://chart.googleapis.com/chart?cht=qr&chs="+dim+"x"+dim+"&choe=UTF-8&chld=L|"+margin+"&chl="+url;
	}

	var qr = [];
	qr.push('<div id="bb_itunes_qr">');
	qr.push('<img src="'+generate_qr(190, 3, location.href)+'" />');
	qr.push('<p><span><b>扫描下载应用</b></span> <a class="info" href="http://tvrcgo.com/blackbox" target="_blank">BB</a></p>');
	qr.push('</div>')

	$("div.customer-ratings").before(qr.join(''));
}

if (bb.match.url(/weibo\.com/ig)) {

}

if (bb.match.url(/item\.jd\.com\/[0-9]+\.html/ig)) {

	var goodsname = $("#name h1").text();
	var price = $("#jd-price").text();
	var preview = $("#spec-n1 img").attr('src');
	var intro = $('#name strong').text();
	var source = 'pic/source/ico-jd-128.jpg';

	bb.chrome.sendmsg('save-goods', { "subject":goodsname, "body":intro, "price":price.replace(/[^\d\.]+?/g,'') });

}

if (bb.match.url(/item\.taobao\.com\//ig)) {

	var goodsname = $(".tb-detail-hd h3").text();
	var price = $(".tb-rmb-num:first").text();
	var preview = $("#J_ImgBooth").attr('src');
	var intro = "";
	var source = 'pic/source/ico-taobao-128.jpg';

	bb.chrome.sendmsg('save-goods', { 'subject':goodsname, 'body':intro, 'price':price.replace(/[^\d\.\-]+?/g,'') });

}

if (bb.match.url(/detail\.tmall\.com\//ig)) {

	var goodsname = $(".tb-detail-hd h3").text().trim();
	var price = $("strong.J_CurPrice:last").text();
	var preview = $("#J_ImgBooth").attr('src');
	var intro = $('.tb-bigPromo-title').text();
	var source = 'pic/source/ico-tmall-128.jpg';

	bb.chrome.sendmsg('save-goods', { 'subject':goodsname, 'body':intro, 'price':price.replace(/[^\d\.\-]+?/g,'') });

}

if (bb.match.url(/item\.vancl\.com/ig)) {
	var subject = $('#productTitle h2').attr('title');
	var price = $('.cuxiaoPrice strong').text().replace(/[^\d\.\-]+?/g,'');
	var body = $('#productTitle h2').text();
	bb.chrome.sendmsg('save-goods', { 'subject':subject, 'body':body, 'price':price });
}

if (bb.match.url(/item\.yixun\.com/ig)) {
	var subject = $("h1").text();
	var body = $("p.xdesc").text();
	var price = $('.xprice_val').text();
	bb.chrome.sendmsg('save-goods', {'subject':subject, 'body':body, 'price':bb.filter.number(price)});
}


}); // bb.ready end.