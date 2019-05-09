var pool = require('../../config/db');
var router = require('express').Router();
router.post('/', function(req,res){
	var select_sql = 'select * from stage where stage_id=? order by ranking desc';
	var select_sql2 = 'select * from stage where stage_id=?';
	var update_sql = 'update stage set nickname=?, record=? where stage_id=? and ranking=?';
	var user_stage = req.body.stage;
	var user_nickname = req.body.nickname;
	var user_record = parseFloat(req.body.record);
	var update_rank = -1;
	var msg = {"ranking":update_rank};
	pool.getConnection((err, connection) => {
		connection.query(select_sql, user_stage, function(err, result){
			if(err){
				connection.release();
				throw err;
			}
			for(var i in result){
				if(result[i].record < user_record){
					update_rank = result[i].ranking;
					if(update_rank < 10){
						connection.query(update_sql,[result[i].nickname, result[i].record, user_stage, result[i].ranking+1], (err, result)=> {
							if(err){
		            connection.release();
		            throw err;
		          }
						})
					}
				}
			}
			if(update_rank != -1){
				console.log(user_stage, update_rank, user_record, user_nickname);
				connection.query(update_sql,[user_nickname, user_record, user_stage, update_rank], (err, result)=> {
					if(err){
            connection.release();
            throw err;
          }
				});
			}
			msg["ranking"] = update_rank;
			res.json(msg);
		})
		connection.release();
	})
})

module.exports = router;
