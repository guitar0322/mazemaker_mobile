var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var conn = require('../../config/db');
conn.connect();
var router = require('express').Router();
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
  hasher({password:req.body.password},function(err,pass,salt,hash){
    var new_user = {
      username:req.body.username,
      password:hash,
      salt: salt,
      nickname:req.body.nickname,
      win:0,
      loss:0,
      score:0,
      ticket:0
    }
    console.log('new_user', new_user);
    conn.query('select id from user where username= ? ',[req.body.username],function(err,result){
      if(err){
        throw err;
      }
      if(result.length>0){
        console.log('iD');
        var msg = {"status":"ID_ERROR"};
        //return res.send(msg);
        return res.json(msg);
      }
      conn.query('select id from user where nickname= ?',[req.body.nickname],function(err,result){
        if(err){
          throw err;
        }
        if(result.length>0){
          var msg = {"status":"NICKNAME_ERROR"};
          return res.json(msg);
        }
        var sql = 'insert into user set ?';
        conn.query(sql, new_user,function(err,result){
            return req.session.save(function(){
              var msg = {"status":"OK"}
              res.json(msg);
            });
        })
      })
    });
  })
});
module.exports = router;
