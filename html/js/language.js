//var language = getParameterByName("language");
console.log("language:"+language);
var url = language=="en"?"language/en.json":"language/zh.json";
function setLanguage(data){
	console.log("mydata:"+data);
	$("[lan]").each(function(){
		switch(this.tagName.toLowerCase()){
			case "input":
				$(this).attr("placeholder",data[$(this).attr("lan")]);
				break
			default:
				$(this).html(data[$(this).attr("lan")]);
				console.log("default");
		}
	})
	console.log("complete setLanguage");
}
function checkContent(){
	getJSON(url,setLanguage,function (){
		setTimeout(checkContent,5000);
	});
}
checkContent();

