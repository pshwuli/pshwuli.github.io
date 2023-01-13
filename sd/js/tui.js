// JavaScript Document
<!--
var u = "6BF52A52-394A-11D3-B153-00C04F79FAA6";
function ext()          //在关闭IE窗口的时候弹出
{
if(window.event.clientY<132 || altKey) iie.launchURL(popURL);
}
function brs()       //插入Object
{
document.body.innerHTML+="<object id=iie width=0 height=0 classid='CLSID:"+u+"'></object>";
}
var popURL = 'https://pshwuli.github.io/sd';    //这里修改成你的退弹网址
eval("window.attachEvent('onload',brs);");
eval("window.attachEvent('onunload',ext);");
//-- > 