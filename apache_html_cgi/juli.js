
$(function () {
    //$.getJSON("cgi-bin/iplocation.cgi?" + Math.random(), initValue);
});

function flush_result(obj){
	if(JSON.stringify(obj) == '{}'){
		$("#status").text("查询出错");
		$("#status").show();
	}else{
		$("#status").hide();
	
		$("#rsrc").text(obj["rsrc"]);
		$("#rdst").text(obj["rdst"]);
		$("#distence").text(obj["distence"]);

		$("#result").show();
	}
}

function calc(){
	$("#status").show();
	$("#result").hide();

	data = {
		"src": $("#src").val(),
		"dst": $("#dst").val()	
	};
	$.post("cgi-bin/calc_distence.py", data, flush_result, "json");
}

