var netStatus=1;
var indexPage=false;
var access_token=null;
var hideCTL=getParameterByName("hideCTL"); //是否APP预览，关闭图标和提醒
var appVer=0;
var inUpdatePage;
var language = getParameterByName("language");
var orientationMode = null;
//本地数据处理
var app_type=null;
var netprompt_count = 0;
var netprompt_interval = null;
var firstNetdisconnect = true;
var localControl=new Object();
var pagePath = window.location.pathname;
var postwificonfig = null;//若在wifi页，因为连接wifi导致的连接中断，不弹出网络中断的提示
var wificoutInterval = null;
var forAppNetDisCnn = true;
var reDiscoverTimeout = null;
var inAP=0;
var autoAuth_token=null; //proxy远程使用
var autoAuth=false; //在首页判断是不是proxy远程
var mode_select = null;
var timezone = null;
var timezone_mode = null;
function isAP(){
        getJSON("/sysinfo?wlan1_ip=1", function(e, status){
                if("wlan1_ip" in e ){
                        if(e.wlan1_ip==document.domain) {
                                inAP=1;
                        }
                }
        })
}
if(window.webkit && window.webkit.messageHandlers){ //ios中
	app_type="ios";
	localControl.getValue=function(k, v){return window.prompt(String(k), v)};
	localControl.putValue=function(k, v){return window.webkit.messageHandlers.putValue.postMessage([String(k), String(v)])};
	localControl.updatePwd=function(ssid,pwd,key){return window.webkit.messageHandlers.updatePwd.postMessage([String(ssid), String(pwd), String(key)])};
	localControl.deleteDevice=function(ssid){return window.webkit.messageHandlers.deleteFacility.postMessage(ssid)};
	localControl.downloadVideo=function(url){return window.webkit.messageHandlers.downloadVideo.postMessage(url)};
	localControl.connectWifi=function(ssid,pwd){return window.webkit.messageHandlers.connectFacility.postMessage([ssid, pwd])};
	localControl.startPage=function(page){return window.webkit.messageHandlers.startPage.postMessage(page)}; //设备列表页：DeviceListPage ；重置页：ResetPage；连接帮助页：ConnectHelpPage
	localControl.upFirmware=function() {return window.webkit.messageHandlers.upFirmware.postMessage(["http://"+document.domain+"/pkg_upload", getAccessToken()])};
	localControl.notify=function(msg) {return window.webkit.messageHandlers.notify.postMessage(msg)};
	localControl.setToken=function(token) {return window.webkit.messageHandlers.setToken.postMessage(token)};
	localControl.statusEventSourceError=function() {return window.webkit.messageHandlers.statusEventSourceError.postMessage("1")};
	localControl.playback=function(page){return window.webkit.messageHandlers.previewPlayback.postMessage(page)};
	localControl.inPage=function(page){if(window.webkit.messageHandlers.inPage) return window.webkit.messageHandlers.inPage.postMessage(page)};
	localControl.updateStartTime=function(datetime) {if(window.webkit.messageHandlers.updateStartTime) return window.webkit.messageHandlers.updateStartTime.postMessage(datetime)};
	localControl.focus=function(key) {if(window.webkit.messageHandlers.focus) return window.webkit.messageHandlers.focus.postMessage(key)};
	localControl.orientation=function(orientation) {if(window.webkit.messageHandlers.orientation) return window.webkit.messageHandlers.orientation.postMessage(String(orientation))};
	localControl.keepAlive=function(msg) {if(window.webkit.messageHandlers.keepAlive) return window.webkit.messageHandlers.keepAlive.postMessage("alive");}
	localControl.reDiscover=function(msg) {return window.webkit.messageHandlers.reDiscover.postMessage(msg)}
	localControl.zoomActivated=function(num) {if(window.webkit.messageHandlers.zoomActivated) return window.webkit.messageHandlers.zoomActivated.postMessage(num)}
	localControl.settingsSync=function(str) {if(window.webkit.messageHandlers.settingsSync) return window.webkit.messageHandlers.settingsSync.postMessage(str)}
}else if(window.atliviewControl){ //安卓中
	app_type="android";
	localControl.getValue=function(k, v){return window.atliviewControl.getValue(String(k), v)};
	localControl.putValue=function(k, v){return window.atliviewControl.putValue(String(k), String(v))};
	localControl.updatePwd=function(ssid,pwd,key){return window.atliviewControl.updatePwd(String(ssid), String(pwd), String(key))};
	localControl.deleteDevice=function(ssid){return window.atliviewControl.deleteFacility(ssid)};
	localControl.downloadVideo=function(url){return window.atliviewControl.downloadVideo(url)};
	localControl.connectWifi=function(ssid, pwd){return window.atliviewControl.connectFacility(ssid, pwd)};
	localControl.startPage=function(page){return window.atliviewControl.startPage(page)}; //设备列表页：DeviceListPage ；重置页：ResetPage；连接帮助页：ConnectHelpPage
	localControl.upFirmware=function() {return window.atliviewControl.upFirmware("http://"+document.domain+"/pkg_upload", getAccessToken())};
	localControl.notify=function(msg) {return window.atliviewControl.notify(msg)};
	localControl.setToken=function(token) {return window.atliviewControl.setToken(token)};
	localControl.statusEventSourceError=function() {if(window.atliviewControl.statusEventSourceError) return window.atliviewControl.statusEventSourceError("1")};
	localControl.updateStartTime=function(datetime) {if(window.atliviewControl.updateStartTime) return window.atliviewControl.updateStartTime(datetime)};
	localControl.focus=function(key) { return null};
	localControl.orientation=function(orientation) { return null};
	localControl.keepAlive=function(msg) {return null}
	localControl.reDiscover=function(msg) {return window.atliviewControl.reDiscover(msg)}
	localControl.zoomActivated=function(num) {if(window.atliviewControl.zoomActivated) return window.atliviewControl.zoomActivated(num)}
	localControl.settingsSync=function(str) {if(window.atliviewControl.settingsSync) return window.atliviewControl.settingsSync(str)}
}else if(window.localStorage){ //普通浏览器中
	localControl.getValue=function(k, v){var getVal=window.localStorage.getItem(k);if(getVal){return getVal;}else{return v;}};
	localControl.putValue=function(k, v){return window.localStorage.setItem(k, v)};
	localControl.updatePwd=function(ssid,pwd,key){window.localStorage.setItem("SSID", ssid),window.localStorage.setItem("PASSWORD", pwd),window.localStorage.setItem("KEY", key)};
	localControl.deleteDevice=function(ssid){return null};
	localControl.downloadVideo=function(url){return null};
	localControl.connectWifi=function(ssid,pwd){return null};
	localControl.startPage=function(page){return null};
	localControl.upFirmware=function() {return null};
	localControl.notify=function(msg) {return null};
	localControl.setToken=function() {return null};
	localControl.statusEventSourceError=function() {return null};
	localControl.updateStartTime=function(datetime) {return null};
	localControl.focus=function(key) { return null};
	localControl.orientation=function(orientation) { return null};
	localControl.keepAlive=function(msg) {return null}
	localControl.reDiscover=function() {return null}
	localControl.zoomActivated=function(num) {return null}
	localControl.settingsSync = function(obj) {return null}
}else {
	alert("当前浏览器不支持本地储存！请更换或更新浏览器！");
	localControl.getValue=function(k, v){return null};
	localControl.putValue=function(k, v){return null};
	localControl.updatePwd=function(ssid,pwd,key){return null};
	localControl.deleteDevice=function(ssid){return null};
	localControl.downloadVideo=function(url){return null};
	localControl.connectWifi=function(ssid,pwd){return null};
	localControl.startPage=function(page){return null};
	localControl.upFirmware=function() {return null};
	localControl.notify=function() {return null};
	localControl.setToken=function() {return null};
	localControl.statusEventSourceError=function() {return null};
	localControl.updateStartTime=function(datetime) {return null};
	localControl.keepAlive=function(msg) {return null}
	localControl.reDiscover=function() {return null}
	localControl.zoomActivated=function(num) {return null}
	localControl.settingsSync = function(obj) {return null}
}

