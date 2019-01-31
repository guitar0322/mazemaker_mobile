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
      var msg = {"status":"ERROR"};
      return res.json(msg);
    }

    var user = result[0].username;
    var pw = result[0].password;
    var salt =result[0].salt;
    var nickname = result[0].nickname;
    var win = result[0].win;
    var loss = result[0].loss;
    var score = result[0].score;
    var last_date = result[0].last_date;

    return hasher({password:req.body.password,salt:salt},
      function(err,pass,salt,hash){
        if(hash===pw){
          var msg={"status":"OK",'nickname':nickname, 'win':win, 'loss':loss, 'score':score, 'last_date':last_date};
          var tmp = {
            last_date:req.body.last_date
          }
          var arr = new Array();
          arr[0] = tmp;
          arr[1] = user;
          conn.query('update user set ? where username = ?', arr, (err, result) => {
            if(err) throw err;
            console.log(last_date);
            return res.json(msg);
          })
        }
        else{
          var msg={"status":"ERROR"};
          return res.json(msg);
        }
      });
  });
});
module.exports = router;
