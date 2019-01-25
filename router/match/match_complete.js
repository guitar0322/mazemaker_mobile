var router = require('express').Router();
var conn = require('../../config/db');

router.post('/', (req, res) => {
  var accpet = req.body.accept;
  var nickname = req.body.nickname;

  console.log(req.body);
  if(accpet === "ACCEPT") {
    conn.query('update match_que set flag = -1 where nickname = ?', nickname, (err, result) => {
      if(err) throw err;
      else {
        conn.query('select * from match_que where nickname = ?', nickname, (err, result) => {
          if(err) throw err;
          else {
            var room = result[0].room;
            conn.query('select * from match_que where flag = -1 and room = ?', room, (err, result) => {
              if(err) throw err;
              else {
                if(result.length === 8) {
                  var msg = {"status":"OK", "result":result};
                  return res.json(msg);
                }
              }
            })
          }
        })
      }
    })
  }
  if(accpet === "CANCEL") {
    conn.query('select * from match_que where nickname = ?', nickname, (err, result) => {
      if(err) throw err;
      else {
        var room = result[0].room;
        console.log(room);
        conn.query('delete from match_que where room = ?', room, (err, result) => {
          if(err) throw err;
          else {
            var msg = {"status":"CANCEL"};
            return res.json(msg);
          }
        })
      }
    })
  }
})
module.exports = router;
