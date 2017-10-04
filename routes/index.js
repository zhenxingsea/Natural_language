var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '自然语然分析' });
});

/* GET home page. */
router.get('/report.html', function(req, res, next) {
  res.render('report', { title: '自然语然分析-分析' });
});

module.exports = router;
