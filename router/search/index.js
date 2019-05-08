var router = require('express').Router();
var pool = require('../../config/db')

router.post('/', function(req,res){
	var sql = "select * from user where nickname=?";

	pool.getConnection((err, connection)=> {
		connection.query(sql, req.body.target_nickname, function(err, result){
			if(err){
				connection.release();
				throw err
			}
			if(result.length===0){
	       var msg = {"result":"ERROR"};
	    }
	    else {
	      var msg = {"result":result[0].nickname};
	    }
			res.json(msg);
			connection.release();
			return ;
		})

	})
})

module.exports = router;
