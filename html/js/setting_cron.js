        function uploadDone(flag)
        {
                alert("uploadDone:"+flag);
        }
var language = getParameterByName("language");
var Modezh = '<div class="setting-cron-name fx1">模式选择</div><div class="setting-cron-select"><input type="text" id="cronMode_val"  readonly="readonly" value="普通"/><select id="cronMode"><option value="普通">普通</option><option value="按天循环">按天循环</option></select></div>'
var Modeen = '<div class="setting-cron-name fx1">Repetition</div><div class="setting-cron-select"><input type="text" id="cronMode_val"  readonly="readonly" value="Once"/><select id="cronMode"><option value="Once">Once</option><option value="Daily">Daily</option></select></div>'
var loopZh = '<div class="setting-cron-name fx1" lan="loopDays">循环天数</div><div class="setting-cron-select blue"><input type="text" id="loopMode_val" lan="loopModeV" readonly="readonly" value="不限" /><select id="loopMode"><option value="不限" lan="notLim">不限</option><option value="自定义" lan="custom">自定义</option></select></div>'
var loopEn = '<div class="setting-cron-name fx1" lan="loopDays">Days</div><div class="setting-cron-select blue"><input type="text" id="loopMode_val" lan="loopModeV" readonly="readonly" value="Infinite" /><select id="loopMode"><option value="Infinite" lan="notLim">Infinite</option><option value="Customized" lan="custom">Customized</option></select></div>'
var cronInterval = null;
var outPutMode = null;
var lenProTimeout = null;
var timezone_mode = null;
var cameraTimezone = null;
var timezone=-(new Date().getTimezoneOffset()/60);
var camStatus = null;//获取/cron的时候用
var cronByDayList = new Array();
var now = new Date();  //获取当前时间
    now = new Date(now.getTime()+60000-now.getTime()%60000);
		
