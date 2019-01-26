var router = require('express').Router();
var conn = require('../../config/db');

router.post('/', (req, res) => {
  var nickname = req.body.nickname;
  conn.query('delete from match_que where nickname = ?', nickname, (err, result) => {
    if(err) throw err;
  })
})
module.exports = router;
