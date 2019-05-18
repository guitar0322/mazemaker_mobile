var router = require('express').Router();
var pool = require('../../config/db')

router.post('/', function(req, res) {
  var sql = "select * from Friend where (receiver = ? and relation = 0)";
  pool.getConnection((err, connection) => {
    connection.query(sql, [req.body.nickname], function(err, result) {
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
          f_list.push({"nickname":result[i].sender});
        }
        var msg = {"result":f_list};
        return res.json(msg);
      }
    })
    connection.release();
  })
})

module.exports = router;
