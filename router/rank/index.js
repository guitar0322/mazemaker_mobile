var conn = require('../../config/db');
var router = require('express').Router();
router.post('/',function(req,res){
  var sql = `select * from (
 select nickname, score, (@r:=@r+1) as ranking from user, (select @r:=0) as B
 order by score, nickname) as T
where ranking<=10`;

  conn.query(sql, [],function(err,result){
    if(err)
      throw err;
    if(result.length===0){
      var msg = {'status':'ERROR'};
      return res.json(msg);
    }
    var msg = {'status':'OK','result':result};
    res.send(msg);
  });
})
module.exports = router;
