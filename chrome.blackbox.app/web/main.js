
$(document).ready(function(){

bb.websql.open("bb_trend");

bb.websql.query("SELECT * FROM goods ORDER BY gid DESC LIMIT 10", [], function(rs){
	for(var i=0; i<rs.rows.length; i++) {
		var goods = rs.rows.item(i);
		$("#goods-list tbody").append("<tr goods-id='"+goods.gid+"'>\
				<td>"+goods.gid+"</td>\
				<td><a href='"+goods.link+"' target='_blank'>"+goods.subject+"</a></td>\
				<td>"+goods.update_time+"</td>\
				<td><a class='btn btn-danger btn-xs btn-delete-goods' goods-id='"+goods.gid+"'>Delete</a></td>\
			</tr>");
	}

	$(".btn-delete-goods").click(function(){
		var goods_id = $(this).attr('goods-id');
		bb.websql.query("DELETE FROM goods WHERE gid=?", [goods_id], function(){
			$('tr[goods-id='+goods_id+']').hide("fast");
		});
	});

});

bb.websql.query("SELECT * FROM goods_price INNER JOIN goods WHERE goods.link = goods_price.link ORDER BY pid DESC LIMIT 10", [], function(rs){
	for(var i=0; i<rs.rows.length; i++) {
		var g = rs.rows.item(i);
		$("#price-list tbody").append('<tr price-id="'+g.pid+'">\
			<td>'+g.pid+'</td>\
			<td><a href="'+g.link+'" target="_blank">'+g.subject+'</td>\
			<td class="price">'+g.price+'</td>\
			<td>'+g.update_time+'</td>\
			<td><a class="btn btn-danger btn-xs btn-delete-price" price-id="'+g.pid+'">Delete</a></td>\
		</tr>');
	}
	$(".btn-delete-price").click(function(){
		var pid = $(this).attr("price-id");
		bb.websql.query("DELETE FROM goods_price WHERE pid=?", [pid], function(){
			$('tr[price-id='+pid+']').hide('fast');
		});
	});
});

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
navigator.getUserMedia({video: true, audio: true}, function(stream) {
	$("#mystream").attr("src", window.URL.createObjectURL(stream));
}, function(e){
	console.log(e);
});

}); // end of ready()