$(function(){
	if(language && language=="en"){
		$("#modeSelect").html(Modeen);
		$("#loopDaySel").html(loopEn);
	}else{
		language="zh";
		$("#modeSelect").html(Modezh);
		$("#loopDaySel").html(loopZh);
	}
	var mode="common";
	var newVersion=1;
	var recordWait=0;
	var idle=1;
	var orientation = 0;
	
	getJSON("/setting", function(e, status){
		if("timezone_mode" in e)timezone_mode = e.timezone_mode;
		if("timezone" in e)cameraTimezone = parseInt(e.timezone);
		if(timezone_mode=="manual"){
			$(".camTime").show();
			now = new Date(now.getTime()-(-(new Date().getTimezoneOffset()/60)*3600*1000)+(parseInt(cameraTimezone)*3600*1000));
			console.log("now : === "+now)
			setInterval(function(){
				var currentTime = new Date((new Date().getTime()+(new Date().getTimezoneOffset()/60*3600000)+parseInt(cameraTimezone)*3600000));
				var transCurrentTime = transFullTime(currentTime,language=="en"?"en":"zh");
				// console.log(transCurrentTime);
				$(".camTimeContent").text((language=="en"?"Present Time: ":"当前时间： ")+transCurrentTime);
			},1000);
		}
		if("ap" in e){
			$("#dotestUpdate").nextAll("input:eq(0)").val(e.ap.apSSID);
			$("#dotestUpdate").nextAll("input:eq(1)").val(e.ap.apPassword);
		}
		outPutMode = e.timelapse_output;
	})	
	//开始定时计划
	function startRecording(s) {
		postJSON("/status",{force_time: new Date().toJSON(),timezone:-(new Date().getTimezoneOffset()/60)});
		//var recCtrl = { sessionId: sessionId, frameRate: 25, schedule: s, cron:1, starttime:transTimeyMDHIS() };
		// var recCtrl = { sessionId: sessionId, frameRate: 25, schedule: s, cron:1, timezone: -(new Date().getTimezoneOffset()/60) };
		if(s[1]=="Infinite"){
			var recCtrl = { sessionId: sessionId, frameRate: 25, schedule: s[0], cron:1, timezone: -(new Date().getTimezoneOffset()/60) };
		}else{
			var recCtrl = { sessionId: sessionId, frameRate: 25, schedule: s[0], endAt: s[1][1], cron:1, timezone: -(new Date().getTimezoneOffset()/60) };
		}
		
		// var recCtrl = { sessionId: sessionId, frameRate: 25, schedule: s, cron:1, timezone: 0 };
		if(imgArchive == "horizontal"){
			orientation = 0;
		}else if(imgArchive == "vertical"){
			orientation = 90;
		}
		recCtrl["orientation"] = orientation;
		if($("#cronMode_dummy").val()!="普通" && $("#cronMode_dummy").val()!="Once"){
			$(".file-split-type ul li").each(function(index){
				if($(this).hasClass("on")){
					recCtrl["cutmode"] = index;
					// recCtrl["cutmode"] = 0;
				}
			})
		}
			
		if(recordWait) recCtrl['wait'] = recordWait;
		// setTimeout(function(){
			postJSON("/timelapse" , recCtrl, function (data) {
				console.log("start recording OK");
			}, function (e, status) {
				console.log("start recording error " + status);
			}, "text");
		// },1000)
		
	}
	// hh:mm:ss -> hhmmss, delete timezone
	
	function genHMS(src){
		var zone=timezone;
		if(timezone_mode == "manual")zone = parseInt(cameraTimezone);
		var strs=src.split(":");
		var hh=parseInt(strs[0])-zone;
		//var hh=parseInt(strs[0]);
		if(hh>=24) hh-=24;
		if(hh<0) hh+=24;
		if(hh<10) hh="0"+hh;
		return hh+strs[1]+strs[2];
	}
	function calculateTime(end){
			var zone=timezone;
			if(timezone_mode == "manual")zone = parseInt(cameraTimezone);
			var day = end.getDate();
			var hours = end.getHours();
			var minutes = end.getMinutes();
			var seconds = end.getSeconds();
			hours = hours - zone;
			if(hours>24){
				hours = hours-24;
				end.setDate(day+1);
			}else if(hours<0){
				hours = hours + 24;
				end.setDate(day-1);
			}
			var year = end.getFullYear();
			var month = end.getMonth()+1;
			day = end.getDate();
			return [year.toString()+transformTime(month).toString()+transformTime(day).toString()+transformTime(hours).toString()+transformTime(minutes).toString()+transformTime(seconds).toString(),
					year.toString()+"-"+transformTime(month).toString()+"-"+transformTime(day).toString()+"T"+transformTime(hours).toString()+":"+transformTime(minutes).toString()+":"+transformTime(seconds).toString()+"Z"];
	}
	function getTime(fromdate){
		if(timezone_mode=="manual"){
			//alert(fromdate+" "+ new Date(fromdate.getTime()+(timezone-parseInt(cameraTimezone))*3600000));
			return fromdate.getTime()+(timezone-parseInt(cameraTimezone))*3600000;
		}else return fromdate.getTime();
	}
	//生成schdule字符串
	function genSchedule(configs){
		var s;
		var start;
		var end;
		var now=new Date();
		//是否关闭
		//if(configs["cronEnable"]==0){
			//return null;
		//}
		//alert(now);
		if(timezone_mode=="manual") {
			//now = new Date(now.getTime() - parseInt(cameraTimezone)*3600000 );
			//alert(timezone_mode+" "+(new Date()).getTime()+" "+now.getTime());
		}
		//普通模式
		if(configs["cronMode"]=="normal"){
			var interval=configs["normalTask"]["shootInterval"];
			start=new Date(Date.parse(configs["normalTask"]["startAt"].replace(/-/g,"/")));
			end=new Date(Date.parse(configs["normalTask"]["endAt"].replace(/-/g,"/")));
			if(timezone_mode=="manual"){
				start = new Date(start.getTime() - parseInt(cameraTimezone)*3600000);
				end = new Date(end.getTime() - parseInt(cameraTimezone)*3600000);
				now = new Date(now.getTime() - parseInt(cameraTimezone)*3600000 );
			}
			console.log("interval:"+interval+"\nnow:"+now+"\nstart:"+start+"\nend:"+end);
			var endTime = calculateTime(new Date(Date.parse(configs["normalTask"]["endAt"].replace(/-/g,"/"))));
			if(now.getTime()>=end.getTime() || start.getTime()>=end.getTime()) {
				console.log("now:"+now.getTime()+"\nstart:"+start.getTime()+"\nend:"+end.getTime())
				return null; //已经结束
			}
			else if(now.getTime()>=start.getTime() && now.getTime()<end.getTime()) { //立即开始
				var r=parseInt((end.getTime()-now.getTime())/1000/interval)+1;
				//var S=parseInt(Date.now()/1000);
				//var E=S+interval*r;
				if(interval=="0.5" || interval==1.5){
					// var s="D"+interval*1000+"r"+r;
					var s="D"+interval*1000+"r"+r+"E"+endTime[0];
				}else{
					// var s="d"+interval+"r"+r;
					var s="d"+interval+"r"+r+"E"+endTime[0];
				}
				// return s;
				// return [s,endTime];
			}
			else if(now.getTime()<start.getTime()) {//等待开始
				var r=parseInt((end.getTime()-start.getTime())/1000/interval)+1;
				recordWait=parseInt((start.getTime()-now.getTime())/1000);
				//var S=parseInt(Date.now()/1000)+recordWait;
				//var E=S+interval*r;
				if(interval=="0.5" || interval==1.5){
					// var s="d"+0+"s(D"+interval*1000+"r"+r+")r1";
					var s="d"+0+"s(D"+interval*1000+"r"+r+"E"+endTime[0]+")r1";
				}else{
					// var s="d"+0+"s(d"+interval+"r"+r+")r1";
					var s="d"+0+"s(d"+interval+"r"+r+"E"+endTime[0]+")r1";
				}
				// return s;
				// return [s,endTime];
			}
			
			return [s,endTime];
		}
		else { //按天模式
		//计算第一个周期
			var index=0;
			var length=configs["bydayTask"].length;
			var startindex=endindex=0;
			var wait;
			var firstWait=0; //第一次拍摄后的除不尽的多余时间
			var seqs=[];
			var seqsStart=[];//每段开始的时刻
			var seqsEnd=[];//每段结束的时刻
			var seqsWait=[]; //每段拍摄后的等待时间
			var remainWait=[]; //上次拍摄后除不尽的多余时间
			var last;
			var endTime = null;
			if(length<=0) return null;
			//修复日期+1的BUG
			//start=new Date(Date.parse(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+(now.getDate()+1)+" "+configs["bydayTask"][0]["startAt"]));
			start=new Date(Date.parse(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+(now.getDate())+" "+configs["bydayTask"][0]["startAt"]));
			start.setDate(start.getDate()+1);
			end=new Date(Date.parse(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+" "+configs["bydayTask"][length-1]["endAt"]));
			wait=parseInt((start-end)/1000);
			for(var i=1;i<=length;i++){
				start=new Date(Date.parse(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+" "+configs["bydayTask"][i-1]["startAt"]));
				end=new Date(Date.parse(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+" "+configs["bydayTask"][i-1]["endAt"]));
				var interval=configs["bydayTask"][i-1]["shootInterval"];
				var r=parseInt((getTime(end)-getTime(start))/1000/interval)+1;
				if(r==1) interval=parseInt(getTime(end)-getTime(start))/1000; //只拍一次的情况下，拍摄间隔为剩余的所有时间
				if(i!=1) {
					wait=parseInt((getTime(start)-getTime(last))/1000);
				}
				if(i==length){
					if(r==1) remainWait[0]=0;
					else remainWait[0]=parseInt((getTime(end)-getTime(start))/1000)-interval*((r-1)); //第一次时段前的休息时间需要加上最后一次时段除不尽的秒数
				}
				console.log(getTime(end)+" "+getTime(start)+" "+interval+" "+r);
				if(r==1) remainWait[i]=0;
				else remainWait[i]=parseInt((getTime(end)-getTime(start))/1000)-interval*((r-1));
				seqsWait[i-1]=wait;
				
				seqsStart[i-1]=genHMS(configs["bydayTask"][i-1]["startAt"]);
				seqsEnd[i-1]=genHMS(configs["bydayTask"][i-1]["endAt"]);
				if(interval=="0.5" || interval==1.5){
					seqs[i-1]="D"+interval*1000;
				}else{
					seqs[i-1]="d"+interval;
				}
				seqs[i-1]+="r"+((r==1)?2:r);
				if(seqsStart[i-1]<=seqsEnd[i-1]) seqs[i-1]+="S"+seqsStart[i-1]+"E"+seqsEnd[i-1]+"";
				
				last=end;
				if(now.getTime()<getTime(end)) { //找到当前结束的时段
					if(endindex==0)endindex=i;
				}
				if(now.getTime()>getTime(start)) { //找到当前开始的时段
					startindex=i;
				}
			}
			for(var i=0;i<length;i++){
				console.log("seqsWait="+seqsWait[i]+" remainWait="+remainWait[i]);
			}
			//计算最开始的等待时间
			if(startindex==0){ //比第一个时段开始时间还早
				start=new Date(Date.parse(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+" "+configs["bydayTask"][0]["startAt"]));
				wait=parseInt((getTime(start)-now.getTime())/1000);
				startindex=1; //从第一时段开始
			} else if(endindex==0) { //比最后一个时段结束时间还晚,就等待第二天的第一个时段
				start=new Date(Date.parse(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+(now.getDate())+" "+configs["bydayTask"][0]["startAt"]));
				start.setDate(start.getDate()+1);
				wait=parseInt((getTime(start)-now.getTime())/1000);
				startindex=1;
			} else if(startindex==endindex){ //已经开始，无需等待
				wait=0;
			} else { //中间时段等待
				start=new Date(Date.parse(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+" "+configs["bydayTask"][startindex]["startAt"]));
				wait=parseInt((getTime(start)-now.getTime())/1000);
				startindex++;
			}
			console.log(seqs);
			recordWait=0; //初始化等待时间
			if(wait==0){//马上开始拍摄
				//start=new Date(Date.parse(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+" "+configs["bydayTask"][startindex-1]["startAt"]));
				end=new Date(Date.parse(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+" "+configs["bydayTask"][startindex-1]["endAt"]));
				interval=configs["bydayTask"][startindex-1]["shootInterval"];
				var r=parseInt((getTime(end)-now.getTime())/1000/interval)+1;
				if(r==1) interval=parseInt((getTime(end)-now.getTime())/1000); //只拍一次的情况下，拍摄间隔为剩余的所有时间
				if(interval == "0.5" || interval==1.5){
					s="D"+interval*1000+"r"+((r==1)?2:r);
				}else{
					s="d"+interval+"r"+((r==1)?2:r);
				}
				//if(genHMS(configs["bydayTask"][startindex-1]["startAt"])<=genHMS(configs["bydayTask"][startindex-1]["endAt"]))
					//s+="S"+genHMS(configs["bydayTask"][startindex-1]["startAt"])+"E"+genHMS(configs["bydayTask"][startindex-1]["endAt"]); //立即拍摄情况去掉S和E
				
				if(r!=1) firstWait=parseInt((getTime(end)-now.getTime())/1000)-interval*(r-1);
				else firstWait=0;
				//alert(parseInt((end-now)/1000)+" "+interval*(r-1)+" "+firstWait);
			} else {
				recordWait=wait; //等待时间
				//s="d"+0+"s("+seqs[startindex-1].split('(')[1];
				s=seqs[startindex-1];
			}
			for(var i=startindex+1;i<=seqs.length;i++){
				if(i==startindex+1 && wait==0) s+=",w"+parseInt((seqsWait[i-1]+firstWait))+"T"+genHMS(configs["bydayTask"][i-1]["startAt"])+","+seqs[i-1];   //第二段时间
				else s+=",w"+parseInt(seqsWait[i-1])+"T"+genHMS(configs["bydayTask"][i-1]["startAt"])+","+seqs[i-1];
			}
			console.log("firstWait="+firstWait+" remainWait[0]="+remainWait[0]);
			//第一天的拍摄结束
			if(configs["bydayLoop"]!=1){ //未来天的拍摄
				//for(var i=startindex+1;i<=seqs.length;i++){
					//s+=","+seqs[i-1];
				//}
				if(s.indexOf(",")==-1 && wait==0) {
					if(firstWait>0 ) s+=",w"+parseInt(firstWait)+"T"+seqsEnd[seqs.length-1];
				}
				//else if(remainWait[0]>0) s+=",w"+parseInt(remainWait[0])+"T"+seqsEnd[seqs.length-1];
				s+=",d0S"+seqsEnd[seqs.length-1]+"s(";

				for(var i=0;i<seqs.length;i++){
					if(i>0) {
						s+=",w"+parseInt(seqsWait[i])+"T"+seqsStart[i]+","+seqs[i];
					}else s+="w"+parseInt((seqsWait[i]))+"T"+seqsStart[i]+","+seqs[i];

				}
				//if(remainWait[0]>0) s+=",w"+remainWait[0]+"T"+seqsEnd[seqs.length-1]; //在每天的最后补足第一时段休息的秒数
				s+=")";
				//按天模式-天数
				if(configs["bydayLoop"]!=0) s+="r"+(configs["bydayLoop"]-1);
			}
		}
		if(configs["bydayLoop"]==0){
			endTime = "Infinite";
		}else{

			var endT=new Date(Date.parse(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+" "+configs["bydayTask"][length-1]["endAt"]));
			if(configs["bydayLoop"]>1){
				endT.setDate(endT.getDate()+configs["bydayLoop"]-1);
			}
			endTime = calculateTime(endT);
			// endTime = endT.getFullYear().toString()+transformTime(endT.getMonth()+1).toString()+transformTime(endT.getDate()).toString()+transformTime(endT.getHours()).toString()+transformTime(endT.getMinutes()).toString()+transformTime(endT.getSeconds()).toString()
		}
		// return s;
		return [s,endTime];
	}
	//测试用
	$("#send").on("click", function(){
		if($("#schedule").val()) startRecording($("#schedule").val());
	});
	$("#dotestPut").on("click", function(){
		var k=$(this).nextAll("input:eq(0)").val();
		var v=$(this).nextAll("input:eq(1)").val();
		if(k) {
			localControl.putValue(k, v);
			$("#testAlert .dialog-poppup-content").text("已设置"+k+":"+v+",请用GET测试是否成功");
			$("#testAlert").show();
			// alert("已设置"+k+":"+v+",请用GET测试是否成功");
		}
	});
	$("#testConfirm").on("click",function(){
		$("#testAlert").hide();
	});
	$("#dotestGet").on("click", function(){
		var k=$(this).nextAll("input:eq(0)").val();
		if(k) {
			// alert("GET("+k+")返回："+localControl.getValue(k, null));
			$("#testAlert .dialog-poppup-content").text("GET("+k+")返回："+localControl.getValue(k, null));
			$("#testAlert").show();
		}
	});
	$("#dotestUpdate").on("click", function(){
		var v1=$(this).nextAll("input:eq(0)").val();
		var v2=$(this).nextAll("input:eq(1)").val();
		var v3=$(this).nextAll("input:eq(2)").val();
		if(v1 && v2 && v3) {
			localControl.updatePwd(v1, v2, v3);
			// alert("已设置SSID:"+v1+",PASSWORD:"+v2+",KEY:"+v3+",请用GET测试是否成功");
			$("#testAlert .dialog-poppup-content").text("已设置SSID:"+v1+",PASSWORD:"+v2+",KEY:"+v3+",请用GET测试是否成功");
			$("#testAlert").show();
		}
	});
	$("#dotestDel").on("click", function(){
		var v=$(this).nextAll("input:eq(0)").val();
		if(v) {
			localControl.deleteDevice(v);
			// alert("已设置删除设备:"+v+",请用检查是否成功");
			$("#testAlert .dialog-poppup-content").text("已设置删除设备:"+v+",请用检查是否成功");
			$("#testAlert").show();

		}
	});
	$("#dotestPage").on("click", function(){
		var v=$(this).nextAll("input:eq(0)").val();
		if(v) {
			// alert("即将跳转设备页面:"+v+",请检查是否跳转成功");
			$("#testAlert .dialog-poppup-content").text("即将跳转设备页面:"+v+",请检查是否跳转成功");
			$("#testAlert").show();
			localControl.startPage(v);
		}
	});
	$("#dotestWifi").on("click", function(){
		var k=$(this).nextAll("input:eq(0)").val();
		var v=$(this).nextAll("input:eq(1)").val();
		if(k && v) {
			//alert("手机即将连接wifi:"+k+"， 密码:"+v+"，请检查是否成功");
			localControl.connectWifi(k, v);
		}
	});
	$("#dotestUpFirmware").on("click", function(){
		localControl.upFirmware();
	});
	//测试用end

	//定时任务开关
	$("#cronTrigger").on("click",function(){
		$(this).attr('checked', !$(this).attr('checked'));	
		if($(this).attr('checked')) {
		}
	})


	//时间选择控件

		maxDate = new Date(now.getFullYear() + 50, now.getMonth(), now.getDate()),  //最大时间设置为两年后
		startTimeX = now,
		endTimeX = now,
		flag = 0;

		$("#endTime,#startTime").val(transTime(now,"en")); //设置默认时间为当前时间

	
	$("#endTime,#startTime").attr("ms", now.getTime());

/*
	var startTime = mobiscroll.datetime('#startTime', {  //开始时间
	    theme: 'ios',
	    lang: language=='en'?'en':'zh',
	    display: 'bottom',
	    min: now,
	    max: maxDate,
	    timeFormat: 'HH:ii ss',
	    monthNames: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
	    yearText: language=='en'?'Y':'年',
	    monthText : language=='en'?'M':'月', 
	    dayText : language=='en'?'D':'日',
	    hourText: language=='en'?'h':'时',
	    minuteText: language=='en'?'m':'分',
	    secText: language=='en'?'s':'秒',
	    showLabel: true,
	    dateFormat: 'yy-mm-dd',
	    onBeforeShow: function(event, inst) {	    	
			$(".mbsc-fr-w").removeClass("no");
	    },
	    onSet: function (event, inst) {
	    	startTimeX = inst.getVal();

	    		$("#startTime").val(transTime(startTimeX,language));

	    	
	    	$("#startTime").attr("ms", startTimeX.getTime());
	    	console.log(startTimeX);
	    	//if(flag==0){
	    		//return true;
	    	//}else{
	    	//}
	    },
	});

	var endTime = mobiscroll.datetime('#endTime', { //结束时间
	    theme: 'ios',
	    lang: language=='en'?'en':'zh',
	    display: 'bottom',
	    min: now,
	    max: maxDate,
	    timeFormat: 'HH:ii ss',
	    monthNames: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
	    yearText: language=='en'?'Y':'年',
	    monthText : language=='en'?'M':'月', 
	    dayText : language=='en'?'D':'日',
	    hourText: language=='en'?'h':'时',
	    minuteText: language=='en'?'m':'分',
	    secText: language=='en'?'s':'秒',
	    showLabel: true,
	    onBeforeShow: function(event, inst) {	    	
			$(".mbsc-fr-w").removeClass("no");
	    },
	    onSet: function (event, inst) {
	    	endTimeX = inst.getVal();

	    		$("#endTime").val(transTime(endTimeX,language));

	    	
	    	$("#endTime").attr("ms", endTimeX.getTime());
	    	console.log(endTimeX);
	    },
	});
*/
	//时段开始时间
	$("#bydayEndTime,#bydayStartTime").val(transTimeHIS(now, "en")); //设置默认时间为当前时间
	function genRolldate(objStr, format){
		var title;
		if(objStr.indexOf("tart") > 0){
			title=language=='en'?'Start Time':'开始时间';
		}else {
			title=language=='en'?'End Time':'结束时间';
		}

	   new Rolldate({
		el: '#'+objStr,
		format: format,
		beginYear: now.getFullYear(),
		endYear: now.getFullYear()+50,
		lang:language=='en'?{title:title,cancel:'Cancel',confirm:'Confirm',year:'&nbsp;',month:'&nbsp;',day:'&nbsp;',hour:'&nbsp;',min:'&nbsp;',sec:'&nbsp;'}:{title:title,year:'年',month:'月',day:'日',hour:'时',min:'分',sec:'秒'},
		init: function() {
			if(objStr.indexOf("byday") >= 0){
				document.getElementById(objStr).bindDate = 
				new Date(now.getFullYear()+'/'+(now.getMonth()+1)+'/'+now.getDate()+' '+$("#"+objStr).val());
			}
			else {
				var d=new Date($("#"+objStr).val().replace(/-/g, "/"));
				console.log("last:"+$("#"+objStr).val()+" "+d);
				console.log("now:"+now);
				if(d.getTime() < now.getTime()) d = now;   //旧时间比当前时间小，用当前时间代替
				document.getElementById(objStr).bindDate = d;
			}
		},
		confirm: function(){
			// $("#"+objStr).removeClass("red");
			$("#bydayStartTime,#bydayEndTime").removeClass("red");
		}
	   })
	}
	genRolldate("startTime", "YYYY-MM-DD hh:mm:ss");
	genRolldate("endTime", "YYYY-MM-DD hh:mm:ss");
	genRolldate("bydayStartTime", "hh:mm:ss");
	genRolldate("bydayEndTime", "hh:mm:ss");
/*
	var bydayStartTime = mobiscroll.time('#bydayStartTime', {  //开始时间
	    theme: 'ios',
	    lang: language=='en'?'en':'zh',
	    display: 'bottom',
	    timeFormat: 'HH:ii ss',
	    hourText: language=='en'?'h':'时',
	    minuteText: language=='en'?'m':'分',
	    secText: language=='en'?'s':'秒',
	    showLabel: true,
	    onSet: function (event, inst) {
	    	startTimeX = inst.getVal();
	    	console.log(startTimeX);
	    	//if(flag==0){
	    		//return true;
	    	//}else{
	    	//}
	    },
	    formatValue: function (data) {
		    return (data[0] <= 9 ? '0' : '') + data[0] + ':' + (data[1] <= 9 ? '0' : '') + data[1] + ':' + (data[2] <= 9 ? '0' : '') + data[2] + '';
		},
	});
*/
	//时段结束时间 
/*
	var bydayEndTime = mobiscroll.time('#bydayEndTime', { //结束时间
	    theme: 'ios',
	    lang: language=='en'?'en':'zh',
	    display: 'bottom',
	    timeFormat: 'HH:ii ss',
	    showLabel: true,
	    onSet: function (event, inst) {
	    	endTimeX = inst.getVal();
	    	console.log(endTimeX);
	    },
	    formatValue: function (data) {
		    return (data[0] <= 9 ? '0' : '') + data[0] + ':' + (data[1] <= 9 ? '0' : '') + data[1] + ':' + (data[2] <= 9 ? '0' : '') + data[2] + '';
		},
	});
*/

	$("#resetConfirm").on("click",function(){
		$(".dialog-cover,.dialog-poppup").hide();
		$("#"+flag).mobiscroll("show"); //出错误提示后让用户重新设置
	})

	function limitInterval(){
		var hourobj = $("#normal-interval-hour"),
			minuteobj = $("#normal-interval-minute"),
			secondobj = $("#normal-interval-second");
		if(parseInt(hourobj.val())==0 && parseInt(minuteobj.val())==0 && parseFloat(secondobj.val())<1) {
			secondobj.val("0.5");
		}
		if((parseInt(hourobj.val())!=0 || parseInt(minuteobj.val())!=0)){

			if(parseFloat(secondobj.val())==0.5){
				secondobj.val("0");
			}else if(parseFloat(secondobj.val())==1.5){
				secondobj.val("1")
			}

		}
	}
	//拍摄间隔时间数字限制
	$("#setLoopInterval .time-insert input").each(function(){
		$(this).on("change blur",function(){
			var v = $(this).val();
			if(v.toString().length<2){
				var w = (Array(2).join('0') + v).slice(-2);
				$(this).val(w);
			}
			limitInterval()
		}).on("keyup paste",function(){
			var v = $(this).val();
			if(v.length==1){
				this.value=v.replace(/[^0-9]/g,'')
			}else{
				this.value=v.replace(/\D/g,'')
			}
		}).on("keyup",function(){
			var v = $(this).val();
			if(v.toString().length>2){
				$(this).val(v.slice(0,2));
			}
		})
	})
	//拍摄间隔增减按钮
	$("#setLoopInterval .time-plus").each(function(){
		$(this).on("click",function(){
			var ipt = $(this).siblings(".time-insert").find("input");
			var val = parseInt(ipt.val())+1;
			if(ipt.hasClass("second")){
				if(parseInt($("#normal-interval-hour").val())!=0 || parseInt($("#normal-interval-minute").val())!=0){
					val = parseInt(ipt.val())+1;
				}else{
					if(parseFloat(ipt.val())<2){
						val = parseFloat(ipt.val())+0.5;
					}else{
						val = parseFloat(ipt.val())+1;
					}
				}
				
			}
			if($(".time-insert input.hour").val()==24){
				$(".time-insert input.second,.time-insert input.minute").val("00");
				return false;
			}
			if(ipt.hasClass("hour")){
				if(val==24){
					$(".time-insert input.second,.time-insert input.minute").val("00");
				}else if(val>24){
					return false;
				}
			}
			if(ipt.hasClass("second") || ipt.hasClass("minute")){
				if(val==60){
					return false;
				}
			}
			var x = PrefixInteger(val,2);
			ipt.val(x);
			limitInterval();
		})
	})
	$("#setLoopInterval .time-minus").on("click",function(){
		var ipt = $(this).siblings(".time-insert").find("input"),
			val = parseInt(ipt.val())-1;
		if(ipt.hasClass("second")){
			if(parseInt($("#normal-interval-hour").val())!=0 || parseInt($("#normal-interval-minute").val())!=0){
				val = parseInt(ipt.val())-1;
			}else{
				if(parseFloat(ipt.val())<=2 && parseFloat(ipt.val())>0){
					val = parseFloat(ipt.val())-0.5;
				}else if(parseFloat(ipt.val())>2){
					val = parseFloat(ipt.val())-1;
				}
			}
		}
		if(val<0){
			return false;
		}
		var x = PrefixInteger(val,2);
		ipt.val(x);
		limitInterval();
	})
	var dec_num=/^[0-9]+$/;
	$(".time-insert input.second,.time-insert input.minute").each(function(){
		$(this).on("change keyup",function(){
			var v = $(this).val();
			if($(this).val().length==0){
				return;
			}
			if(!dec_num.test(v)){
				if(isNaN(parseInt(v))){
					$(this).val("00");
				}else{
					$(this).val(parseInt(v));
				}
				return;
			}
			if(v>59){
				$(this).val(59);
			}
			if($(".time-insert input.hour").val()=="24"){
				$(this).val("00");
			}
		})
	})
	$(".time-insert input.hour").on("change keyup",function(){
		var v = $(this).val();
		if($(this).val().length==0){
			return;
		}
		if(!dec_num.test(v)){
			if(isNaN(parseInt(v))){
				$(this).val("00");
			}else{
				$(this).val(parseInt(v));
			}
			return;
		}
		if(v>24){
			$(this).val(24);
		}
		if($(this).val()=="24"){
			$(".time-insert input.second,.time-insert input.minute").val("00");
		}
	})
	$(".time-insert input.hour").blur(function(){
		if($(this).val().length==0){
			$(this).val("00");
		}
	})
	$(".time-insert input.minute").blur(function(){
		if($(this).val().length==0){
			$(this).val("00");
		}
	})
	$(".time-insert input.second").blur(function(){
		if($(this).val().length==0){
			if($(".time-insert input.hour").val()==0 && $(".time-insert input.minute").val()==0){
				$(this).val(0.5);
			}else{
				$(this).val("00");
			}
		}
	})
	//取消拍摄间隔设置
	$("#cancelInterval,#bydayCancelInterval").on("click",function(){
		$(".dialog-cover,#setLoopInterval,#bydaySetLoopInterval").hide();
	})
	//确认设置拍摄间隔
	$("#confirmInterval,#bydayConfirmInterval").on("click",function(){
		var intervalStr="#setLoopInterval";
		if(mode=="common") {
			var triggerStr="#intervalTrigger";
			$(".dialog-cover,#setLoopInterval").hide();
		}else {
			var triggerStr="#bydayIntervalTrigger";
			$(".dialog-cover,#setLoopInterval").hide();
		}
		var h = $(intervalStr).find(".hour").val(),
			m = $(intervalStr).find(".minute").val(),
			s = $(intervalStr).find(".second").val();
		s = s=="0"?"00":s;
		if(language && language=="en"){
			$(triggerStr).text(h+":"+m+":"+s);
		}else{
			if(h==0 && m==0){
				$(triggerStr).text(s+"秒");
			}else if(h==0 && m!=0){
				$(triggerStr).text(m+"分"+s+"秒");
			}else if(h!=0){
				$(triggerStr).text(h+"小时"+m+"分"+s+"秒");
			}
		}
		
		$(triggerStr).attr("second", parseInt(h)*3600+parseInt(m)*60+parseFloat(s));
		
	})
	//点击弹出拍摄间隔
	$("#intervalTrigger,#bydayIntervalTrigger").on("click",function(){
		$(".dialog-cover,#setLoopInterval").show();
		if(mode=="common") var s=$("#intervalTrigger").attr("second");
		else var s=$("#bydayIntervalTrigger").attr("second");
		$("#setLoopInterval .hour").val(PrefixInteger(parseInt(s/3600), 2));
		$("#setLoopInterval .minute").val(PrefixInteger(parseInt(s%3600/60), 2));
		$("#setLoopInterval .second").val(PrefixInteger(parseFloat(s%60), 2));
	})

	//模式选择按钮
	$("#cronMode_val").on("click",function(){
		$("#cronMode_dummy").click();
		$(".mbsc-fr-w").addClass("no");
	})
	var cronMode = mobiscroll.select('#cronMode', {  
	    theme: 'ios',
	    lang: language=='en'?'en':'zh',
	    display: 'bottom',
	    onChange: function(event, inst){
	    	var a = event.valueText;
	    	if(a=='普通' || a=="Once"){
				$(this).parent().removeClass("blue");
				$("#loopDays").hide();
				$("#loopNormal").show();
	    	}else{
				$(this).parent().addClass("blue");
				$("#loopDays").show();
				$("#loopNormal").hide();
	    	}
	    	inst.setVal(a);
	    	$("#cronMode_dummy,#cronMode_val").val(a);
	    	inst.hide();
	    	console.log(inst.getVal());
	    }
	});



	//循环天数控件
	$("#loopMode_val").on("click",function(){
		$("#loopMode_dummy").click();
		$(".mbsc-fr-w").addClass("no");
	})
	var loopDays = mobiscroll.select('#loopMode', {  
	    theme: 'ios',
	    lang: language=='en'?'en':'zh',
	    display: 'bottom',
	    onChange: function(event, inst){
	    	var a = event.valueText;
	    	if(a=='不限' || a=='Infinite'){
				$(this).parent().addClass("blue");
	    		$("#loopMode_dummy,#loopMode_val").val(a);
	    	}else{
				$(this).parent().addClass("blue");
				$(".dialog-cover,#setLoopDays").show();
	    	}
	    	inst.setVal(a);
	    	inst.hide();
	    	console.log(inst.getVal());
	    }
	});
	$("#loopMode").parent().addClass("blue");
	//取消天数设置按钮
	$("#cancelDays").on("click",function(){
		$(".dialog-cover,#setLoopDays").hide();
	})
	//确认设置天数
	$("#confirmDays").on("click",function(){
		var day = $("#day").val();
		$(".dialog-cover,#setLoopDays").hide();
		//$("#loopMode_dummy").val(day+"天");
		if(language && language=="en"){
			$("#loopMode_val").val(day);
		}else{
			$("#loopMode_val").val(day);
		}
		
	})
	$("#day").on("keyup paste",function(){
		var v = $(this).val();
		if(v.length==1){
			this.value=v.replace(/[^1-9]/g,'')
		}else{
			this.value=v.replace(/\D/g,'')
		}
	})
	//循环天数增减按钮
	$("#setLoopDays .time-plus").each(function(){
		$(this).on("click",function(){
			var ipt = $(this).siblings(".time-insert").find("input"),
				val = parseInt(ipt.val())+1;
			ipt.val(val);
		})
	})
	$("#setLoopDays .time-minus").on("click",function(){
		var ipt = $(this).siblings(".time-insert").find("input"),
			val = parseInt(ipt.val())-1;
		if(val<1){
			return false;
		}
		ipt.val(val);
	})



	//点击弹出预设场景列表
	$("#prefabTrigger,#bydayPrefabTrigger").on("click",function(){
		$(".dialog-cover,#prefabList").show();
		$("#prefabList .iconfont[mode-name="+$(this).attr("mode-name")+"]").parent().addClass("on").siblings().removeClass("on");
	})
	//选择场景
	$("#prefabList li").each(function(e){
		$(this).on("click",function(){
			$(this).addClass("on").siblings().removeClass("on");
		})
	})
	//点击确认选择场景
	$("#confirmPrefab").on("click",function(){
		if(mode=="common") var p=$("#prefabTrigger");
		else p=$("#bydayPrefabTrigger");
		var t = $("#prefabList li.on").find("p");
		p.text(t.text()).attr("mode-name", t.prev().attr("mode-name"));
		$(".dialog-cover,#prefabList").hide();
	})

	//点击弹出曝光补偿
	$("#exposureTrigger").on("click",function(){
		$(".dialog-cover,#exposureBias").show();
		$("#exp").slider("setValue", parseInt(($(this).text())));
		$("#exposureTrigger").text($(this).text());
		$("#arrow").text($(this).text());
	})
	//点击确认设置曝光补偿
	$("#confirmExposure").on("click",function(){
		$(".dialog-cover,#exposureBias").hide();
	})
	//曝光补偿控件
	var exp = $("#exp").slider({
		tooltip: 'always'
	});	
	setSliderEvent(exp,$("#exp"),$("#exposureTrigger"));
	$("#exposureSlider .tooltip-main").each(function(){
		var n = $(this).parent().siblings("input").attr("data-slider-default");		
		if(n>0){
			n = "+" + n;
		}
		$(this).append("<div class='tooltip-arrow1'></div><div class='tooltip-inner1' id='arrow'>"+n+"</div>");
		
	})

	//点击弹出曝光补偿
	$("#bydayExposureTrigger").on("click",function(){
		$(".dialog-cover,#bydayExposureBias").show();
		$("#bydayExp").slider("setValue", parseInt(($(this).text())));
		$("#bydayExposureTrigger").text($(this).text());
		$("#bydayArrow").text($(this).text());
	})
	//点击确认设置曝光补偿
	$("#bydayConfirmExposure").on("click",function(){
		$(".dialog-cover,#bydayExposureBias").hide();
	})
	//曝光补偿控件
	var bydayExp = $("#bydayExp").slider({
		tooltip: 'always'
	});	
	setSliderEvent(bydayExp,$("#bydayExp"),$("#bydayExposureTrigger"));
	$("#bydayExposureSlider .tooltip-main").each(function(){
		var n = $(this).parent().siblings("input").attr("data-slider-default");		
		if(n>0){
			n = "+" + n;
		}
		$(this).append("<div class='tooltip-arrow1'></div><div class='tooltip-inner1' id='bydayArrow'>"+n+"</div>");
	})


	//模式选择按钮
	var flagID;
	var flagUrl;
	$(".cron-time-enter").each(function(e){
		$(this).on("click",function(){
			var t = $(this),
				id = t.attr("id"),
				url = t.attr("data-url"),
				txt = t.text();
			t.addClass("on");
			editChoice.show();
			flagID = id;
			flagUrl = url;
		})
	})



	// var editChoice = mobiscroll.select('#editChoice', {  
	//     theme: 'ios',
	//     lang: 'zh',
	//     display: 'center',
	//     onChange: function(event, inst){
	//     	var a = event.valueText;
	//     	if(a=='编辑此时间段'){
	//     		window.location.href=flagUrl;
	//     	}else{
	//     		$("#"+flagID).parent().parent("tr").remove();
	//     	}
 //    		$("#"+flagID).removeClass("on");
	//     	inst.hide();
	//     },
	//     onCancel: function(event, inst){
	//     	$("#"+flagID).removeClass("on");
	//     },
	//     onSet: function(event, inst){
	//     	var a = event.valueText;
	//     	if(a=='编辑此时间段'){
	//     		window.location.href=flagUrl;
	//     	}else{
	//     		$("#"+flagID).parent().parent("tr").remove();
	//     	}
 //    		$("#"+flagID).removeClass("on");
	//     }
	// });
	
	//显示时间段,添加
	$("#addPeriod").on("click",function(){
		$(".iconfont.delete").hide();
		if($("#seqList tr").length==6){
			$("#lengthPrompt").show();
			clearTimeout(lengthPrompt);
			lenProTimeout = setTimeout(function(){
				$("#lengthPrompt").hide();
			},2000);
			return;
		}
		$(".cron-btns-del").hide();
		// $("#commonSetting").hide();
		$("#bydaySetting,.dialog-cover2").show();
		if(language && language=="en"){
			$(".iconfont.confirm").siblings("p").text("Add a time slot");
		}else{
			$(".iconfont.confirm").siblings("p").text("添加时段");
		}
		
		mode="period";
		//$("#bydayStartTime").val();
		//添加时
		if(language && language=="en"){
			$("#bydayPrefabTrigger").val("Auto").attr("mode-name", "auto");
		}else{
			$("#bydayPrefabTrigger").val("自动").attr("mode-name", "auto");
		}
		$("#bydayExposureTrigger").text("0");
		var lastPeriodEndTime=$("#seq"+($("#seqList tr").length)+" td:eq(2)").text();
		var LastPeriodStartTime=$("#seq"+($("#seqList tr").length)+" td:eq(1)").text();
		if(LastPeriodStartTime) {
		}
		if(lastPeriodEndTime){
			$("#bydayStartTime").val(lastPeriodEndTime);
			$("#bydayStartTime").mobiscroll("setVal", lastPeriodEndTime);
			$("#bydayEndTime").val(lastPeriodEndTime);
			$("#bydayEndTime").mobiscroll("setVal", lastPeriodEndTime);
		}
	})
	//关闭时间段
	// $(".iconfont.cancel").on("click",function(){
	// 	$("#bydaySetting,.dialog-cover.touch").hide();
	// 	mode="common";
	// })
	//删除时间段
	$(".iconfont.delete").on("click",function(){
		// $("#commonSetting").show();
		$("#bydayStartTime,#bydayEndTime").removeClass("red");
		$("#bydaySetting,.dialog-cover2").hide();
		mode="common";
		index=$("#bydaySetting p").attr("seq");
		$("#seqList tr").eq(index-1).remove();
		cronByDayList.splice(index-1,1);
		//列表重新排序
		var length=$("#seqList tr").length;
		for(var i=1;i<=length;i++){
			$("#seqList tr").eq(i-1).attr("id","seq"+i);
			if(language && language=="en"){
				$("#seqList .cron-time-enter").eq(i-1).attr("seq",i).text("Time Slot"+i);
			}else{
				$("#seqList .cron-time-enter").eq(i-1).attr("seq",i).text("时段"+i);
			}
			
		}	
	})

	function HMScmp(hms1, hms2)
	{
		var now=new Date();
		var t1=new Date(Date.parse(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+(now.getDate())+" "+hms1));
		var t2=new Date(Date.parse(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+(now.getDate())+" "+hms2));
		if(t1>t2) return 1;
		else if(t1<t2) return -1;
		else return 0;
	}
	//保存时段
	$(".cron-btns-confirm.peroid,.iconfont.confirm").on("click",function(){
		console.log($("#bydayStartTime").val()+" "+$("#bydayEndTime").val());
		if(HMScmp($("#bydayStartTime").val(), $("#bydayEndTime").val())>=0) {
			// if(language && language=="en"){
			// 	$("#setTimeWarning .warning").text("Start time must be earlier than the End time.");
			// }else{
			// 	$("#setTimeWarning .warning").text("结束时间不能早于开始时间");
			// }
			$("#bydayStartTime,#bydayEndTime").addClass("red");
			$("#setTimeWarning").show();
			// alert("结束时间不能早于开始时间");
			return;
		}
		if($(".iconfont.confirm").siblings("p").text()=="添加时段" || $(".iconfont.confirm").siblings("p").text()=="Add a time slot"){ //添加一个时段
			// var index=$("#seqList").children().size()+1;
			// var lastPeriodEndTime=$("#seq"+(index-1)+" td:eq(2)").text();
			// if(HMScmp($("#bydayStartTime").val(), lastPeriodEndTime)<=0){
			// 	if(language && language=="en"){
			// 		$("#setTimeWarning .warning").text("The beginning time must be later than the end time of the last Time Slot "+lastPeriodEndTime);
			// 	}else{
			// 		$("#setTimeWarning .warning").text("开始时间必须晚于上个时段的结束时间"+lastPeriodEndTime);
			// 	}
				
			// 	$("#setTimeWarning").show();
			// 	// alert("开始时间不能早于上个时段的结束时间"+lastPeriodEndTime);
			// 	return;
			// }
			if(checkTime($("#bydayStartTime").val(),$("#bydayEndTime").val(),"all") != true){
				// $("#setTimeWarning .warning").text(language=="en"?"Invalid Time.":"无效时间");
				$("#setTimeWarning").show();
				return;	
			}
			// else if(checkTime($("#bydayStartTime").val(),$("#bydayEndTime").val())=="endTime","all"){
			// 	// $("#setTimeWarning .warning").text("结束时间不能被包含于已存在的时间段内");
			// 	$("#bydayStartTime").removeClass("red");
			// 	$("#bydayEndTime").addClass("red");
			// 	$("#setTimeWarning").show();
			// 	return;	
			// }else if(checkTime($("#bydayStartTime").val(),$("#bydayEndTime").val())=="includes","all"){
			// 	// $("#setTimeWarning .warning").text("当前时间段包含已存在的时间段");
			// 	$("#bydayStartTime,#bydayEndTime").addClass("red");
			// 	$("#setTimeWarning").show();
			// 	return;
			// }
			$("#bydayStartTime,#bydayEndTime").removeClass("red");
			cronByDayList.push({
				startAt:$("#bydayStartTime").val(),
				endAt:$("#bydayEndTime").val(),
				interval:$("#bydayIntervalTrigger").attr("second")
			})
			
			
			// updateSeq(index, $("#bydayStartTime").val(), $("#bydayEndTime").val(), $("#bydayPrefabTrigger").text(), $("#bydayIntervalTrigger").attr("second"), $("#bydayExposureTrigger").text());
		} else { //修改时段
			var index=parseInt($(".iconfont.confirm").siblings("p").attr("seq"));
			// var lastPeriodEndTime=$("#seq"+(index-1)+" td:eq(2)").text();
			// var nextPeriodStartTime=$("#seq"+(index+1)+" td:eq(1)").text();
			// if(lastPeriodEndTime && HMScmp($("#bydayStartTime").val(), lastPeriodEndTime)<=0){
			// 	// if(language && language=="en"){
			// 	// 	$("#setTimeWarning .warning").text("The Start time must be later than The End Time of the last Time Slot "+lastPeriodEndTime);
			// 	// }else{
			// 	// 	$("#setTimeWarning .warning").text("开始时间必须晚于上个时段的结束时间"+lastPeriodEndTime);
			// 	// }
			// 	$("#bydayStartTime").addClass("red");
			// 	$("#bydayEndTime").removeClass("red");
			// 	$("#setTimeWarning").show();
			// 	// alert("开始时间不能早于上个时段的结束时间"+lastPeriodEndTime);
			// 	return;
			// }
			// if(nextPeriodStartTime && HMScmp($("#bydayEndTime").val(), nextPeriodStartTime)>=0){
			// 	// if(language && language=="en"){
			// 	// 	$("#setTimeWarning .warning").text("The End Time must be earlier than The Start Time of the next Time Slot "+nextPeriodStartTime);
			// 	// }else{
			// 	// 	$("#setTimeWarning .warning").text("结束时间必须早于下个时段的开始时间"+nextPeriodStartTime);
			// 	// }
			// 	$("#bydayStartTime").removeClass("red");
			// 	$("#bydayEndTime").addClass("red");
			// 	$("#setTimeWarning").show();
			// 	// alert("结束时间不能晚于下个时段的开始时间"+nextPeriodStartTime);
			// 	return;
			// }
			if(checkTime($("#bydayStartTime").val(),$("#bydayEndTime").val(),index-1) != true){
				$("#setTimeWarning").show();
				return;	
			}
			$("#bydayStartTime,#bydayEndTime").removeClass("red");
			cronByDayList[index-1].startAt = $("#bydayStartTime").val();
			cronByDayList[index-1].endAt = $("#bydayEndTime").val();
			cronByDayList[index-1].interval = $("#bydayIntervalTrigger").attr("second");
			// updateSeq(index, $("#bydayStartTime").val(), $("#bydayEndTime").val(), $("#bydayPrefabTrigger").text(), $("#bydayIntervalTrigger").attr("second"), $("#bydayExposureTrigger").text());
		
		}
		cronByDayList.sort(function(a,b){
			var newDate = new Date()
			var aa = new Date(newDate.getFullYear()+"/"+(newDate.getMonth()+1)+"/"+newDate.getDate()+" "+a.startAt).getTime();
			var bb = new Date(newDate.getFullYear()+"/"+(newDate.getMonth()+1)+"/"+newDate.getDate()+" "+b.startAt).getTime();
			return aa-bb;
		})
		$("#seqList").empty();
		cronByDayList.forEach(function(item,i){
			$("#seqList").append("<tr id='seq"+(i+1)+"'/>");
			updateSeq(i+1,item.startAt,item.endAt,null,item.interval,null);
		})
		// $("#commonSetting").show();
		$("#bydaySetting,.dialog-cover2").hide();
		mode="common";
	})
	function checkTime(startTime,endTime,index){
		for(var i=0;i<cronByDayList.length;i++){
			if(index!="all" && i==index){
				continue
			}
			if(startTime>=cronByDayList[i].startAt && startTime<=cronByDayList[i].endAt){
				$("#bydayStartTime").addClass("red");
				$("#bydayEndTime").removeClass("red");
				return "startTime";
			}
			if(endTime>=cronByDayList[i].startAt && endTime<=cronByDayList[i].endAt){
				$("#bydayStartTime").removeClass("red");
				$("#bydayEndTime").addClass("red");
				return "endTime";
			}
			if(startTime<cronByDayList[i].startAt && endTime>cronByDayList[i].endAt){
				$("#bydayStartTime,#bydayEndTime").addClass("red");
				return "includes";
			}
		}
		return true

	}
	//关闭保存结果提示
	$("#relsut-confirm").on("click", function(){
		if(language && language=="en"){
			location.href="index.html?language=en&cron=1";
		}else{
			location.href="index.html?language=zh&cron=1";
		}
		
		//$("#save-result").hide();
		//$(".dialog-cover").hide();
	})
	//生成要保存的数据
	function genConfigs(){
		var configs={};
		//configs["cronEnable"]=($("#cronTrigger").attr("checked")=="checked")?1:0;
		configs["cronMode"]=($("#cronMode_dummy").val()=="普通" || $("#cronMode_dummy").val()=="Once")?"normal":"byday";
		configs["normalTask"]={
			//startAt:transTime(new Date(parseInt($("#startTime").attr("ms"))), "en"),
			//endAt:transTime(new Date(parseInt($("#endTime").attr("ms"))), "en"),
			startAt:$("#startTime").val(),
			endAt:$("#endTime").val(),
			//recordMode:$("#prefabTrigger").attr("mode-name"),
			shootInterval:$("#intervalTrigger").attr("second"),
			//exposureBias:parseInt($("#exposureTrigger").text())
		};
		configs["bydayLoop"]=($("#loopMode").mobiscroll("getVal")=="不限" || $("#loopMode").mobiscroll("getVal")=="Infinite")?0:parseInt($("#day").val());
		configs["bydayTask"]= new Array();
		var length=$("#seqList tr").length;
		for(var i=1;i<=length;i++){
			configs["bydayTask"][i-1]={}
			configs["bydayTask"][i-1]["seq"]=i;
			var td=$("#seq"+i+" td:eq(1)"); //第二个td
			configs["bydayTask"][i-1]["startAt"]=td.text();
			td=td.next();
			configs["bydayTask"][i-1]["endAt"]=td.text();
			//td=td.next();
			//configs["bydayTask"][i-1]["recordMode"]=$(".mode-list p:contains('"+td.text()+"')").prev().attr("mode-name");
			td=td.next();
			configs["bydayTask"][i-1]["shootInterval"]=td.attr("second");
			//td=td.next();
			//configs["bydayTask"][i-1]["exposureBias"]=parseInt(td.text());
		}
		$(".file-split-type ul li").each(function(index){
			if($(this).hasClass("on")){
				configs["cutmode"] = index;
			}
		});
		var timeNow = new Date();
		if(timezone_mode=="manual"){
			timeNow = new Date(timeNow.getTime()+cameraTimezone*3600000-timezone*3600000);
		}
		configs["bydayTaskCommitTime"] = calculateTime(timeNow)[1];
		//console.log(configs);
		return configs;
	}
	//返回按钮
	$(".goback").on("click", function(){
		var configs=genConfigs();
		if(idle) postJSON("/cron", configs); //如果空闲，则保存
		if(language && language=="en"){
			location.href = "setting.html?language=en";
		}else{
			location.href = "setting.html?language=zh";
		}

	});
	//提交数据
	$(".cron-btns-confirm.post").on("click",function(){
		if(outPutMode == 0){
			saveCron();
		}else{
			$(".outPutCronPro,.dialog-cover").show();
		}
	});
	$(".outPutCronPro .cancel").on("click",function(){
		$(".outPutCronPro,.dialog-cover").hide();
	})
	$(".keepCurrent").on("click",function(){
		$(".outPutCronPro").hide();
		saveCron();
	})
	$(".notKeepCurrent").on("click",function(){
		$(".outPutCronPro,.dialog-cover").hide();
		postJSON("/setting",{timelapse_output:0},function(e,status){
			saveCron();
		},function(){
			if(language && language=="en"){
				$("#save-result .warning").text("Save failed!");
			}else{
				$("#save-result .warning").text("保存失败！");
			}
			
			$("#save-result,.dialog-cover").show();
		},"text");
	})
	function saveCron(){
		var configs=genConfigs();
		console.log(configs);
		if(configs["cronMode"]=="normal"){
			cronInterval=configs["normalTask"]["shootInterval"];
		}else{
			cronInterval=configs["bydayTask"][0]["shootInterval"];
		}
		localControl.putValue("cronInterval",cronInterval);
		var s=genSchedule(configs);
		if(s!=null )startRecording(s);
		else {
			// alert("无效的时间！");
			// return;
			$(".dialog-cover,#setTimeWarning").show();
			return

		}
		// setTimeout(function(){
			postJSON("/cron", configs, function(e, status){
			//return;
				$(".dialog-cover").show();
				if(language && language=="en"){
					$("#save-result .warning").text("Saved");
				}else{
					$("#save-result .warning").text("保存成功");
				}
				
				$("#save-result").show();
				if(e!="") viewCron(JSON.parse(e), status);
			}, function (jqXHR, exception) {
				$(".dialog-cover").show();
				if(language && language=="en"){
					$("#save-result .warning").text("Save failed!");
				}else{
					$("#save-result .warning").text("保存失败！");
				}
				
				$("#save-result").show();
				console.log((jqXHR.status+":"+exception));
			}, "text");
		// },1500)
	}
	//页面更新某个时段信息
	function updateSeq(index, startAt, endAt, recordMode, shootInterval, exposureBias){
		var seqtr="#seq"+index;
/*
		$(seqtr).html("<td class=\"bottom-line\"><a href=\"javascript:;\" class=\"cron-time-enter\" seq=\""+index+"\">时间段"+index+"</a></td>"
		+"<td>"+startAt+"</td>"
		+"<td>"+endAt+"</td>"
		+"<td>"+recordMode+"</td>"
		+"<td tdname=\"interval\" second=\""+shootInterval+"\">"+secondtoHIS(shootInterval)+"</td>"
		+"<td>"+exposureBias+"</td>"
		);
*/
		if(language && language=="en"){
			$(seqtr).html("<td class=\"bottom-line\"><a href=\"javascript:;\" class=\"cron-time-enter\" seq=\""+index+"\">Time Slot"+index+"</a></td>"
			+"<td>"+startAt+"</td>"
			+"<td>"+endAt+"</td>"
			+"<td tdname=\"interval\" second=\""+shootInterval+"\">"+secondtoHIS(shootInterval,language)+"</td>"
			);
		}else{
			$(seqtr).html("<td class=\"bottom-line\"><a href=\"javascript:;\" class=\"cron-time-enter\" seq=\""+index+"\">时间段"+index+"</a></td>"
			+"<td>"+startAt+"</td>"
			+"<td>"+endAt+"</td>"
			+"<td tdname=\"interval\" second=\""+shootInterval+"\">"+secondtoHIS(shootInterval)+"</td>"
			);
		}
		
		$(".cron-time-enter").on("click", function(){ //修改时间段窗口
			// $(".cron-btns-del").show();
			$(".iconfont.delete").show();
			var index=$(this).attr("seq");
			// $("#commonSetting").hide();
			$("#bydaySetting,.dialog-cover2").show();
			if(language && language=="en"){
				$(".iconfont.confirm").siblings("p").text("Modify Time Slot"+index).attr("seq", index);
			}else{
				$(".iconfont.confirm").siblings("p").text("修改时段"+index).attr("seq", index);
			}
			
			mode="period";
			//载入选中的时间段信息
			var td=$(this).parent().next();
			$("#bydayStartTime").val(td.text());
			$("#bydayStartTime").mobiscroll("setVal", td.text());
			td=td.next();
			$("#bydayEndTime").val(td.text());
			$("#bydayEndTime").mobiscroll("setVal", td.text());
			//td=td.next();
			//$("#bydayPrefabTrigger").text(td.text()).attr("mode-name", $(".mode-list p:contains('"+td.text()+"')").prev().attr("mode-name"));
			td=td.next();
			$("#bydayIntervalTrigger").text(td.text()).attr("second", td.attr("second"));
			//td=td.next();
			//$("#bydayExposureTrigger").text(td.text());
		})
	}
	//更新页面数据
	function viewCron(e, status){
		console.log(e);
		if(e.cronEnable==1) {
			$("#cronTrigger").attr("checked", true);
		}
		else {
			$("#cronTrigger").attr("checked", false);
		}
		if("cutmode" in e){
			$(".file-split-type ul li").each(function(index){
				if(e.cutmode == index){
					$(this).addClass("on").siblings().removeClass("on");
					$("#file-split-name").val($(this).find("i").text());
					
				}
			})
		}else{
			$(".file-split-type ul li").eq(0).addClass("on").siblings().removeClass("on");
			$("#file-split-name").val($(".file-split-type ul li").eq(0).find("i").text());
		}
		if(e.cronMode=="byday"){
			if(language && language=="en"){
				$("#cronMode_dummy,#cronMode_val").val("Daily");
			}else{
				$("#cronMode_dummy,#cronMode_val").val("按天循环");
			}
			
			$("#cronMode_val").parent().addClass("blue");
			if(language && language=="en"){
				cronMode.setVal("Daily", true, false);
			}else{
				cronMode.setVal("按天循环", true, false);
			}
			if("bydayTaskCommitTime" in e){
				var commitTime = new Date(e.bydayTaskCommitTime);
				if(timezone_mode=="manual"){
					commitTime = new Date(commitTime.getTime()+cameraTimezone*3600000-timezone*3600000);
				}
				
				console.log("bydayTaskCommitTime::::::"+e.bydayTaskCommitTime,commitTime);
				var text1 = language=="en"?"The task started at ":"定时任务启动于 ";
				var text2 = transFullTime(commitTime,language);
				$(".cronStartAt").text(text1+text2);
				if(camStatus=="waiting" || camStatus=="cronRunning"){
					$(".cronStartAt").show();
				}
			}
				
			$("#loopDays").show();
			$("#loopNormal").hide();
		}
		else {
			if(language && language=="en"){
				$("#cronMode_dummy,#cronMode_val").val("Once");
			}else{
				$("#cronMode_dummy,#cronMode_val").val("普通");
			}
			if(language && language=="en"){
				cronMode.setVal("Once", true, false);
			}else{
				cronMode.setVal("普通", true, false);
			}
			
			$("#cronMode_val").parent().removeClass("blue");
			$("#loopDays").hide();
			$("#loopNormal").show();
		}
		//普通模式的开始时间
		if(e.normalTask.startAt) {
			var startDate= new Date(Date.parse(e.normalTask.startAt.replace(/-/g,"/"))); //e.normalTask.startAt);
			if(isNaN(startDate.getTime())){
				console.log("start:"+e.normalTask.startAt+startDate);
			}else {
				$("#startTime").val(transTime(startDate,"en"));
				$("#startTime").attr("ms", startDate.getTime());
				$("#startTime").mobiscroll("setVal", startDate);
			}
		}
		//普通模式的结束时间
		if(e.normalTask.endAt){
			//var endDate= new Date(e.normalTask.endAt);
			var endDate= new Date(Date.parse(e.normalTask.endAt.replace(/-/g,"/")));
			if(isNaN(endDate.getTime())){
				console.log("end:"+e.normalTask.endAt+startDate);
			}else {
				$("#endTime").val(transTime(endDate,"en"));
				$("#endTime").attr("ms", endDate.getTime());
				$("#endTime").mobiscroll("setVal", endDate);
			}
		}
		//普通模式的拍摄间隔
		if(e.normalTask.shootInterval){
			var s=e.normalTask.shootInterval;
			if(language && language=="en"){
				$("#intervalTrigger").text(secondtoHIS(s,language)).attr("second", s);
			}else{
				$("#intervalTrigger").text(secondtoHIS(s)).attr("second", s);
			}
			
			$("#setLoopInterval .hour").val(PrefixInteger(parseInt(s/3600), 2));
			$("#setLoopInterval .minute").val(PrefixInteger(parseInt(s%3600/60), 2));
			$("#setLoopInterval .second").val(PrefixInteger(parseInt(s%3600), 2));
		}
/*
		//普通模式的曝光度
		if(e.normalTask.exposureBias){
			$("#exp").slider("setValue", e.normalTask.exposureBias);
			if(e.normalTask.exposureBias>0) e.normalTask.exposureBias="+"+e.normalTask.exposureBias
			$("#exposureTrigger").text(e.normalTask.exposureBias);
			$(".tooltip-inner1").text(e.normalTask.exposureBias);
		}
		//普通模式的场景
		if(e.normalTask.recordMode){
			$("#prefabList .iconfont[mode-name="+e.normalTask.recordMode+"]").parent().addClass("on").siblings().removeClass("on");
			$("#prefabTrigger").text($("#prefabList .iconfont[mode-name="+e.normalTask.recordMode+"]").next().text());
			$("#prefabTrigger").attr("mode-name", e.normalTask.recordMode);
		}
*/
		//按天循环的天数
		if(e.bydayLoop) {
			if(e.bydayLoop==0) { //不限天数
				$("#loopMode_val").parent().addClass("blue");
				if(language && language=="en"){
					$("#loopMode_dummy,#loopMode_val").val("Infinite");
					$("#loopMode").mobiscroll("setVal", "Infinite");
				}else{
					$("#loopMode_dummy,#loopMode_val").val("不限");
					$("#loopMode").mobiscroll("setVal", "不限");
				}
				
			}
			else {
				//alert(e.bydayLoop);
				
				$("#loopMode_val").parent().addClass("blue");
				$("#day").val(e.bydayLoop);
				if(language && language=="en"){
					$("#loopMode_dummy,#loopMode_val").val(e.bydayLoop);
					$("#loopMode").mobiscroll("setVal", "Customized");
				}else{
					$("#loopMode_dummy,#loopMode_val").val(e.bydayLoop);
					$("#loopMode").mobiscroll("setVal", "自定义");
				}
				
			}
		}
		//时段列表
		if(e.bydayTask){
			$("#seqList").empty();
			var index;
			$.each(e.bydayTask, function(i, task){
				var recordMode=$("#prefabList .iconfont[mode-name="+e.normalTask.recordMode+"]").next().text();
				if(task.exposureBias>0) task.exposureBias="+"+task.exposureBias;
				index=i+1;
				$("#seqList").append("<tr id='seq"+index+"'/>");
				cronByDayList[i] = {
					startAt:task.startAt,
					endAt:task.endAt,
					interval:task.shootInterval
				}
				updateSeq(index, task.startAt, task.endAt, recordMode, task.shootInterval, task.exposureBias);
			});
		}
	}
	

	
	
	function getSessionId() {
		var d = new Date();
		return (d.getTime() & 0x7fffffff);
	}

	getJSON("/status", function(e, status){
		imgArchive = e.imgArchive;
		if("sessionId" in e) sessionId=e.sessionId;
		if(sessionId===0) sessionId=getSessionId();
		sessionType=e.sessionType;
		if("recordinfo" in e) {
			camStatus = e.recordinfo.status;
			if(e.recordinfo.status == "recording" || e.recordinfo.status == "pausing"){
				$(".post").addClass("shooting-now");
				if(language=="en" && app_type){
					$(".cronPrompt").css("text-align","left");
				}
				$(".cronPrompt").show();
				idle=0;
			}else if(e.recordinfo.status == "waiting" || e.recordinfo.status == "cronRunning"){
				$(".post").addClass("shooting-now");
				$(".cronPrompt").text(language=="en"?"Unable to set scheduled task when there is an active task in progress.":"已存在定时任务，无法变更此设置")
				if(language=="en" && app_type){
					$(".cronPrompt").css("text-align","left");
				}
				$(".cronPrompt").show()
				idle=0;
			}else if(e.recordinfo.status == "idle"){
				if(sessionType!="timelapse" && sessionType != null){
					if(language && language=="en" && app_type){
						$(".cronPrompt2").css("text-align","left");
					}
					$(".cronPrompt2").show();
				}
			}
	        /*if(e.recordinfo.status != "idle") {
				$(".post").addClass("shooting-now");
				$(".cronPrompt").show();
				idle=0;
			}else{
				if(sessionType!="timelapse"){
					$(".cronPrompt2").show();
				}
			}*/
			//读取服务端数据
			getJSON("/cron", function(e, status){
				viewCron(e, status);
			}, function (jqXHR, exception) {
				$(".file-split-type ul li").eq(0).addClass("on").siblings().removeClass("on");
				$("#file-split-name").val($(".file-split-type ul li").eq(0).find("i").text());
		        	console.log((jqXHR.status+":"+exception));
			});
		}
	});

	$("#file-split-name").on("click",function(){
		$(".file-split-type,.dialog-cover").show();
		$(".dialog-cover").addClass("tp");
	});
	$("body").on("click",".dialog-cover.tp",function(){
		$(".file-split-type,.dialog-cover").hide();
		$(".dialog-cover").removeClass("tp");
	})
	$(".file-split-type ul li").each(function(index){
		$(this).on("click",function(){
			$(this).addClass("on").siblings().removeClass("on");
			$("#file-split-name").val($(this).find("i").text());
			$(".file-split-type,.dialog-cover").hide();
		})
	})
	$(".dialog-cover2").on("click",function(){
		$("#bydaySetting,.dialog-cover2").hide();
		$("#bydayStartTime,#bydayEndTime").removeClass("red");
		mode="common";
	})
})

