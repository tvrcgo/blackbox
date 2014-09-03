bb.ready(function(){

	var box = document.getElementById("holder");
	var loader = bb.util.dragloader(box);
	loader.onstart = function(){
		$("#progress").show();
		$("div.progress-bar").css("width", "1%");
	};
	loader.onprogress = function(e){
		var percent = Math.round((e.loaded * 100) / e.total);
		$("div.progress-bar").css("width", percent+"%");
		$('#holder-tip').html(percent+"%");
	};
	loader.oncomplete = function(e){
		console.log(e.target);
		if (e.target.result !== null) {
			$("#resultimg").attr("src", e.target.result);
		}
		bb.wait(2, function(){
			$("div.progress-bar").css("width", "0%");
			$('#holder-tip').html("drag file here.");
		});

	};
});
