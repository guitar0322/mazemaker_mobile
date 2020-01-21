var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var router = require('express').Router();
var pool = require('../../config/db')
router.post('/',function(req,res){
  console.log('hello');
  pool.getConnection((err, connection)=> {
    var sql = 'select * from user where username = ?';
	var version = "1.2.4";
    connection.query(sql,[req.body.username],function(err,result){
      if(err){
        connection.release();
        throw err;
      }
      if(result.length===0){
	    var date = new Date();
		var time = date.toFormat('YYYY-MM-DD HH24:MI:SS');
        var msg = {"status":"FIRST", "version":version};
        console.log(msg, req.body.username, time );
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
		var stage = result[0].stage;
        var msg = {"status":"OK", "nickname":nickname, "win":win, "loss":loss, "league":league, "ticketchangedtime":last_date, "ticket":ticket, "tutorial":tutorial, "version":version, "stage":stage};
		console.log("login : ", msg["nickname"], new Date().toFormat('YYYY-MM-DD HH24:MI:SS'));
        return res.json(msg);
      }
      connection.release();
    });
  })
});
module.exports = router;
