var Segment = require('segment');
var segment = new Segment();
segment.useDefault();
var guid = require("./GUID");
var Kernel = require("../sensor/kernel");
var models = require("../../database/models").base;
var Word = models.word;
var WordContact = models.word_contact;
var Sentence = models.sentence;
var SentenceContact = models.sentence_contact;
var localPath = __dirname + "/tool.js";

var word_tag = ">";
var sentence_tag = "&";

var PToName = function(p){
	var ps = p.split(word_tag);
	if(p[0] === "/"){
		ps.splice(0,1);
	}
	var name = "";
	for(var i in ps){
		var tmp_name = segment.POSTAG.chsName(new Number(ps[i]));
		tmp_name = tmp_name.split(" ")[0];
		name = name + word_tag + tmp_name;
	}
	return name;
}

var dealWithSentenceWord = function(sentence_word){
	return sentence_word;
}

var dealWithWord = function(word){
	word.p_name = segment.POSTAG.chsName(word.p);
	word.p_name = word.p_name.split(" ")[0];
	word.$inc = {times:1}
	return word;
}

var dealWithWordContact = function(contact){
	contact.p_name = PToName(contact.p)
	contact.$inc = {times:1}
	return contact;
}

var dealWithSentence = function(sentence){
	sentence.p_name = PToName(sentence.p);
	sentence.$inc = {times:1}
	return sentence;
}

var dealWithSentenceContact = function(sentence_contact){
	var tmp_names = sentence_contact.p.split(sentence_tag);
	var front_sentence_name = PToName(tmp_names[0]);
	var behind_sentence_name = PToName(tmp_names[1]);
	sentence_contact.p_name = front_sentence_name + sentence_tag + behind_sentence_name;
	sentence_contact.$inc = {times:1}
	return sentence_contact;
}

