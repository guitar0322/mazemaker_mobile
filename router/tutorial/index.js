var conn = require('../../config/db');
var router = require('express').Router();
conn.connect();

router.post('/', (req, res) =>{
  var nickname = req.body.nickname;

  conn.query('select * from user where nickname = ?', nickname, (err, result) => {
    if(err) throw err;
    conn.query('update user set tutorial = 1 where nickname = ?', nickname, (err, result) => {
      if(err) throw err;
    })
  })
})

module.exports = router;
