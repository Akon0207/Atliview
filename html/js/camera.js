  var block_size = 64;
  var focusArea = [];
  var focusEventSource = null;
  var hideFocus=false;
  var startFocusTimer=null;
  var clearAreaTimer=null;
  var enableFocus=localControl.getValue("enableFocus", 0);
  var focusCMD=null;
  var imgEnableClick=true;
  var detectFlag=null,cancelFocusFlag=true;
  var exposureBiasValue=null;
  var moveFlag = null;
  var meteringLock = null;
  var pointOneX,pointOneY,pointTwoX,pointTwoY,distanceX,distanceY,height1,height2;
  function drawFocusArea(area) {
    var levelcolor = ["red", "red", "red", "red", "red", "yellow", "green", "lightgreen", "lightgreen", "lightgreen", "lightgreen"];
    var focusDivs = document.getElementsByClassName("focus-area");
    var previewImg = document.getElementById("preview");
    var hscale = previewImg.width/previewImg.naturalWidth;
    var vscale = previewImg.height/previewImg.naturalHeight;
    var offsetTop=$("#preview").offset().top, offsetLeft=$("#preview").offset().left;
    var imgWidth = $("#preview").width(),imgHeight = $("#preview").height(),maxLeft;
    var offsetValue = ($("section.main").width()-imgHeight)/2;
      if(area.length==1) {
        // focusDivs[0].style.border = "1px solid " + levelcolor[Math.floor(area[0].level*10)];
        focusDivs[0].style.border = "1px solid #ffff00";
        focusDivs[0].style.display = 'block';
        if((window.matchMedia("(orientation: portrait)").matches && !orientationMode)){ //竖屏+竖屏拍摄，改变坐标
          $(".focus-area:eq(0)").css({
            top:area[0]=="center"?"50%":Math.floor(area[0].left*vscale) + offsetTop, 
            left:area[0]=="center"?"50%":Math.floor(previewImg.height - area[0].top*hscale - area[0].height*vscale) + offsetLeft,
            width:area[0]=="center"?Math.floor(block_size * 3 * vscale):Math.floor(area[0].height * vscale),
            height:area[0]=="center"?Math.floor(block_size * 3 * hscale):Math.floor(area[0].width * hscale)
          });
          //console.log(offsetTop+" "+offsetLeft+" "+(Math.floor(area[i].top*hscale) + offsetTop));
           maxLeft = (offsetLeft+imgHeight)-($(".focus-area:eq(0)").width()+$(".sun-container").width()+10);
        }else if((!window.matchMedia("(orientation: portrait)").matches && !orientationMode) || (window.matchMedia("(orientation: portrait)").matches && orientationMode==1)){ //横屏+横屏拍摄
          $(".focus-area:eq(0)").css({
            top:area[0]=="center"?"50%":Math.floor(area[0].top*hscale) + offsetTop, 
            left:area[0]=="center"?"50%":Math.floor(offsetLeft+area[0].left)*vscale-offsetLeft*hscale,
            width:area[0]=="center"?Math.floor(block_size * 3 * hscale):Math.floor(area[0].width * hscale),
            height:area[0]=="center"?Math.floor(block_size * 3 * vscale):Math.floor(area[0].height * vscale)
          });
          //console.log(offsetTop+" "+offsetLeft+" "+Math.floor(offsetLeft+area[i].left)*vscale);
          maxLeft = (offsetLeft+imgWidth)-($(".focus-area:eq(0)").width()+$(".sun-container").width()+10);
        }else if(!window.matchMedia("(orientation: portrait)").matches && orientationMode==2){
          $(".focus-area:eq(0)").css({
            top:area[0]=="center"?"50%":Math.floor(area[0].left*vscale) + offsetTop, 
            // left:area[0]=="center"?"50%":Math.floor(previewImg.height - area[0].top*hscale - area[0].height*vscale) + offsetLeft - offsetValue,
            left:area[0]=="center"?"50%":Math.floor(previewImg.height - area[0].top*hscale - area[0].height*vscale) + offsetValue,
            width:area[0]=="center"?Math.floor(block_size * 3 * vscale):Math.floor(area[0].height * vscale),
            height:area[0]=="center"?Math.floor(block_size * 3 * hscale):Math.floor(area[0].width * hscale)
          });
          //console.log(offsetTop+" "+offsetLeft+" "+(Math.floor(area[i].top*hscale) + offsetTop));
           maxLeft = (offsetLeft+imgHeight)-($(".focus-area:eq(0)").width()+$(".sun-container").width()+10);
        }
        if(area[0]=="center"){
          $(".focus-area:eq(0)").css({
            "-webkit-transform": "translate(-50%,-50%)",
            "-ms-transform": "translate(-50%,-50%)",
            "-o-transform": "translate(-50%,-50%)",
            "transform": "translate(-50%,-50%)",
          })
        }
        $(".sun-container").show();
        $(".exposureBiasShow").show();
        if($(".focus-area:eq(0)").offset().left>maxLeft){
          $(".sun-container").offset({
            left:$(".focus-area:eq(0)").offset().left-35,
            top:$(".focus-area:eq(0)").offset().top+$(".focus-area:eq(0)").height()/2-$(".sun-container").height()/2
          })
        }else{
          $(".sun-container").offset({
            left:$(".focus-area:eq(0)").offset().left+$(".focus-area:eq(0)").width()+10,
            top:$(".focus-area:eq(0)").offset().top+$(".focus-area:eq(0)").height()/2-$(".sun-container").height()/2
          })
        }
        $(".exposureBiasShow").offset({
          left:$(".focus-area:eq(0)").offset().left+$(".focus-area:eq(0)").width()/2-$(".exposureBiasShow").width()/2,
          top:$(".focus-area:eq(0)").offset().top-$(".exposureBiasShow").height()
        })
        // focusCMD = "enable,"+"x:"+area[0].left+",y:"+area[0].top+",w:"+area[0].width+",h:"+area[0].height;暂时注释，这是发给app的辅助对焦框开关指令
        // console.log(focusCMD);
      }else {
        focusDivs[0].style.display = 'none';
        /*暂时关闭app对焦辅助功能
        if(focusCMD){
          localControl.focus(focusCMD);
          console.log("--------------start App focus----------------");
          focusCMD=null;
        }*/
        $(".sun-container").hide();
        $(".exposureBiasShow").hide();
      }
	//console.log("previewImg.width:"+previewImg.width+" "+previewImg.height+" "+previewImg.naturalWidth+" "+previewImg.naturalHeight+" "+offsetTop+" "+offsetLeft+" "+previewImg.offsetTop+" "+previewImg.offsetLeft);
 //    for(var i=0; i<focusDivs.length; i++){
 //      if(i < area.length) {
 //        focusDivs[i].style.border = "1px solid " + levelcolor[Math.floor(area[i].level*10)];
 //        focusDivs[i].style.display = 'block';
 //      	if(window.matchMedia("(orientation: portrait)").matches){ //竖屏，改变坐标
 //      		$(".focus-area:eq("+i+")").css({
 //      			top:Math.floor(area[i].left*vscale) + offsetTop, 
 //      			left:Math.floor(previewImg.height - area[i].top*hscale - area[i].height*vscale) + offsetLeft,
 //      			width:Math.floor(area[i].height * vscale),
 //      			height:Math.floor(area[i].width * hscale)
 //      		});
 //      		//console.log(offsetTop+" "+offsetLeft+" "+(Math.floor(area[i].top*hscale) + offsetTop));
 //      	   maxLeft = (offsetLeft+imgHeight)-($(".focus-area:eq("+i+")").width()+$(".sun-container").width()+10);
 //      	}else { //横屏
 //      		$(".focus-area:eq("+i+")").css({
 //      			top:Math.floor(area[i].top*hscale) + offsetTop, 
 //      			left:Math.floor(offsetLeft+area[i].left)*vscale-offsetLeft*hscale,
 //      			width:Math.floor(area[i].width * hscale),
 //      			height:Math.floor(area[i].height * vscale)
 //      		});
 //      		//console.log(offsetTop+" "+offsetLeft+" "+Math.floor(offsetLeft+area[i].left)*vscale);
 //          maxLeft = (offsetLeft+imgWidth)-($(".focus-area:eq("+i+")").width()+$(".sun-container").width()+10);
 //      	}
 //        // $(".sun-container").show();
 //        if($(".focus-area:eq("+i+")").offset().left>maxLeft){
 //          $(".sun-container").offset({
 //            left:$(".focus-area:eq("+i+")").offset().left-35,
 //            top:$(".focus-area:eq("+i+")").offset().top+$(".focus-area:eq("+i+")").height()/2-$(".sun-container").height()/2
 //          })
 //        }else{
 //          $(".sun-container").offset({
 //            left:$(".focus-area:eq("+i+")").offset().left+$(".focus-area:eq("+i+")").width()+10,
 //            top:$(".focus-area:eq("+i+")").offset().top+$(".focus-area:eq("+i+")").height()/2-$(".sun-container").height()/2
 //          })
 //        }
        
 //        var focusEnable = "enable,"+"x:"+area[i].left+",y:"+area[i].top+",w:"+area[i].width+",h:"+area[i].height;
 //        console.log(focusEnable);
 //        localControl.focus(focusEnable);
 //        console.log("display block======================");
	// //console.log(focusDivs[i]);
 //      }
 //      else {
 //        focusDivs[i].style.display = 'none';
 //        console.log("display none======================");
 //        // $(".sun-container").hide();
 //      }
 //    }

  }
