module.exports=function(io){
  var pool = require('../config/db');
  var rooms = {};
  const MAX_USER = 2;
  var user_cnt = 0;
  var Random = (min, max) => {
    var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
    return ranNum;
  }
  var makeWall = function (wall){
    for(var i = 0; i < 19; i++) {
      wall[i] = new Array(17);
      for(var j=0;j<17;j++){
        wall[i][j]=0;
      }
    }
    var tmp = Random(8, 14);
    for(var i = 0; i < tmp; i++) {
      var x = Random(3, 16);
      var y = Random(1, 14);
      //console.log(typeof(x)+x);
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
  var makeMap = function(map){
    map[0] = Random(8,25);
    map[1] = Random(0,2);
    return map;
  }

  var getBestScore = function(roomData){
    var max =-1;
    var temp ;

    for(var i in roomData){
      var num = parseFloat(roomData[i].score);
      if(max<num)
      {
        max = parseFloat(roomData[i].score);
        temp = roomData[i];
      }
    }
    return temp["maze"];
  }
  // connection event handler
  // connection이 수립되면 event handler function의 인자로 socket인 들어온다
  io.set('heartbeat interval', 2000);//2초마다 poll
  io.set('heartbeat timeout', 10000);//10초  -> discconnect호출?
  io.on('connection', function(socket) {

    socket.on('start',function(data){
      var jsonData = JSON.parse(data);
      var roomNum = jsonData.room;
      var nickname = jsonData.nickname;


      pool.getConnection((err, connection) => {
        connection.query('update user set ticket = ticket-1 where nickname = ?', nickname, (err, result) => {
          if(err) throw err;
          //ticket discount coding
          connection.release();
        });
      })

      if(rooms[roomNum]===undefined)
      {
        rooms[roomNum]={};
        rooms[roomNum]["userlist"]=[];
        rooms[roomNum]["socketID"]={};
        rooms[roomNum]["count"]=0;
      }
      //rooms[roomNum]["userlist"].push(nickname);
      rooms[roomNum]["userlist"].push({"nickname": nickname, "score": "0", "maze": "0"});
      rooms[roomNum]["socketID"][socket.id]=nickname;
      rooms[roomNum]["count"]+=1;

      console.log("userCnt: ",  rooms[roomNum]["count"]);

      if(rooms[roomNum]["count"]===MAX_USER)
      {
        var map = new Array(2);
        map = new makeMap(map);
        var wall = new Array(19);
        wall = JSON.stringify(makeWall(wall));

        var msg = {"status":"OK", "wall":wall, "map":map};
        io.sockets.in(roomNum).emit('start',msg);

        rooms[roomNum]["count"]=0;
        console.log("room: ", rooms);
        console.log("start finish");
      }
    });

    socket.on('round_end',function(data){
      //roomnum, nickname
      //모든점수, 다음 맵정보, 1등맵정보
      var jsonData = JSON.parse(data);

      var roomNum = jsonData.room
      var nickname = jsonData.nickname;

      console.log(nickname,"가 들어왔습니다");

      for(var i in rooms[roomNum]["userlist"]){
        if(rooms[roomNum]["userlist"][i]["nickname"]==nickname){
          rooms[roomNum]["userlist"][i]["score"]=jsonData.score;
          rooms[roomNum]["userlist"][i]["maze"]=jsonData.maze;
          break;
        }
      }

      //rooms[roomNum]["userlist"].push({"nickname": nickname, "score":jsonData.score, "maze":jsonData.maze});

      if(rooms[roomNum]["count"]===undefined){
        rooms[roomNum]["count"]=1;
      }
      else {
        rooms[roomNum]["count"]+=1;
      }
      if(rooms[roomNum]["giveuplist"] === undefined) {
        user_cnt = rooms[roomNum]["count"];
      }
      else {
        user_cnt =rooms[roomNum]["count"]+Object.keys(rooms[roomNum]["giveuplist"]).length;
      }
      console.log("test: ", rooms[roomNum]);
      if(user_cnt===MAX_USER){ //&& Object.keys(rooms[roomNum]["userlist"]).length != 0){
        var map = new Array(2);
        map = new makeMap(map);
        var wall = new Array(19);
        wall = JSON.stringify(makeWall(wall));

        var roomData= rooms[roomNum]["userlist"];
        console.log("round_end: ",roomData);

        var maze = getBestScore(roomData);

        for(var i in roomData){
          delete roomData[i].maze;
        }

        if(rooms[roomNum]["giveuplist"]!==undefined){
          for(var i in rooms[roomNum]["giveuplist"]){
            var tmpJson = rooms[roomNum]["giveuplist"][i];
            tmpJson["score"]=0;
            roomData.push(tmpJson);
          }
        }

        var msg = {"status":"OK", "info":roomData,"best":maze,"wall":wall, "map":map};
        io.sockets.in(roomNum).emit('round_end',msg);
        rooms[roomNum]["count"]=0;
        console.log("round_end finish");
      }
    });

  socket.on('giveup',function(data){
    console.log("give-up")
    var jsonData = JSON.parse(data);
    var nickname = jsonData.nickname;
    var roomNum = jsonData.room;

    if(rooms[roomNum]["giveuplist"]===undefined){
      rooms[roomNum]["giveuplist"]=[];
    }

    rooms[roomNum]["giveuplist"].push({"nickname":nickname})


    for(var i in rooms[roomNum]["userlist"]){
        if(rooms[roomNum]["userlist"][i]["nickname"]==nickname){
          var tmp = rooms[roomNum]["userlist"].splice(i,1);
          console.log("nickname del: ",tmp);
          break;
        }
    }

    delete rooms[roomNum]["socketID"][socket.id];
    user_cnt =rooms[roomNum]["count"]+Object.keys(rooms[roomNum]["giveuplist"]).length;

    socket.leave(roomNum);

    if(user_cnt===MAX_USER){
      var map = new Array(2);
      map = new makeMap(map);
      var wall = new Array(19);
      wall = JSON.stringify(makeWall(wall));

      if(Object.keys(rooms[roomNum]["giveuplist"]).length!==MAX_USER){
        var roomData= rooms[roomNum]["userlist"];
          var maze = getBestScore(roomData);

        for(var i in roomData){
            delete roomData[i].maze;
        }

        for(var i in rooms[roomNum]["giveuplist"]){
            var tmpJson = rooms[roomNum]["giveuplist"][i];
            tmpJson["score"]=0;
            roomData.push(tmpJson);
        }
        var msg = {"status":"OK", "info":roomData,"best":maze,"wall":wall, "map":map};
        io.sockets.in(roomNum).emit('round_end',msg);
        console.log("msg: ",msg);

      }
      else{
          var roomData = [];
          var maze = "";
          if(rooms[roomNum]!=undefined)
            delete rooms[roomNum];
      }
    }

    pool.getConnection((err, connection) => {
      connection.query('select * from user where nickname = ?', nickname, (err, result) => {
        if(err) throw err;
        var win = result[0].win;
        var loss = result[0].loss + 1;
        var score = result[0].score;
        var ticket = result[0].ticket;
        var ticketchangedtime = result[0].last_date;

        if(score - 13 <= 0){
          score = 0;
          var params = [loss, score, nickname];
        }else {
          score -= 13;
          var params = [loss, score, nickname];
        }

        connection.query('update user set loss = ?, score = ? where nickname = ?', params, (err, result) => {
          if(err) throw err;
          var msg = {"win":win, "loss":loss, "score":score, "ticket":ticket, "time":ticketchangedtime};

          socket.emit('giveup', msg);
          connection.release();
        })
      })
    })
    //socket.disconnect();

    console.log('finish-giveup');
  })

  socket.on('game_end',function(data){
    var jsonData = JSON.parse(data);
    var nickname = jsonData.nickname;
    var roomNum = jsonData.room;
    var rank = jsonData.result;
    var score = 0;
    var win = 0;
    var loss = 0;

    console.log('game_end : ', rank);
    if(rank == 1) {
      score = 17;
      win = 1;
    }
    else if(rank == 2) {
      score = -10;
      loss = 1;
    }
    else if(rank == 3) {
      score = -8;
      loss = 1;
    }
    else {
      score = -13;
      loss = 1;
    }
    var params = [score, nickname];

    pool.getConnection((err, connection) => {
      connection.query('select * from user where nickname = ?', nickname, (err, result) => {
        if(err) throw err;
        var ticket = result[0].ticket;
        var time = result[0].last_date;
        var org_score = result[0].score;
        win += result[0].win;
        loss += result[0].loss;
        console.log('game_end testing : ', nickname, org_score, score, win, loss);
        if((org_score + score) <= 0) {
          connection.query('update user set score = 0, loss = loss+1 where nickname = ?', nickname, (err, result) => {
            if(err) throw err;
            var msg = {"ticket":ticket, "time":time, "win":win, "loss":loss, "score":0};
            socket.emit('game_end',msg);
            connection.release();
          })
        }
        else {
          if(score > 0) {
            connection.query('update user set score = score + ?, win = win + 1 where nickname = ?', params, (err, result) => {
              if(err) throw err;
              score += org_score;
              var msg = {"ticket":ticket, "time":time, "win":win, "loss":loss, "score":score};
              socket.emit('game_end',msg);
              connection.release();
            })
          }
          else {
            conn.query('update user set score = score + ?, loss = loss + 1 where nickname = ?', params, (err, result) => {
              if(err) throw err;
              score += org_score;
              var msg = {"ticket":ticket, "time":time, "win":win, "loss":loss, "score":score};
              socket.emit('game_end',msg);
              connection.release();
            })
          }
        }
      })
    })

    socket.leave(roomNum);
    if(rooms[roomNum] != undefined) {
      delete rooms[roomNum];
    }

  //  console.log('call disconnect');
  //  socket.disconnect();
    console.log('game_end finish');
  });
  //접속한 클라이언트의 정보가 수신되면


  socket.on('disconnect', function() {

    //강제종료가 됬을때만 ...
    for(var roomNum in rooms){
      var socketJson = rooms[roomNum]["socketID"];
      if(socketJson[socket.id]!=undefined){
        console.log("deleteID: ",rooms[roomNum]["socketID"][socket.id]);

        socket.leave(roomNum);

        var nickname = rooms[roomNum]["socketID"][socket.id];
        delete rooms[roomNum]["socketID"][socket.id];

        if(rooms[roomNum]["giveuplist"]===undefined){
          rooms[roomNum]["giveuplist"]=[];
        }

        rooms[roomNum]["giveuplist"].push({"nickname":nickname});


        for(var i in rooms[roomNum]["userlist"]){
            if(rooms[roomNum]["userlist"][i]["nickname"]==nickname){
              var tmp = rooms[roomNum]["userlist"].splice(i,1);
              console.log("nickname del: ",tmp);
              break;
            }
        }

        user_cnt =rooms[roomNum]["count"]+Object.keys(rooms[roomNum]["giveuplist"]).length;
        console.log("DRN: ", rooms[roomNum]["count"])

        if(user_cnt===MAX_USER){
          var map = new Array(2);
          map = new makeMap(map);
          var wall = new Array(19);
          wall = JSON.stringify(makeWall(wall));

          if(Object.keys(rooms[roomNum]["giveuplist"]).length!==MAX_USER){

            var roomData= rooms[roomNum]["userlist"];
              var maze = getBestScore(roomData);

            for(var i in roomData){
                delete roomData[i].maze;
            }

            for(var i in rooms[roomNum]["giveuplist"]){
                var tmpJson = rooms[roomNum]["giveuplist"][i];
                tmpJson["score"]=0;
                roomData.push(tmpJson);
            }
            var msg = {"status":"OK", "info":roomData,"best":maze,"wall":wall, "map":map};
            io.sockets.in(roomNum).emit('round_end',msg);
            
          }
          else{
              var roomData = [];
              var maze = "";
              if(rooms[roomNum]!=undefined)
                delete rooms[roomNum];
          }
        }

        pool.getConnection((err, connection) => {
          connection.query('select * from user where nickname = ?', nickname, (err, result) => {
            if(err) throw err;
            var loss = result[0].loss + 1;
            var score = result[0].score;

            if(score - 13 <= 0){
              score = 0;
              var params = [loss, score, nickname];
            }else {
              score -= 13;
              var params = [loss, score, nickname];
            }

            connection.query('update user set loss = ?, score = ? where nickname = ?', params, (err, result) => {
              if(err) throw err;
              connection.release();
            })
          })
        })
      }
    }
  });
});
}
