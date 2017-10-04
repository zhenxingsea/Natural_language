var express = require('express');
var router = express.Router();
var tool = require("../system/tool/tool");

router.post('/showView', function(req, res, next) {
	var show = function(resObj){
		res.send(resObj);
	}
	tool.showView(show);
});

router.post('/showReportWord', function(req, res, next) {
	var show = function(resObj){
		res.send(resObj);
	}
	tool.showReportWord(show);
});

router.post('/showReportSentence', function(req, res, next) {
	var show = function(resObj){
		res.send(resObj);
	}
	tool.showReportSentence(show);
});

router.post('/inSentence', function(req, res, next) {
	if(req.body.sentence){
		tool.saveWord(req.body.sentence);
		tool.saveContact(req.body.sentence);
		res.send("ok!");
		return
	}
	res.send("fail!");
});

module.exports = router;
