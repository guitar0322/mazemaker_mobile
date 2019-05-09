var router = require('express').Router();
var pool = require('../../config/db')

router.post('/', function(req, res) {
  var sql = "select * from Friend where sender = ? and relation = 1";
  pool.getConnection((err, connection) => {
    connection.query(sql, req.body.nickname, function(err, result) {
      if (err) {
				connection.release();
				throw err
			}
      if(result.length === 0) {
        var msg = {"result":"NONE"};
        res.json(msg);
      }
      else {
        var sql = `select u.nickname, u.status
        from Friend as f, user as u
        where f.receiver=u.nickname and f.sender=? and f.relation = 1;`
        connection.query(sql, req.body.nickname, function(err, result) {
          if(err) {
            connection.release();
            throw err;
          }
          var f_list = [];

          for(var i in result) {
            f_list.push({"nickname":result[i].nickname, "status":result[i].status});
          }
          var msg = {"result":f_list};
          res.json(msg);
        })
      }
    })
    connection.release();
  })
})

module.exports = router;
