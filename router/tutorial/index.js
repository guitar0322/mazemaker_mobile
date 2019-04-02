var pool = require('../../config/db');
var router = require('express').Router();

router.post('/', (req, res) =>{
  var nickname = req.body.nickname;
  console.log("tutorial complete : ", nickname);
  pool.getConnection((err, connection) => {
    connection.query('select * from user where nickname = ?', nickname, (err, result) => {
      if(err) throw err;
      connection.query('update user set tutorial = 1 where nickname = ?', nickname, (err, result) => {
        if(err) throw err;

        var msg = {"status":"COMPLETE"};
        console.log("turorial conplete : ", msg);
        return res.json(msg);
        connection.release();
      })
    })
  })
})

module.exports = router;
