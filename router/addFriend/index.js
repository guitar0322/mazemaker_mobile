var router = require('express').Router();
var pool = require('../../config/db')

router.post('/', function(req,res){
	var sql = "select * from Friend where (sender=? and receiver=?) or (sender=? and receiver=?)";

	pool.getConnection((err, connection)=> {
		connection.query(sql, [req.body.nickname, req.body.target_nickname, req.body.nickname, req.body.target_nickname], function(err, result){
			if(err)
				throw err
			if(result.length===0){
        sql = "insert into Friend values (?,?,?)"
        connection.query(sql,[req.body.nickname, req.body.target_nickname,0],function(err,result){
            var msg = {"result":"OK"};
            res.json(msg);
            connection.release();
            return ;
        })
	    }
	    else {
	      var msg = {"result":result[0].relation};

        res.json(msg);
        connection.release();
        return ;
	    }
		})
	})
})

module.exports = router;
