var router = require('express').Router();
var pool = require('../../config/db')

router.get('/', function(req, res) {
  var sql = "select * from Friend where (receiver = ? and relation = 1)";
  pool.getConnection((err, connection) => {
    connection.query(sql, [req.query.nickname], function(err, result) {
      if (err) {
				connection.release();
				throw err
			}
      if(result.length === 0) {
        var msg = {"result":"NONE"};
        res.json(msg);
      }
      else {
        var f_list = [];

        for(var i in result) {
          f_list.push({"nickname":result[i].nickname});
        }
        var msg = {"result":f_list};
        res.json(msg);
      }
    })
    connection.release();
  })
})

module.exports = router;
