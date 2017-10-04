var wordTool = require("./system/tool/tool");


var sentence = "可能是我表述不够清楚，我是想知道mongoose是如何生存这个id的，我现在就是不太信任mongoose，所以想关闭它的这个机制，而交给mongoDB来创建id";
wordTool.saveContactAndWord(sentence);

// wordTool.showView(function(obj){
// 	console.log(obj);
// });