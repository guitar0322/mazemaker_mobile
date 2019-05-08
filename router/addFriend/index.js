var router = require('express').Router();
var pool = require('../../config/db')

router.post('/', function(req, res) {
  var sql = "select * from Friend where (sender=? and receiver=?) or (sender=? and receiver=?)";
  console.log("addFriend TEST : ", req.body);
  pool.getConnection((err, connection) => {
    connection.query(sql, [req.body.nickname, req.body.target_nickname, req.body.target_nickname, req.body.nickname], function(err, result) {
      if (err) {
				connection.release();
				throw err
			}

      if (result.length === 0) {
        sql = "insert into Friend values (?,?,?)"
        connection.query(sql, [req.body.nickname, req.body.target_nickname, 0], function(err, result) {
          var msg = {"result": "OK"};

					res.json(msg);
        })
      }
			else {
        var msg = {"result": result[0].relation};

        res.json(msg);
      }
			connection.release();
    })
  })
})

module.exports = router;
