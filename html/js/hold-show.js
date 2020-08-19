$(function(){
var showList=$("#preview");
$.fn.extend({
	holdShow: function() {
		showList=showList.not($(this)).add($(this));
		if(!hideCTL) $(this).show();
	}
	holdHide: function() {
		showList=showList.not($(this));
		$(this).hide();
	}
});
function showCTL(showFlag){
	if(showFlag==0) {
		hideCTL=1;
		showList.hide();
	}else {
		hideCTL=0;
		showList.show();
	}
}
})
