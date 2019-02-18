var conn = require('../../config/db');
var router = require('express').Router();
require('date-utils');
conn.connect();

router.get('/',function(req,res){
  res.send(`
    <html>
      <head>
      </head>
      <body>
      <form method="post" action="/register">
      <input type="text" name = "username"/><br>
      <input type="text" name = "password"/><br>
      <input type="text" name="nickname"/><br>
      <input type="submit"/>
      </form>
      </body>
    </html>
    `);
})
router.post('/',function(req,res){
  //console.log('In register');
  //console.log(req.body);
  var username = req.body.username;
  var nickname = req.body.nickname;
  var sql = 'select * from user where nickname = ?';

  conn.query(sql, nickname, (err, result) => {
    if(err) throw err;

    if(result.length === 0) {
      var dt = new Date();
      var d = dt.toFormat('YYYY-MM-DD HH24:MI:SS');

      var register_info = {
        username:username,
        nickname:nickname,
        win:0,
        loss:0,
        score:0,
        ticket:5,
        last_date:d,
        tutorial:0
      }
      conn.query('insert into user set ?', register_info, (err, result) => {
        if(err) throw err;
        conn.query(sql, nickname, (err, result) => {
          if(err) throw err;
          var win = result[0].win;
          var lose = result[0].lose;
          var league = result[0].score;
          var last_date = result[0].last_date;
          var ticket = result[0].ticket;
          var tutorial = result[0].tutorial;

          var msg = {"status":"OK", "win":win, "lose":lose, "league":league, "ticketchangedtime":last_date, "ticket":ticket, "tutorial":tutorial}
          return res.json(msg);
        })
      })
    }
    else {
      var msg = {"status":"ERROR"};
      return res.json(msg);
    }
  })
});
module.exports = router;
