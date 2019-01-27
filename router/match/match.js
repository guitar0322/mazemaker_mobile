var conn = require('../../config/db');
var router = require('express').Router();

router.post('/',function(req,res){
  var nickname = req.body.nickname;
  var score = req.body.rankscore;
  //#flag:0 -> 대기중  #flag:1 -> 수락대기중  #flag:-1 -> 수락완료
  //일단은 match_que에 있는 애들중에 rankscore가 비슷한애들 있는지 찾아본다
  conn.query('select * from user where nickname = ?', nickname, (err, result) => {
    if(err) throw err;
    else {
      var id = result[0].id;
      match_user = {
        id:result[0].id,
        flag:0,
        nickname:nickname,
        score:score,
      }
      conn.query('select * from match_que where nickname = ?', nickname, (err, result) => {
        if(err) throw err;
        else if(result.length != 0){
          var room = result[0].room;
          conn.query('select * from match_que where flag = 1 and room = ?', room, (err, result) => {
            if(err) throw err;
            else if(result.length === 2) {
              var msg = {"complete":"COMPLETE"};
              return res.json(msg);
            }
            else {
              var msg = {"complete":"ERROR"};
              return res.json(msg);
            }
          })
        }
        else if(result.length === 0){
          conn.query('select * from match_que where ABS(TRUNCATE(score/100,0) - ?) = 0 AND flag = 0', Math.floor(score/100, 0), (err, result) => {
            if(err) throw err;
            if(result.length === 0){//기존의 비슷한 점수인 애들의 match_que가 존재하지 않는 경우
              conn.query('insert into match_que set ?', match_user, (err, result) => {
                if(err) throw err;
                else {
                  var msg = {"complete":"ERROR"};
                  return res.json(msg);
                }
              })
            }
            else if(result.length === 1) {//기존의 match_que가 7명 대기중일때
              match_user = {
                id:id,
                room:result[0].room,
                flag:0,
                nickname:nickname,
                score:score,
              }
              conn.query('insert into match_que set ?', match_user, (err, result) => {
                if(err) throw err;
              })
              conn.query('update match_que set flag = 1 where room = ?', result[0].room, (err, result) => {
                if(err) throw err;
              })
            }
            else {//기존의 비슷한 점수인 애들의 match_que가 존재하는 경우
              match_user = {
                id:id,
                room:result[0].room,
                flag:0,
                nickname:nickname,
                score:score,
              }
              conn.query('insert into match_que set ?', match_user, (err, result) => {
                if(err) throw err;
              })
            }
          })
        }
      })
    }
  })
})

module.exports = router;
