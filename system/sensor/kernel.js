var Kernel = function(){
	var TAG = "<kernel>";
	this.ERROR_CODE = "ERROR";
	this.DEBUG_CODE = "DEBUG";
	this.LOG_CODE = "LOG";

	function arrangeMsg(msg){
		msg = JSON.stringify(msg);
		msg = TAG + ":<" + msg + ">";
		return msg;
	}

	this.log = function(msg){
		msg = arrangeMsg(msg);
		console.log(msg);
	}

	this.createMsg = function(code,source,msg,data) {
		return {
			"code":code,
			"source":source,
			"msg":msg,
			"data":data
		};
	}
}

module.exports = new Kernel();