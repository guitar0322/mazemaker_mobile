var router = require('express').Router();
var pool = require('../../config/db')

router.post('/', function(req,res){
	var sql = "select ranking, nickname, record from stage where stage_id=? order by ranking";
	var msg = [];
	pool.getConnection((err, connection)=> {
		connection.query(sql, req.body.stage, function(err, result){
			console.log(req.body.stage, result);
			for(var i in result)
				msg.push({"nickname":result[i].nickname, "record":result[i].record});

			return res.json(msg);
		})
		connection.release();
	})
})

module.exports = router;
