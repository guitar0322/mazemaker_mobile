var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var conn = require('../../config/db');
var router = require('express').Router();

router.get('/',function(req,res){
  res.send(`
    <html>
      <head>
      </head>
      <body>
      <form method="post" action="/login">
      <input type="text" name = "username"/><br>
      <input type="text" name = "password"/><br>
      <input type="submit"/>
      </form>
      </body>
    </html>
    `);
})

router.post('/',function(req,res){
  //console.log(req.body);
  var sql = 'select * from user where username = ?';
  conn.query(sql,[req.body.username],function(err,result){
    if(err){
      throw err;
    }
    if(result.length===0){
      var msg = {"status":"FIRST"};
      return res.json(msg);
    }
    else {
      var nickname = result[0].nickname;
      var win = result[0].win;
      var loss = result[0].loss;
      var league = result[0].score;
      var last_date = result[0].last_date;
      var ticket = result[0].ticket;
      var tutorial = result[0].tutorial;
      var msg = {"status":"OK", "nickname":nickname, "win":win, "loss":loss, "league":league, "ticketchangedtime":last_date, "ticket":ticket, "tutorial":tutorial}

      return res.json(msg);
    }
  });
});
module.exports = router;