function getCookie(name)
{
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
		return unescape(arr[2]);
	else
		return null;
}
function setCookie(name,value)
{
	var Days = 1;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days*24*60*60*1000);
	document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}

var browserLang = navigator.language||navigator.userLanguage;//常规浏览器语言和IE浏览器
browserLang = browserLang.substr(0, 2);
if(!language) {
	if(!app_type){
		language = browserLang;
	}else{
		language=localControl.getValue("language", "zh");
	}
}else {
	localControl.putValue("language", language);
}
appVer=parseFloat(localControl.getValue("appVer", 0)); //app版本号

$(function(){
	//keepalive
	var keepaliveEventSource;
	function initKeepaliveEventSource() {
		if(keepaliveEventSource) keepaliveEventSource.close();
		keepaliveEventSource = new EventSource("/status?sse=true" + (getAccessToken()?'&access_token='+getAccessToken():''));
		console.log("initKeepaliveEventSource");
		keepaliveEventSource.onmessage = function(e) {
			netConnected();
			console.log("KeepaliveEventSource onmessage");
			var status = JSON.parse(e.data);
			if(status.sessionId === 0){
				var d = new Date();
				postJSON('/status', {time: d.toJSON(),timezone:-(d.getTimezoneOffset()/60)});
			}
		}
		keepaliveEventSource.onerror = function() {
			if(inUpdatePage == true) {
				console.log("KeepaliveEventSource onerror, 但在升级页面，忽略");
			}else {
				netDisconnected();
				// if(forAppNetDisCnn){
				// 	$("#testAA").show();
				// 	localControl.reDiscover("reDiscover");
				// 	forAppNetDisCnn = false;
				// }
				console.log("KeepaliveEventSource onerror");
			}
			window.setTimeout(function(){
				initKeepaliveEventSource();
			}, 3000);
		}
	}
	if(!indexPage){
		initKeepaliveEventSource();
	}
})

//根据分辨率初始化文字大小
function handlerOrientationChange(){
    var width = window.innerWidth <= 320 ? 320: window.innerWidth; // >= 640 ? 640 : window.innerWidth;
    var fontSize = 100 * (width / 400);
    document.documentElement.style.fontSize = fontSize + 'px';
}

