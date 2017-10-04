var config = require('../config/config');
var baseModels = require('./schema/base');
var mongoose = require('mongoose');

mongoose.Promise = require('bluebird');
var db = mongoose.connect(config.database.url,config.database.options);
var Schema = mongoose.Schema;

for(var schemaName in baseModels){
	baseModels[schemaName] = db.model(
		schemaName, 
		new Schema(baseModels[schemaName])
	);
}

module.exports = {
	"base":baseModels
}