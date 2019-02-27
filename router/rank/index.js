var conn = require('../../config/db');
var router = require('express').Router();
router.post('/',function(req,res){

  var sql = `select * from (
 select nickname, score, (@r:=@r+1) as ranking from user, (select @r:=0) as B
 order by score desc, nickname) as T
where ranking<=10`;


/*
var sql =`select nickname, score, score div 500 tier
from user order by score;`;
*/

  conn.query(sql, [],function(err,result){
    if(err)
      throw err;
    if(result.length===0){
      var msg = {'status':'ERROR'};
      return res.json(msg);
    }

    process.stdout.write(result);
    process.stdout.write(result[0]);
    var top=[];
    for(var i in result)
      top.push({"nickname":result[i].nickname,"rankscore":result[i].score});

    sql = `With T(nickname, score, ranking) as (select nickname, score, (@r:=@r+1) as ranking from user, (select @r:=0) as B
    order by score desc, nickname)
    select nickname, score from T where ranking DIV 11 = (select ranking from T where nickname= ?) DIV 11;`;
    conn.query(sql,[req.body.nickname],function(err,result){
      if(err)
        throw err;
      if(result.lenght===0){
        var msg = {'status':'ERROR'};
        return res.json(msg);
      }
      var around = [];
      for(var i in result)
        around.push({"nickname":result[i].nickname,"rankscore":result[i].score});

      var msg = {"top":top, "around":around};
      return res.json(msg);
    })
  });
})
module.exports = router;