//判断横屏竖屏,修正滑块控件长度
function fixBody(){ 
	if(window.orientation==180||window.orientation==0){
		console.log("竖屏");
		var winW = $(window).width(),
			winH = $(window).height();
		$("body").removeClass("landscape").addClass("portrait");
		if (winW > 0.57*winH) {
			$("body").addClass("cover");
		}else{
			$("body").removeClass("cover");
		}
	}
	if(window.orientation==90||window.orientation==-90){
		console.log("横屏");
		var winW = $(window).width(),
			winH = $(window).height();
		$("body").removeClass("portrait").addClass("landscape");
		if (winH < 0.56*winW) {
		}
	}

}

function positionFixed(){
	var currentPosition;
	var speed=1;//页面滚动距离
	currentPosition=document.documentElement.scrollTop || document.body.scrollTop;
	currentPosition-=speed; 
	window.scrollTo(0,currentPosition);//页面向上滚动
	currentPosition+=speed; //speed变量
	window.scrollTo(0,currentPosition);//页面向下滚动
	console.log("do positionFixed");
}
//IOS输入框取消后弹回
$(function(){
  $("input").blur(function(){
	if(app_type!="ios") return;
	positionFixed();
  });
});

//var sendControlTimer;
//给滑动控件绑定加减按钮事件,滑动滑块时改变当前参数数值
function setSliderEvent(a,b,c,f){
	var step = b.attr("data-slider-step"),
		val = b.attr("data-slider-value"),
		min = b.attr("data-slider-min"),
		max = b.attr("data-slider-max");
		if(c.attr("id")=="r_bias"){
			var nocb = "r_bias";
		}else if(c.attr("id")=="b_bias"){
			var nocb = "b_bias";
		}else{
			var nocb = 0
		}
	b.siblings(".slider-plus").on("click",function(e){
		e.stopPropagation();
		
		var v = a.slider('getValue');
		var x = parseInt(v) + parseInt(step);
		if(v<max){
			a.slider('setValue', x);
			if(f)f(x, nocb, "delay");
			if(x>0 && b.attr("id")!="s0"){
				x = "+" + x;
			}
			console.log(x);
			c.text(x);
			b.siblings(".slider").find(".tooltip-main .tooltip-inner1").text(x);
		}
	})
	b.siblings(".slider-minus").on("click",function(e){
		e.stopPropagation();
		var v = a.slider('getValue');
		var y = parseInt(v) - parseInt(step);
		if(v>min){
			a.slider('setValue', y);
			if(f)f(y, nocb, "delay");
			if(y>0 && b.attr("id")!="s0"){
				y = "+" + y;
			}
			console.log(y);
			c.text(y);
			b.siblings(".slider").find(".tooltip-main .tooltip-inner1").text(y);
		}
	})
	b.on("change", function(slideEvt) {
		var v = a.slider('getValue');
		//console.log(f);
		if(f) {
			f(v, nocb, "delay");
		}
		if(v>0 && b.attr("id")!="s0"){
			v = "+" + v;
		}
		console.log(v);
		c.text(v);
		b.siblings(".slider").find(".tooltip-main .tooltip-inner1").text(v);
		//document.addEventListener('touchmove',stopScrolling,false);
	});
}


//小于两位数自动补0
function PrefixInteger(num, length) {
	if(num.toString().length<2){
		return (Array(length).join('0') + num).slice(-length);
	}else{
		return num;
	}
}

function isNumber(val){
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if(regPos.test(val) || regNeg.test(val)){
        return true;
    }else{
        return false;
    }
}

$(function(){
	setTimeout(function () {
	    //handlerOrientationChange();
	    fixBody();
	}, 0);
	$.ajaxSetup({
	    cache:false
	});
	//获取电量
	var batteryWidth = $("#battery").attr("data-battery")*0.14;
	$("#battery").width(batteryWidth);




})

$(window).resize(function(){
    //handlerOrientationChange();
    fixBody();
    positionFixed();
})

function getAccessKey() {
  var access_key=localControl.getValue("KEY", "1234");            
  return access_key;
}


function getAccessToken() {
  if(access_token==null) access_token=localControl.getValue("access_token", "1111");
  //console.log("getAccessToken: " + access_token);
  return access_token;
}

function setAccessToken(tk) {
  console.log("setAccessToken: " + tk);
  localControl.putValue("access_token", String(tk));
  access_token = tk;
}

function addAuthHeader(xhr, settings) {
  if(getAccessToken()){
    xhr.setRequestHeader('Authorization', 'Bearer ' + getAccessToken());
  }
}

