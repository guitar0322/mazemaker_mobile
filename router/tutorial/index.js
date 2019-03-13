var conn = require('../../config/db');
var router = require('express').Router();

router.post('/', (req, res) =>{
  var nickname = req.body.nickname;
  console.log("tutorial complete : ", nickname);
  conn.query('select * from user where nickname = ?', nickname, (err, result) => {
    if(err) throw err;
    conn.query('update user set tutorial = 1 where nickname = ?', nickname, (err, result) => {
      if(err) throw err;
      
      var msg = {"status":"COMPLETE"};
      console.log("turorial conplete : ", msg);
      return res.json(msg);
    })
  })
})

module.exports = router;
