var router = require('express').Router();
var pool = require('../../config/db')

router.post('/', function(req, res) {
  //var sql = "select * from Friend where (sender=? and receiver=?) or (sender=? and receiver=?)";
  var sql = "delete from Friend where (sender=? and receiver=?) or (sender=? and receiver=?)";
  console.log("delFriend TEST : ", req.body);
  pool.getConnection((err, connection) => {
    connection.query(sql, [req.body.nickname, req.body.target_nickname, req.body.target_nickname, req.body.nickname], function(err, result) {
      if (err) {
				connection.release();
				throw err
			}

      if (result.length === 0) {
        //// TODO:
        console.log("우리는 친구가 아닙니다.")
        var msg={"result":"ERROR"};
        res.json(msg);
      }
			else {
        var msg = {"result": "OK"};
        res.json(msg);
      }
			connection.release();
    })
  })
})

module.exports = router;
