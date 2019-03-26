var pool = require('../../config/db');
var router = require('express').Router();
require('date-utils');

router.post('/', (req, res) =>{
  var nickname = req.body.nickname;
  console.log('advertisement : ', nickname);
  pool.getConnection((err, connection) => {
    connection.query('select * from user where nickname = ?', nickname, (err, result) => {
      if(err) throw err;
      if(result[0].ticket >=4) {
        var dt = new Date();
        var d = dt.toFormat('YYYY-MM-DD HH24:MI:SS');
        var params = [d, nickname];
        conn.query('update user set ticket = ticket + 1, last_date = ? where nickname = ?', params, (err, result) => {
          if(err) throw err;
        })
      }
      else {
        conn.query('update user set ticket = ticket + 1 where nickname = ?', nickname, (err, result) => {
          if(err) throw err;
        })
      }
      connection.release();
    })
  })
})

module.exports = router;
