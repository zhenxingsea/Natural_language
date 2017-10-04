var fs = require('fs');
var config_file = "config/config.json";
var config_data = fs.readFileSync(config_file);
var config = JSON.parse(config_data.toString());
module.exports = config;