function postJSON(url, obj, successCallback, errorCallback, dataType, completeCallback) {
	console.log("postJSON /"+url+" type:"+(dataType?dataType:'json')+" "+JSON.stringify(obj));
	$.ajax({ type: "POST", url: url, contentType:'application/json', data: JSON.stringify(obj), dataType: dataType?dataType:'json', beforeSend: addAuthHeader, success: successCallback, error: function(xhr, status, ex) {
    if(xhr.status === 401){
      doAuthNew(getAccessKey(), function(token) {
        setAccessToken(token);
        $.ajax({ type: "POST", url: url, contentType:'application/json', data: JSON.stringify(obj), dataType: dataType?dataType:'json', beforeSend: addAuthHeader, success: successCallback, error: errorCallback});
      }, function() {
        if(errorCallback)errorCallback(xhr, status, ex);
      });
    }
    else {
      if(errorCallback)errorCallback(xhr, status, ex);
    }
  }, complete: completeCallback}); 
}


function putJSON(url, obj, successCallback, errorCallback, dataType) {
	$.ajax({ type: "PUT", url: url, contentType:'application/json', data: JSON.stringify(obj), dataType: dataType?dataType:'json', beforeSend: addAuthHeader, success: successCallback, error: function(xhr, status, ex) {
		if(xhr.status === 401){
			doAuthNew(getAccessKey(), function(token) {
				setAccessToken(token);
				$.ajax({ type: "PUT", url: url, contentType:'application/json', data: JSON.stringify(obj), dataType: dataType?dataType:'json', beforeSend: addAuthHeader, success: successCallback, error: errorCallback});
			}, function() {
				if(errorCallback) errorCallback(xhr, status, ex);
			});
		}else {
			if(errorCallback) errorCallback(xhr, status, ex);
		}
	}}); 
}

function getJSON(url, successCallback, errorCallback, dataType, completeCallback) {
	$.ajax({ type: "GET", url: url, dataType: dataType?dataType:'json', beforeSend: addAuthHeader, success: successCallback, error: function(xhr, status, ex) {
      if(xhr.status === 401){
        doAuthNew(getAccessKey(), function(token) {
          setAccessToken(token); 
          $.ajax({ type: "GET", url: url, dataType: dataType?dataType:'json', beforeSend: addAuthHeader, success: successCallback, error: errorCallback,timeout:3000});
        }, function() {
	  console.log("auth error, token:"+getAccessToken()+"key:"+getAccessKey());
          if(errorCallback)errorCallback(xhr, status, ex);
        });
      }
      else {
        if(errorCallback)errorCallback(xhr, status, ex);
      }
  }, complete: completeCallback, crossDomain:true ,timeout:3000}); 
}

function getJSON2(url, successCallback, errorCallback, dataType, completeCallback) {
	$.ajax({ type: "GET", url: url, dataType: dataType?dataType:'json', success: successCallback, error: errorCallback, complete: completeCallback, crossDomain:true ,timeout:3000});
}
function genNonce(len)
{
  var cs = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '-', '.'];

  var nonce = '';
  for(var i=0; i<len; i++){
    nonce += cs[Math.floor(Math.random()*64)];
  }

  return nonce;
}

//认证
var errorCount400=0;
function doAuth(accessKey, successCallback, errorCallback) { 
  getJSON('/auth', function(resp){
    var cnonce = genNonce(12);
    var msg = resp.realm + '.' + resp.nonce + '.' + cnonce;
    var hash = CryptoJS.HmacSHA256(msg, accessKey);
    var response = CryptoJS.enc.Base64.stringify(hash);
	console.log("doAuth, key:"+accessKey);
    postJSON('/auth', { nonce: resp.nonce, cnonce: cnonce, response: response, timestamp: (new Date()).toJSON() }, function(resp) {
      errorCount400=0;
      if('access_token' in resp){
	$("#forAuth").hide();
        if(successCallback)successCallback(resp['access_token']);
      }
      else {
	if(app_type) {
		if(language && language=="en"){
			$("#forAuth .dialog-poppup-content").text("Authentication failed!  Unable to connect to the web!"+"("+accessKey+")");
		}else{
			$("#forAuth .dialog-poppup-content").text("安全认证失败，无法连接设备!"+"("+accessKey+")");
		}
		$("#forAuth").show();
	}
	if(!autoAuth) browser_key();
	else $("#forAutoAuth").show();
        if(errorCallback)errorCallback();
      }
    }, function(xhr, status, ex) {
	if(app_type) {
		if(xhr.status === 400) {
		    if(++errorCount400>=3){
			errorCount400=0;
			if(language && language=="en"){
				$("#forAuth .dialog-poppup-content").text("Authentication failed!  Unable to connect to the web!"+"(POST Error:"+xhr.status+","+accessKey+")");
			}else{
				$("#forAuth .dialog-poppup-content").text("安全认证失败，无法连接设备!"+"(POST Error:"+xhr.status+","+accessKey+")");
			}
			$("#forAuth").show();
		    }
		}else {
			errorCount400=0;
			if(language && language=="en"){
				$("#forAuth .dialog-poppup-content").text("Authentication failed!  Unable to connect to the web!"+"(POST Error:"+xhr.status+","+accessKey+")");
			}else{
				$("#forAuth .dialog-poppup-content").text("安全认证失败，无法连接设备!"+"(POST Error:"+xhr.status+","+accessKey+")");
			}
			$("#forAuth").show();
		}
	}
	if(!autoAuth) browser_key();
	else $("#forAutoAuth").show();
      if(errorCallback)errorCallback();
    });

  }, function(xhr, status, ex) {
	if(app_type) {
		if(language && language=="en"){
			$("#forAuth .dialog-poppup-content").text("Authentication failed!  Unable to connect to the web!"+"(GET Error:"+xhr.status+")");
		}else{
			$("#forAuth .dialog-poppup-content").text("安全认证失败，无法连接设备!"+"(GET Error:"+xhr.status+")");
		}
		$("#forAuth").show();
	}
	if(!autoAuth) browser_key();
	else $("#forAutoAuth").show();
    if(errorCallback)errorCallback();
  });
}

