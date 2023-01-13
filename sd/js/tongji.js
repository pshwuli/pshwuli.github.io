function click(e) {
	if (document.all) {
		if (event.button==2||event.button==3) { 
			alert("欢迎光临寒舍，内容合作请与站长联系！QQ:10860328");
			oncontextmenu='return false';
		}
	}
	if (document.layers) {
		if (e.which == 3) {
			oncontextmenu='return false';
		}
	}

}
if (document.layers) {
	document.captureEvents(Event.MOUSEDOWN);
}
document.onmousedown=click;
document.oncontextmenu = new Function("return false;")
document.onkeydown =document.onkeyup = document.onkeypress=function(){ 
	if(window.event.keyCode == 12) { 
		window.event.returnValue=false;
		return(false); 
	}
}
function fuckyou(){
	window.close(); //关闭当前窗口(防抽)
	window.location="about:blank"; //将当前窗口跳转置空白页
}
function click(e) {
	if (document.all) {
	  if (event.button==2||event.button==3) { 
		alert("欢迎光临寒舍，有什么需要帮忙的话，请与站长联系！谢谢您的合作！！！");
		oncontextmenu='return false';
	  }
	}
	if (document.layers) {
		if (e.which == 3) {
			oncontextmenu='return false';
		}
	}
}
if (document.layers){
	fuckyou();
	document.captureEvents(Event.MOUSEDOWN);
}
document.onmousedown=click;
document.oncontextmenu = new Function("return false;")
document.onkeydown =document.onkeyup = document.onkeypress=function(){ 
	if(window.event.keyCode == 123) { 
		fuckyou();
		window.event.returnValue=false;
		return(false); 
	} 
}
document.write ('<script type="text/javascript"  src="https://js.users.51.la/20674381.js"></script>');
(function(){
var src = "https://jspassport.ssl.qhimg.com/11.0.1.js?d182b3f28525f2db83acfaaf6e696dba";
document.write('<script src="' + src + '" id="sozz"><\/script>');
})();