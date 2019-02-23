var conn = require('../../config/db');
var router = require('express').Router();

router.post('/', (req, res) =>{
  var nickname = req.body.nickname;
  console.log('advertisement : ', nickname);
  conn.query()
})

module.exports = router;
