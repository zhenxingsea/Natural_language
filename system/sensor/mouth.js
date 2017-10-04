var Mouth = function(source){
	this.say = function(sentence){
		source.out(sentence);
	}
}

module.exports = new Mouth();