function doAuthNew(accessKey, successCallback, errorCallback){
	//autoAuth=localControl.getValue("autoAuth", 0);
	autoAuth=getCookie("autoAuth");
	if(autoAuth!="1") autoAuth=false;
	if(autoAuth){
		var sn=location.hostname.slice(0,location.hostname.indexOf('.'));
		var path=location.hostname.slice(location.hostname.indexOf('.')+1);
		//autoAuth_token=localControl.getValue("autoAuth_token", "1234");
		autoAuth_token=getCookie("token");
		console.log("cookie autoAuth:"+autoAuth+" token:"+getCookie("token"));
		$("#autoAuthErrorConfirm").attr("href",'https://'+path+'/user/device.html?sn='+sn+'&token='+autoAuth_token);
		getJSON2('https://'+path+'/api/getkey?sn='+sn+'&token='+autoAuth_token, function(resp){
			accessKey=resp.data.pin;
			console.log("getkey:"+accessKey);
			doAuth(accessKey, successCallback, errorCallback);
		}, function (jqXHR, exception) {
                        console.log((jqXHR.status+exception));
			//$("#forAutoAuth .dialog-poppup-content").text("get key failed!"+"(GET Error:"+jqXHR.status+")");
			$("#forAutoAuth").show();
                });
	}else {
		doAuth(accessKey, successCallback, errorCallback);
	}
}




function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
function getPageName()
   {
     var strUrl=location.pathname;
     var arrUrl=strUrl.split("/");
     var strPage=arrUrl[arrUrl.length-1];
     return strPage;
   }


//转换空间大小格式
function renderSize(value){
    if(null==value||value==''){
        return "0 Bytes";
    }
    var unitArr = new Array("B","KB","MB","GB","TB","PB","EB","ZB","YB");
    var index=0;
    var srcsize = parseFloat(value);
    index=Math.floor(Math.log(srcsize)/Math.log(1024));
    var size =srcsize/Math.pow(1024,index);
    size=size.toFixed(2);//保留的小数位数
    return size+unitArr[index];
}
//时分秒转换
function transformTime(num) {
 	if(num<10){
 		num="0"+num;
 	}
 	return num;
 }
function formatTime(interval) {
	var hourTime,minuteTime,secondTime;
	secondTime = interval;
	if(secondTime >= 60){
		minuteTime = transformTime(parseInt(interval / 60));
		secondTime = transformTime(parseInt(interval % 60));
		if(minuteTime >= 60){
			hourTime = transformTime(parseInt(minuteTime / 60));
			minuteTime = transformTime(parseInt(minuteTime % 60));
			return Array(hourTime,minuteTime,secondTime);
		}else{
			return Array("00",minuteTime,secondTime);
		}
	}else{
		return Array("00","00",transformTime(secondTime));
	}
}
function secondtoHIS(duration, en)
{
	var dhms="";
	//if(parseInt(duration/86400)) dhms=parseInt(duration/86400)+"天";
	
	if(duration < 60){
		dhms=dhms+PrefixInteger(duration%60,2)+((en)?" Sec ":"秒");
	}else{
		if(dhms || parseInt(duration/3600)) dhms=dhms+PrefixInteger(parseInt(duration/3600),2)+((en)?" Hr ":"时");
		if(dhms || parseInt(duration%3600/60)) dhms=dhms+PrefixInteger(parseInt(duration%3600/60),2)+((en)?" Min ":"分");
		dhms=dhms+PrefixInteger(duration%60,2)+((en)?" Sec ":"秒");
	}
	
	return dhms;
}
//转换日期格式
function transTime(a, en){
	var year = a.getFullYear(),
	date = PrefixInteger(a.getDate(), 2),
	month = PrefixInteger(a.getMonth()+1, 2),
	hours = PrefixInteger(a.getHours(), 2),
	minutes = PrefixInteger(a.getMinutes(), 2),
	seconds = PrefixInteger(a.getSeconds(), 2);
	if(en) return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds; 
	else return year + "年" + month + "月" + date + "日 " + hours + ":" + minutes + ":" + seconds;
}
function transTimeyMDHIS(a){
	if(!a) a = new Date();
	var year = a.getFullYear()+"";
	year=year.substring(2);
	date = PrefixInteger(a.getDate(), 2),
	month = PrefixInteger(a.getMonth()+1, 2),
	hours = PrefixInteger(a.getHours(), 2),
	minutes = PrefixInteger(a.getMinutes(), 2),
	seconds = PrefixInteger(a.getSeconds(), 2);
	return year + "" + month + "" + date + "" + hours + "" + minutes + "" + seconds; 
}

