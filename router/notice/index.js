var router = require('express').Router();
var pool = require('../../config/db')
var fs = require('fs');

router.post('/',function(req,res){
	var notices = fs.readFileSync('router/notice/notice.txt').toString().split('+');
	var result = [];
	for(var i in notices){
		var notice = notices[i].split('\n');
		var notice_json = {};
		notice_json["title"] = "";
		notice_json["content"] = "";
		for(var j in notice){
			console.log("j = ", j, notice[j]);
			if(j == 0)
				notice_json["title"] = notice[j];
			else{
				notice_json["content"] += notice[j];
				if(j != notice.length-1)
				notice_json["content"] += '\n';
			}
		}
		result.push(notice_json);
	}
	console.log(result);
	return res.json(result);
});
module.exports = router;
