var router = require('express').Router();
var conn = require('../../config/db');

var map = new Array();
var wall = new Array();
for(var i = 0; i < 18; i++) {
  wall[i] = new Array(18);
}
var Random = (min, max) => {
  var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
  return ranNum;
}
var create_map = (map) => {
  map[0] = Random(8,25);
  map[1] = Random(0,2);
  return map;
}
var create_wall = (wall) => {
  var tmp = Random(8, 14);

  for(var i = 0; i < tmp; i++) {
    var x = Random(3, 16);
    var y = Random(1, 16);

    if(wall[x][y] === 1 || wall[x][y+1] === 1 || wall[x-1][y] === 1 || wall[x-1][y+1] === 1) {
      i--;
    } else {
      wall[x][y] = 1;
      wall[x][y+1] = 1;
      wall[x-1][y] = 1;
      wall[x-1][y+1] = 1;
    }
  }
  return wall;
}

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
                  var wall = create_wall(wall);
                  var map = create_map(map);
                  var msg = {"status":"OK", "result":result, "wall":wall, "map":map};
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