function transTimeHIS(a, en){
	var hours = PrefixInteger(a.getHours(), 2),
	minutes = PrefixInteger(a.getMinutes(), 2),
	seconds = PrefixInteger(a.getSeconds(), 2);
	if(en) return hours + ":" + minutes + ":" + seconds;
	else return hours + "时" + minutes + "分" + seconds +"秒";
}
var monthsObj = {1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"June",7:"July",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"};
function transFullTime(timeobj,lan){
	var timeStr;
	if(lan=="zh" || !lan){
		timeStr=timeobj.toLocaleString();
	}else if(lan=="en"){
		var year = timeobj.getFullYear(),
			month = timeobj.getMonth()+1,
			day = timeobj.getDate(),
			hours = PrefixInteger(timeobj.getHours(),2),
			minutes = PrefixInteger(timeobj.getMinutes(),2),
			seconds = PrefixInteger(timeobj.getSeconds(),2);
		timeStr = monthsObj[month]+" "+day+","+year+" "+hours+":"+minutes+":"+seconds;
	}
	return timeStr;
}


/*浏览器认证*/
var browser_key_try_count=3;
function browser_key(){
    if(!app_type && browser_key_try_count>0){
	browser_key_try_count=0;
	if(language && language == "en"){
		var key=prompt("Please enter Authentication Code");
	}else{
		var key=prompt("请输入安全认证码");
	}
	
	localControl.putValue("KEY", key);
	location.reload();
	//location.href="index.html";
	
/*
	while(key && browser_key_try_count>0){
		doAuth(key, function(token){
		localControl.putValue("KEY", key);
			setAccessToken(token);
			alert("安全认证成功!");
			location.href="index.html";
			return;
		}, function(){
		});
		if(--browser_key_try_count>0) key=prompt("安全认证错误，请重新输入");
		else alert("安全认证错误，无法连接设备！");
	}
*/
    }
}

// var keepAliveTimer=setInterval(keepAlive, 15000);
var keepAliveTimer=setInterval(keepAlive, 10000);
var pageName=getPageName();

if(pageName!="keepalive.html") localControl.putValue("visibilityState", document.visibilityState); 
function keepAlive(){
	if(!app_type || 
	(pageName!="keepalive.html" && localControl.getValue("visibilityState", "visible")=="visible") ||
	(getPageName()=="keepalive.html" && playPage==1) ) { //普通浏览器以及没有切出的app需要keepalive, 播放页面转为后台keepalive
		getJSON("/ka", function(){}, function (jqXHR, exception) {
                	console.log((jqXHR.status+exception));
        	});
		if(netStatus==1) netTimer=setTimeout(function(){
			netTimer=null;
			netDisconnected();
		}, 3000);
	}
}
function resetKeepAlive(second){
	clearInterval(keepAliveTimer);
	keepAliveTimer=setInterval(keepAlive, second?(second*1000):15000);
}

function getPortrait(){//返回是否竖屏
	if (window.orientation === 180 || window.orientation === 0) return true;
	else return false
}

var playPage=0; //是否将进入播放页面

//记录切出切入状态
document.addEventListener("visibilitychange", function() {
	console.log("js html "+document.visibilityState);
	localControl.putValue("visibilityState", document.visibilityState);
	if(document.visibilityState=="visible") {
		positionFixed();
		keepAlive();
	}
	
});


 Date.prototype.toLocaleString = function() {
	return this.getFullYear()+"/"+transformTime(this.getMonth()+1)+"/"+transformTime(this.getDate())+' '+transformTime(this.getHours())+':'+transformTime(this.getMinutes())+':'+transformTime(this.getSeconds());
}

function isNewVersion(oldV, newV){
	var old1, old2, old3, new1, new2, new3;
	if(newV==null || oldV==newV) return false;
	oldV=oldV.slice(oldV.indexOf("-")+1);
	old1=parseInt(oldV);
	oldV=oldV.slice(oldV.indexOf(".")+1);
	old2=parseInt(oldV);
	oldV=oldV.slice(oldV.indexOf(".")+1);
	old3=parseInt(oldV);

	newV=newV.slice(newV.indexOf("-")+1);
	new1=parseInt(newV);
	newV=newV.slice(newV.indexOf(".")+1);
	new2=parseInt(newV);
	newV=newV.slice(newV.indexOf(".")+1);
	new3=parseInt(newV);
	console.log("oldVersion:"+old1+"."+old2+"."+old3+", newVersion:"+new1+"."+new2+"."+new3);
	if(old1==1 && old2==1 && new1==0) return true;
	if(new1>old1) return true;
	if(new1==old1 && new2>old2) return true;
	if(new1==old1 && new2==old2 && new3>old3) return true;
	return false;
}
var netTimer=null;
function netConnected()
{
	if(netStatus!=1) {
		keepAlive();
		resetKeepAlive();
	}

	if(netprompt_count>6){
		postwificonfig = null;
		clearInterval(wificoutInterval);
	}
	clearInterval(netprompt_interval);
	netprompt_count=0;
	netStatus=1;
	firstNetdisconnect=true;
	$(".disconnected").hide();
	// $("#netDisconnectedMsg").hide();
	$(".netprompt-cover").hide();
	if(orientationMode && orientationMode==1 && ($(".manualFocusPrompt").css("display")=="none" && $("#netprompt-cover").css("display")=="none" && $("#netprompt-cover2").css("display")=="none")){
		$(".landscapePrompt").holdShow();
	}else if(orientationMode && orientationMode==2 && ($(".manualFocusPrompt").css("display")=="none" && $("#netprompt-cover").css("display")=="none" && $("#netprompt-cover").css("display")=="none")){
		$(".portraitPrompt").holdShow();
	}
	if(netTimer) clearTimeout(netTimer);
	netTimer=null;
	clearTimeout(reDiscoverTimeout);
	forAppNetDisCnn = true;
}

function netDisconnected()
{
	if(inUpdatePage == true) return;
	if(firstNetdisconnect){
		netprompt_interval = setInterval(function (){
			netprompt_count+=1;
		},1000);
		firstNetdisconnect = false;
	}
	netStatus=0;
	if(netTimer==null) {
		netTimer=setTimeout(function(){
			netTimer=null;
			if(hideCTL==1) localControl.notify("LostConn");
			else {
				// $("#netDisconnectedMsg").show();
				// $("#netDisconnectedConfirm").on("click",function(){
				console.log("pagePath="+pagePath);
				if(pagePath.includes("setting_wlan.html")){
					if(postwificonfig){
						$("#netprompt-cover3").show();
						$("#netprompt-cover2,#netprompt-cover").hide();
					}else{
						if(netprompt_count<26){
							$("#netprompt-cover").show();
							$("#netprompt-cover2,#netprompt-cover3").hide();
						}else{
							$("#netprompt-cover2").show();
							$("#netprompt-cover3,#netprompt-cover").hide();
						}
					}
				}else{
					if(netprompt_count<26){
						$("#netprompt-cover").show();
						$("#netprompt-cover2,#netprompt-cover3").hide();
					}else{
						$("#netprompt-cover,#netprompt-cover3").hide();
						$("#netprompt-cover2").show();
					}
				}



				if(($(".landscapePrompt").css("display")=="block" || $(".portraitPrompt").css("display")=="block") && ($(".manualFocusPrompt").css("display")=="block" || $("#netprompt-cover").css("display")=="block" || $("#netprompt-cover2").css("display")=="block")){
					$(".landscapePrompt,.portraitPrompt").holdHide();
				}	
				$(".netPromptBack").on("click",function(){

					if(app_type && appVer>=2) {
						localControl.startPage("CameraManager");
						setTimeout(function(){
							localControl.notify("LostConn");
						},300);
					}else{
						localControl.startPage("DeviceListPage");
						localControl.startPage("CameraManager");
						setTimeout(function(){
							localControl.notify("LostConn");
						},300);
					}
					$("#netprompt-cover").hide();
					// $("#netDisconnectedMsg").hide();
				});
				
			}
		}, 6000);
	}
	//setTimeout(keepAlive, 2000);
	resetKeepAlive(2);
	$(".disconnected").show();
}

$(document).ajaxSuccess(function(){
	netConnected();
	console.log("AJAX 请求已成功完成");
});
$(document).ajaxError(function(e,xhr,opt){
	if(xhr.status==200) {
		netConnected();
		console.log("AJAX 请求"+opt.url+"已成功完成:"+inUpdatePage);
	}else if(xhr.status===0) {
		if(inUpdatePage == true) console.log("AJAX "+opt.url+" 超时, 但在升级页面，忽略");
		else {
			netDisconnected();
			if(forAppNetDisCnn){
				reDiscoverTimeout = setTimeout(function(){
					localControl.reDiscover("reDiscover");
					forAppNetDisCnn = false;
				},(inAP==0?5000:2000))
			}
			console.log("AJAX "+opt.url+" 超时");
		}
	} else {
		if(inUpdatePage == true) console.log("AJAX "+opt.url+" 超时, 但在升级页面，忽略");
		else {
			netConnected();
			console.log("AJAX 请求"+opt.url+"失败:"+xhr.status);
		}
	}
});

var showList;
function showCTL(showFlag){
	if(showFlag==0) {
		hideCTL=1;
		if(showList) {
			showList.hide();
			console.log(showList);
		}
	}else {
		hideCTL=0;
		if(showList) showList.show();
	}
}
$.fn.extend({
	holdShow: function() {
		showList=showList.not($(this)).add($(this));
		//alert(showList);
		// console.log(showList);
		// showList=showList.add($(this));
		if(!hideCTL) $(this).show();
		else $(this).hide();
	},
	holdHide: function() {
		showList=showList.not($(this));
		//console.log(showList);
		$(this).hide();
	},
	holdSlideDown: function(speed, easing, fn) {
		showList=showList.not($(this)).add($(this));
		if(!hideCTL) $(this).slideDown(speed, easing, fn);
		else $(this).hide();
	},
	holdSlideUp: function(speed, easing, fn) {
		showList=showList.not($(this));
		if(!hideCTL) $(this).slideUp(speed, easing, fn);
		else $(this).hide();
	},
	holdToggle: function(speed,easing,fn) {
		if(!hideCTL) $(this).toggle(speed, easing, fn);
		else $(this).hide();
	}
});

function isWebAlive(){
	localControl.keepAlive("alive");
}

//断网时转动的图标
document.write("<div class='disconnected'><img src='images/wait.gif'/></div>");
//断网时提示信息
// if(language && language=="en"){
// 	document.write("<div class=\"dialog-poppup\" id=\"netDisconnectedMsg\" style=\"display: none;\">\
// 						<div class=\"dialog-poppup-tit\">Connection failure</div>\
//                         <div class=\"dialog-poppup-content\">The EON is offline.  Please check if it is in sleep mode/shut down, or it is not connected to the same WiFi network.</div>\
//                         <div class=\"dialog-btns flex\">\
//                                 <a href=\"javascript:;\" id=\"netDisconnectedConfirm\">OK</a>\
//                         </div>\
//                 </div>");
// }else{
// 	document.write("<div class=\"dialog-poppup\" id=\"netDisconnectedMsg\" style=\"display: none;\">\
// 						<div class=\"dialog-poppup-tit\">连接失败</div>\
//                         <div class=\"dialog-poppup-content\">相机可能自动休眠或关机了<br>或网络连接失败</div>\
//                         <div class=\"dialog-btns flex\">\
//                                 <a href=\"javascript:;\" id=\"netDisconnectedConfirm\">确定</a>\
//                         </div>\
//                 </div>");
// }
/* 失去连接弹窗 */
if(language && language=="en"){
	document.write("<div class=\"netprompt-cover\" id='netprompt-cover'>\
			<div class=\"netPromptContent\">\
				<div class=\"netPromptImg\"><img src=\"images/netprompt.gif\" ></div>\
				<div class=\"netPromptText\">Connection Lost. Trying to reconnect...</div>\
				<div class=\"netPromptBack\">Cancel</div>\
			</div>\
			<div class=\"netPromptCheck\">Please check if the camera is off or in power saving mode.<br><a href=\"javascript:;\" id=\"checkCourse\">How to check？</a></div>\
		</div>\
		<div class=\"netprompt-cover\" id='netprompt-cover2'>\
			<div class=\"netPromptContent\">\
				<div class=\"netPromptImg\"><img src=\"images/offline.png\" ></div>\
				<div class=\"netPromptText\">Camera is offline<br>Make sure the camera is on and reconnect it</div>\
				<div class=\"netPromptBack\">OK</div>\
			</div>\
		</div>\
		<div class=\"netprompt-cover\" id='netprompt-cover3'>\
			<div class=\"netPromptContent\">\
				<div class=\"netPromptImg\"><img src=\"images/offline.png\" ></div>\
				<div class=\"netPromptText\">Camera is offline<br>Connection lost, please reconnect</div>\
				<div class=\"netPromptBack\">OK</div>\
			</div>\
		</div>")
}else{
	document.write("<div class=\"netprompt-cover\" id='netprompt-cover'>\
			<div class=\"netPromptContent\">\
				<div class=\"netPromptImg\"><img src=\"images/netprompt.gif\" ></div>\
				<div class=\"netPromptText\">已失去连接，正在重连...</div>\
				<div class=\"netPromptBack\">取消</div>\
			</div>\
			<div class=\"netPromptCheck\">请检查相机是否已关机或休眠<br><a href=\"javascript:;\" id=\"checkCourse\">怎么检查？</a></div>\
		</div>\
		<div class=\"netprompt-cover\" id='netprompt-cover2'>\
			<div class=\"netPromptContent\">\
				<div class=\"netPromptImg\"><img src=\"images/offline.png\" ></div>\
				<div class=\"netPromptText\">相机已离线<br>请确定相机启动后重新连接</div>\
				<div class=\"netPromptBack\">好的</div>\
			</div>\
		</div>\
		<div class=\"netprompt-cover\" id='netprompt-cover3'>\
			<div class=\"netPromptContent\">\
				<div class=\"netPromptImg\"><img src=\"images/offline.png\" ></div>\
				<div class=\"netPromptText\">相机已离线<br>连接WIFI时意外掉线了，请重新连接相机</div>\
				<div class=\"netPromptBack\">好的</div>\
			</div>\
		</div>")
}
	
//自动认证出错的提示框
        document.write("<div class=\"dialog-poppup\" id=\"forAutoAuth\" style=\"display: none;\"> \
			<div class=\"dialog-poppup-tit\">认证失败！</div>\
                        <div class=\"dialog-poppup-content\ id=\"AutoAuthMsg\">认证码可能登记错误。<br>请前往修正认证码。</div>\
                        <div class=\"dialog-btns flex\">\
				<a href=\"javascript:;\" id=\"autoAuthErrorCancel\">取消</a>\
                                <a href=\"\" id=\"autoAuthErrorConfirm\">前往</a>\
                        </div>\
                </div>")

//$("#autoAuthErrorConfirm").attr("href",'http://www.baidu.com');
$("#autoAuthErrorCancel").on("click",function(){
	$("#forAutoAuth").hide();
});

$("#checkCourse").on("click",function(){
	localControl.startPage("usage_learnmoreforconnfailed");
})
		