var format_sentence = function(sentence){
	//过滤空格
	sentence = sentence.replace(/\s+/g,"");
	//过滤英文
	// sentence = sentence.replace(/[a-zA-Z]/g,"");
	//过滤英文标点符号
	sentence = sentence.replace(/[\ |\~|\`|\!|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\"|\'|\,|\<|\>|\?]/g,"/");
	//过滤中文标点符号
	sentence = sentence.replace(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/g,"/");
  
	Kernel.log(
		Kernel.createMsg(
			Kernel.DEBUG_CODE,localPath,"format_sentence",sentence
			)
	);
	return sentence;
}

var saveWord = function(sentence_words){
	for(var i in sentence_words){
		var new_word = dealWithSentenceWord(sentence_words[i])
		new_word = dealWithWord(new_word)
		if(new_word){
			Word.findOneAndUpdate({word: new_word.w},new_word, {upsert:true}, function(err, doc){
				if(err){
					Kernel.log(
						Kernel.createMsg(
							Kernel.ERROR_CODE,localPath,"saveWord is fial!",err
							)
						);
				}else{
					Kernel.log(
						Kernel.createMsg(
							Kernel.LOG_CODE,localPath,"saveWord is succeed!",doc
							)
						);
				}
			});
		}
	}
}

var saveWordContact = function(sentence_words){
	var frontIndex = 0;
	for(var index in sentence_words){
		if(index > 0){
			var tag = sentence_words[frontIndex].p + word_tag +  sentence_words[index].p
			var contact = {
				"front_word": sentence_words[frontIndex].w,
				"behind_word": sentence_words[index].w,
				"p" : tag
			};
			contact = dealWithSentenceWord(contact)
			contact = dealWithWordContact(contact);
			if(contact){
				WordContact.findOneAndUpdate({front_word : contact.front_word,
					behind_word : contact.behind_word}, contact, {upsert:true}, function(err, doc){
					if(err){
						Kernel.log(
							Kernel.createMsg(
								Kernel.ERROR_CODE,localPath,"saveContact is fial!",err
								)
							);
					}else{
						Kernel.log(
							Kernel.createMsg(
								Kernel.LOG_CODE,localPath,"saveContact is succeed!",doc
								)
							);
					}
				});
			}
		}
		frontIndex = index;
	}
}

var saveSentence = function(sentence_words){
	var tag = "";
	var sentence = "";
	for(var i in sentence_words){
		var tmp_tag = sentence_words[i].p;
		tag = tag + word_tag + tmp_tag;
		var tmp_sentence = sentence_words[i].w;
		sentence = sentence + word_tag + tmp_sentence;
		if(tmp_tag === 2048){
			var new_sentence = {
				"sentence" : sentence,
				"p" : tag
			};
			new_sentence = dealWithSentenceWord(new_sentence)
			new_sentence = dealWithSentence(new_sentence);
			if(new_sentence){
				Sentence.findOneAndUpdate({sentence : sentence}, new_sentence, {upsert:true}, function(err, doc){
					if(err){
						Kernel.log(
							Kernel.createMsg(
								Kernel.ERROR_CODE,localPath,"saveSentence is fial!",err
								)
							);
					}else{
						Kernel.log(
							Kernel.createMsg(
								Kernel.LOG_CODE,localPath,"saveSentence is succeed!",doc
								)
							);
					}
				});
			}
			tag = "";
			sentence = "";
		}
	}
}

var saveSentenceContact = function(sentence_words){
	var front_sentence = null;
	var behind_sentence = null;
	var tag = "";
	var front_sentence_tag = null;
	var behind_sentence_tag = null;
	var sentence = "";
	for(var i in sentence_words){
		var tmp_tag = sentence_words[i].p;
		tag = tag + word_tag + tmp_tag;
		var tmp_sentence = sentence_words[i].w;
		sentence = sentence + word_tag + tmp_sentence;
		if(tmp_tag === 2048){
			if(front_sentence === null && front_sentence_tag === null){
				front_sentence = sentence;
				front_sentence_tag = tag;
			}else{
				behind_sentence = sentence;
				behind_sentence_tag = tag;
				var sentence_contact = {
					"front_sentence" : front_sentence,
					"behind_sentence" : behind_sentence,
					"p" : front_sentence_tag + sentence_tag + behind_sentence_tag
				};
				sentence_contact = dealWithSentenceContact(sentence_contact);
				if(sentence_contact){
					SentenceContact.findOneAndUpdate({front_sentence : sentence_contact.front_sentence,
								behind_sentence : sentence_contact.behind_sentence}, sentence_contact,
								{upsert:true}, function(err, doc){
						if(err){
							Kernel.log(
								Kernel.createMsg(
									Kernel.ERROR_CODE,localPath,"saveSentenceContact is fial!",err
									)
								);
						}else{
							Kernel.log(
								Kernel.createMsg(
									Kernel.LOG_CODE,localPath,"saveSentenceContact is succeed!",doc
									)
								);
							}
						});
				}
				front_sentence = behind_sentence;
				front_sentence_tag = behind_sentence_tag;
			}
			sentence = "";
			tag = "";
		}
	}
}

var saveContactAndWord = function(sentence){
	sentence = format_sentence(sentence);
	sentence_words = segment.doSegment(sentence);
	saveWord(sentence_words);
	saveWordContact(sentence_words);
	saveSentence(sentence_words);
	saveSentenceContact(sentence_words);
}

var showView = function(func){
	var tmp_categories_list = []
	var resObj = {};
	resObj.code = "fial";
	resObj.words = [];
	resObj.contacts = [];
	resObj.categories = [];
	tmp_list = [];
	WordContact.find({},function(err,contacts) {
		if(err){
			func(resObj);
		}else{
			resObj.code = "succeed";
			for(var i in contacts){
				front_word = contacts[i].front_word;
				category = contacts[i].p_name
				if ((category in tmp_categories_list) === false){
					resObj.categories.push({"name":category})
					tmp_categories_list.push(category)
				}
				if(tmp_list.indexOf(front_word) < 0){
					var word = {
			            "name": front_word,
			            "symbolSize": 10,
			            "category": category,
			            "draggable": "true",
			            "value": 1
			        };
			        resObj.words.push(word);
			        tmp_list.push(front_word);
				}
				behind_word = contacts[i].behind_word;
				if(tmp_list.indexOf(behind_word) < 0){
					var word = {
			            "name": behind_word,
			            "symbolSize": 10,
			            "category": category,
			            "draggable": "true",
			            "value": 1
			        };
			        resObj.words.push(word);
			        tmp_list.push(behind_word);
				}
				var contact = {
		            "source": front_word,
		            "target": behind_word
		        }
		        resObj.contacts.push(contact);
			}
			func(resObj);
		}
	});			
}

var showReportWord = function(func){
	var resObj = {};
	resObj.code = "fial";
	resObj.series_data_word = [];
	resObj.xAxis_data_word = [];
	WordContact.find({},function(err,word_contacts) {
		if(err){
			func(resObj);
		}else{
			resObj.code = "succeed";
			for(var i in word_contacts){
				resObj.xAxis_data_word.push(word_contacts[i].p_name);
				resObj.series_data_word.push({
					"name" : word_contacts[i].p_name,
					"value" : word_contacts[i].times
				});
			}
			func(resObj);
		}
	});
}

var showReportSentence = function(func){
	var resObj = {};
	resObj.code = "fial";
	resObj.series_data_sentence = [];
	resObj.xAxis_data_sentence = [];
	SentenceContact.find({},function(err,sentence_contacts) {
		if(err){
			func(resObj);
		}else{
			resObj.code = "succeed";
			for(var i in sentence_contacts){
				resObj.xAxis_data_sentence.push(sentence_contacts[i].p_name);
				resObj.series_data_sentence.push({
					"name" : sentence_contacts[i].p_name,
					"value" : sentence_contacts[i].times
				});
			}
			func(resObj);
		}
	});
}

module.exports = {
	"saveContactAndWord" : saveContactAndWord,
	"showView" : showView,
	"showReportWord" : showReportWord,
	"showReportSentence" : showReportSentence

}