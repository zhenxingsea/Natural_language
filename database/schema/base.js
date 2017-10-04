var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/*
* @Word 字
*/
var word = {
	word : String,	
	p : Number,
	p_name : String,
	times : Number
}

/*
* @Contact 联系
*/
var word_contact = {
	front_word : String,
	behind_word : String,
	p : String,
	p_name : String,
	times : Number
}

/*
* @Sentence 句型
*/
var sentence = {
	sentence : String,
	sentence_name : String,
	p : String,
	p_name : String,
	times : Number
}

/*
* @SentenceContact 句子关系
*/
var sentence_contact = {
	front_sentence : String,
	behind_sentence : String,
	front_sentence_name : String,
	behind_sentence_name : String,
	p : String,
	p_name : String,
	times : Number
}

module.exports = {
	"word" : word,
	"word_contact" : word_contact,
	"sentence" : sentence,
	"sentence_contact" : sentence_contact
};