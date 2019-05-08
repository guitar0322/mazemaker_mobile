var pool = require('../../config/db');
var router = require('express').Router();
router.post('/',function(req,res){

  var sql = `select * from (
 select nickname, score, (@r:=@r+1) as ranking from user, (select @r:=0) as B
 order by score desc, nickname) as T
where ranking<=50`;


/*
var sql =`select nickname, score, score div 500 tier
from user order by score;`;
*/
  pool.getConnection((err, connection) => {
    connection.query(sql, [],function(err,result){
      if(err)
        throw err;
      if(result.length===0){
        var msg = {'status':'ERROR'};
        return res.json(msg);
      }

      console.log("rank request...");
      //console.log("in rank : ",result[0]);
      var top=[];
      for(var i in result)
        top.push({"nickname":result[i].nickname,"rankscore":result[i].score, "ranking":result[i].ranking});

      sql = `With T(nickname, score, ranking) as (select nickname, score, (@r:=@r+1) as ranking from user, (select @r:=0) as B
      order by score desc, nickname)
      select nickname, score, ranking from T where ranking DIV 51 = (select ranking from T where nickname= ?) DIV 51;`;
      connection.query(sql,[req.body.nickname],function(err,result){
        if(err)
          throw err;
        if(result.lenght===0){
          var msg = {'status':'ERROR'};
          return res.json(msg);
        }
        var around = [];
        for(var i in result)
          around.push({"nickname":result[i].nickname,"rankscore":result[i].score,"ranking":result[i].ranking});

        var msg = {"top":top, "around":around};
        return res.json(msg);
      })
      connection.release();
    });
  })
})
module.exports = router;
