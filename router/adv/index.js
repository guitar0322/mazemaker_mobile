var conn = require('../../config/db');
var router = require('express').Router();

router.post('/', (req, res) =>{
  var nickname = req.body.nickname;
  console.log('advertisement : ', nickname);
  conn.query('update user set ticket = ticket + 1 where nickname = ?', nickname, (err, result) => {
    if(err) throw err;

  })
})

module.exports = router;
