var conn = require('../../config/db');
var router = require('express').Router();
router.get('/',function(req,res){
/*
  var sql = `select * from (
 select nickname, score, (@r:=@r+1) as ranking from user, (select @r:=0) as B
 order by score, nickname) as T
where ranking<=10`;
*/
var sql =`select nickname, score, score div 500 tier
from user order by score;`;
var tier =new Array(6);
for(var i=0;i<6;i++)
  tier[i]=new Array();


  conn.query(sql, [],function(err,result){
    if(err)
      throw err;
    if(result.length===0){
      var msg = {'status':'ERROR'};
      return res.json(msg);
    }
    for(var i=0;i<result.length;i++)
    {
      if(tier[result[i].tier].length>=10)
        continue;
      tier[result[i].tier].push(result[i]);
    }
    var msg = {'status':'OK','0':tier[0],'1':tier[2],'2':tier[3],'3':tier[4],
    '4':tier[4],'5':tier[5]}
    console.log(JSON.stringify(msg));
    res.json(msg);
  });
})
module.exports = router;