function focusTimeout(){
    clearAreaTimer=setTimeout(function(){
      focusArea = [];
      drawFocusArea(focusArea);
    },3000);    
}
$(function(){
  console.log("preview click before");
  $('#preview').on("click", function(e) {
    var trackHeight1 = $(".track1").height();
    var trackHeight2 = $(".track2").height();
    localControl.focus("disabled");
    console.log("canvas click " + e.offsetX + ", " + e.offsetY);
    console.log("orientationMode is "+orientationMode+"++++++++++++++++++++++");
    if(hideFocus) return;
    if(!imgEnableClick) {
      imgEnableClick=true;
      return
    }
    if($(".shootModeList").css("display")=="block" || $(".all-modelist").css("display")=="block" || $(".moreMask").css("display")=="block" || $(".setting-content").css("display")=="block") return;
    if($(".parameter-gian .slider-manual").hasClass("on") && !$(".parameter-exprosure .swiper-slide").eq(0).hasClass("on")){return;}
    if(orientationMode){
      $(".sun-container").css("height","115px");
      if(trackHeight1+trackHeight2>80){
        $(".track1").css("height",String(trackHeight1/2)+"px");
        $(".track2").css("height",String(trackHeight2/2)+"px");
      }
      $(".locked,.unlocked").css({
        "width":"22px",
        "height":"22px",
        "font-size":"22px"
      })
    }else{
      $(".sun-container").css("height","195px");
      if(trackHeight1+trackHeight2<160){
        $(".track1").css("height",String(trackHeight1*2)+"px");
        $(".track2").css("height",String(trackHeight2*2)+"px");
      }
      $(".locked,.unlocked").css({
        "width":"25px",
        "height":"25px",
        "font-size":"25px"
      })
    }
    if((meteringLock && meteringLock == 1)|| $(".locked").css("display")=="block"){
      getJSON("/metering",function(data){
        if(data.height == 0 && data.width == 0 && data.top == 0 && data.left == 0){//位置长宽都为0则表示中心对焦
          focusArea = ["center"];
        }else{
          focusArea = [ data ];
        }
        clearTimeout(clearAreaTimer);
        drawFocusArea(focusArea);
        focusTimeout();
      })
      return;
    }
    var previewImg = document.getElementById("preview");
    var fx = Math.floor(e.offsetX*previewImg.naturalWidth/previewImg.width);
    var fy = Math.floor(e.offsetY*previewImg.naturalHeight/previewImg.height);
    var area = null;
    //alert("canvas click " + e.offsetX + ", " + e.offsetY+"view:"+previewImg.naturalWidth+" "+previewImg.width+" "+previewImg.naturalHeight+" "+previewImg.height);

    if(focusArea.length === 1 && 
      fx >= focusArea[0].left &&
      fx <= focusArea[0].left + focusArea[0].width &&
      fy >= focusArea[0].top &&
      fy <= focusArea[0].top + focusArea[0].height) {

      console.log("cancel focus area");
      focusArea = [];
      return
    }
    else {
      fx -= block_size + block_size/2;
      if(fx < 0)fx = 0;
      fy -= block_size + block_size/2;
      if(fy < 0)fy = 0;
      if(fx > (previewImg.naturalWidth-block_size*3))fx = previewImg.naturalWidth-block_size*3;//限制对焦框不要越过图片
      if(fy > (previewImg.naturalHeight-block_size*3))fy = previewImg.naturalHeight-block_size*3;
      fx -= fx%8;//相机只能处理8的倍数值
      fy -= fy%8;
      area = {left:fx, top:fy, width: block_size*3, height: block_size*3, level:0.5};  
  console.log(area);
      focusArea = [ area ];
    }

    drawFocusArea(focusArea);
    initFocusEventSource(area);

    if(enableFocus==1) initFocusEventSource(area);
    else {
      clearTimeout(clearAreaTimer)
      // clearAreaTimer=setTimeout(function(){
      //  focusArea = [];
      //  drawFocusArea(focusArea);
      // }, 3000);
      focusTimeout();
    }

  });
  $(".locked").on("click",function(){
    postJSON("/metering",{lock:0},function(){
      $(".locked").hide().siblings(".unlocked").show();
      meteringLock = null;
      clearTimeout(clearAreaTimer);
      focusTimeout();
    })
  });
  $(".unlocked").on("click",function(){
    postJSON("/metering",{top:focusArea[0].top,left:focusArea[0].left,width:focusArea[0].width,height:focusArea[0].height,lock:1},function(){
      $(".locked").show().siblings(".unlocked").hide();
      clearTimeout(clearAreaTimer);
      focusTimeout();
    })
  })
  
  
  
  
});

    function onFocusAreaChanged(e) {
	console.log(e);
    getJSON("/control",function(data){
      console.log(data)
      var v = data.exposureBias;
      $("#exposurebias-input").attr("value",v);
      $(".track2").css("height",String((v+40)*(orientationMode?1:2))+"px");
      $(".track1").css("height",String((orientationMode?80:160)-(v+40)*(orientationMode?1:2))+"px");
      v = v/10;
      var vShow = v==0?v:v.toFixed(1);
      if(v>0) vShow = "+"+vShow;
      $(".exposureBiasShow").text(vShow);
      $("#exposureBias-now").text(vShow);
      if(v!=0){
        $("#exposureBias-now").parent().show()
      }else($("#exposureBias-now").parent().hide())
    })
    if(enableFocus!=1) return;
    focusArea = JSON.parse(e.data);
    drawFocusArea(focusArea);
    
    //console.log("previewImg: top=" + $("#preview").offsetTop + " left=" + $("#preview").offsetLeft + " width=" + $("#preview").width + " height=" + $("#preview").height + " naturalWidth=" + $("#preview").naturalWidth + " naturalHeight=" + $("#preview").naturalHeight); 
  }

  function stopFocusEventSource(){
      if(focusEventSource){
	console.log("stop focus");
        focusEventSource.close();
        focusEventSource = null;
	focusArea = [];
	drawFocusArea(focusArea);
      }
  }


 //  function initFocusEventSource(area) {
 //    if(focusEventSource){
 //      focusEventSource.close();
	// console.log("stop focus");
 //    }
 //    var url = "/focus?"+(getAccessToken()?'access_token='+getAccessToken():'');
 //    if(area)  {
 //      url += '&left=' + area.left + '&top=' + area.top + '&width=' + area.width + '&height=' + area.height;
 //    }
 //    focusEventSource = new EventSource(url);
 //    focusEventSource.onmessage = onFocusAreaChanged;
 //    if(startFocusTimer) startFocusTimer=null
 //    console.log("start focus");
 //  }
function initFocusEventSource(area){
  if(area){
    var sendData = {left:area.left,top:area.top,width:area.width,height:area.height};
    postJSON("/metering",sendData,onFocusAreaChanged);
    console.log("start focus");
  }
  // if(startFocusTimer) startFocusTimer=null;
  
}

    
    
    
