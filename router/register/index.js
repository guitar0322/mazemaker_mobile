var pool = require('../../config/db');
var router = require('express').Router();
require('date-utils');

router.post('/',function(req,res){
  console.log('In register : ', req.body);
  var username = req.body.username;
  var nickname = req.body.nickname;
  var sql = 'select * from user where nickname = ?';

  pool.getConnection((err, connection)=> {
    connection.query(sql, nickname, (err, result) => {
      if(err) throw err;

      if(result.length === 0) {
        var dt = new Date();
        var d = dt.toFormat('YYYY-MM-DD HH24:MI:SS');

        var register_info = {
          username:username,
          nickname:nickname,
          win:0,
          loss:0,
          score:1000,
          ticket:5,
          last_date:d,
          tutorial:0
        }
        connection.query('insert into user set ?', register_info, (err, result) => {
          if(err) throw err;
          connection.query(sql, nickname, (err, result) => {
            if(err) throw err;
            var win = result[0].win;
            var loss = result[0].loss;
            var league = result[0].score;
            var last_date = result[0].last_date;
            var ticket = result[0].ticket;
            var tutorial = result[0].tutorial;

            var msg = {"status":"OK", "win":win, "loss":loss, "league":league, "ticketchangedtime":last_date, "ticket":ticket, "tutorial":tutorial}
            return res.json(msg);
            connection.release();
          })
        })
      }
      else {
        var msg = {"status":"ERROR"};
        return res.json(msg);
        connection.release();
      }
    })
  })
});
module.exports = router;
