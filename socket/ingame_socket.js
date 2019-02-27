var conn = require('../config/db');
module.exports=function(io){
  var rooms = {};

  var Random = (min, max) => {
    var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
    return ranNum;
  }
  // connection event handler
  // connection이 수립되면 event handler function의 인자로 socket인 들어온다
  io.on('connection', function(socket) {
  //  process.stdout.write("ingame_socket: ", socket.id);

    socket.on('start',function(data){
      process.stdout.write('origin: ',data +'\n');

      var jsonData = JSON.parse(data);
      var roomNum = jsonData.room;
      var nickname = jsonData.nickname;




      socket.join(roomNum);

      conn.query('update user set ticket = ticket-1 where nickname = ?', nickname, (err, result) => {
        if(err) throw err;
        //ticket discount coding
      });

      if(rooms[roomNum]===undefined)
      {
        process.stdout.write("UNDEFINED" +'\n');
        rooms[roomNum]={};
        rooms[roomNum]["userlist"]=[];
        rooms[roomNum]["socketID"]={};
      }
      //rooms[roomNum]["userlist"].push(nickname);
      rooms[roomNum]["userlist"].push({"nickname": nickname});
      rooms[roomNum]["socketID"][socket.id]=nickname;

      if(Object.keys(rooms[roomNum]["userlist"]).length===2)
      {
        var map = new Array();
        var wall = new Array();
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
          //process.stdout.write(typeof(x)+x);
          if(wall[x][y] === 1 || wall[x][y+1] === 1 || wall[x-1][y] === 1 || wall[x-1][y+1] === 1) {
            i--;
          } else {
            wall[x][y] = 1;
            wall[x][y+1] = 1;
            wall[x-1][y] = 1;
            wall[x-1][y+1] = 1;
          }
        }
        map[0] = Random(8,25);
        map[1] = Random(0,2);


        wall = JSON.stringify(wall);

        var msg = {"status":"OK", "wall":wall, "map":map};
        io.sockets.in(roomNum).emit('start',msg);


        rooms[roomNum]["userlist"]=[];

        process.stdout.write("room: ", rooms +'\n');
        process.stdout.write("finish" +'\n');
      }
    });

    socket.on('round_end',function(data){
      //roomnum, nickname
      //모든점수, 다음 맵정보, 1등맵정보
      var jsonData = JSON.parse(data);

      var roomNum = jsonData.room
      var nickname = jsonData.nickname;
      var user_cnt = 0;

      process.stdout.write("####ROUND_END" +'\n');
      process.stdout.write(nickname,"가 들어왔습니다" +'\n');
      process.stdout.write('rn: ',rooms +'\n');

      if(rooms[roomNum]["userlist"]===undefined){
          rooms[roomNum]["userlist"]=[];
      }
      rooms[roomNum]["userlist"].push({"nickname": nickname, "score":jsonData.score, "maze":jsonData.maze});

      if(rooms[roomNum]["giveuplist"] === undefined) {
        user_cnt = Object.keys(rooms[roomNum]["userlist"]).length;
      }
      else {
        user_cnt =Object.keys(rooms[roomNum]["userlist"]).length+Object.keys(rooms[roomNum]["giveuplist"]).length;
      }

      if(user_cnt===2){
        //process.stdout.write("info: ", rooms[roomNum]["info"]);
        var roomData= rooms[roomNum]["userlist"];

        process.stdout.write("round_end: ",roomData +'\n');
        var max =-1;
        var temp ;

        for(var i in roomData){
          //process.stdout.write(typeof(roomData[i].score));
          var num = parseFloat(roomData[i].score);
          if(max<num)
          {
            max = parseFloat(roomData[i].score);
            temp = roomData[i];
          }
        }
        var maze = temp["maze"];


        var map = new Array();
        var wall = new Array();
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
          //process.stdout.write(typeof(x)+x);
          if(wall[x][y] === 1 || wall[x][y+1] === 1 || wall[x-1][y] === 1 || wall[x-1][y+1] === 1) {
            i--;
          } else {
            wall[x][y] = 1;
            wall[x][y+1] = 1;
            wall[x-1][y] = 1;
            wall[x-1][y+1] = 1;
          }
        }
        map[0] = Random(8,25);
        map[1] = Random(0,2);

        wall = JSON.stringify(wall);

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
        process.stdout.write("msg: ",msg +'\n');
        rooms[roomNum]["userlist"]=[];
  //      rooms[roomNum]["userlist"]=[];
        process.stdout.write("round_end finish" +'\n');
      }

    });

    socket.on('game_end',function(data){
      var jsonData = JSON.parse(data);
      var nickname = jsonData.nickname;
      var roomNum = jsonData.room;
      var rank = jsonData.result;
      var score = 0;
      var win = 0;
      var loss = 0;

      process.stdout.write('game_end : ', rank +'\n');
      if(rank == 1) {
        score = 17;
        win = 1;
      }
      else if(rank == 2) {
        score = 11;
        win = 1;
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

      conn.query('select * from user where nickname = ?', nickname, (err, result) => {
        if(err) throw err;
        var ticket = result[0].ticket;
        var time = result[0].last_date;
        var org_score = result[0].score;
        win += result[0].win;
        loss += result[0].loss;
        process.stdout.write('game_end testing : ', nickname, org_score, score, win, loss +'\n');
        if((org_score + score) <= 0) {
          conn.query('update user set score = 0, loss = loss+1 where nickname = ?', nickname, (err, result) => {
            if(err) throw err;
            var msg = {"ticket":ticket, "time":time, "win":win, "loss":loss, "score":0};
            socket.emit('game_end',msg);
            //io.sockets.in(roomNum).emit('game_end',msg);
            //return res.json(msg);
          })
        }
        else {
         if(score > 0) {
            conn.query('update user set score = score + ?, win = win + 1 where nickname = ?', params, (err, result) => {
              if(err) throw err;
              score += org_score;
              var msg = {"ticket":ticket, "time":time, "win":win, "loss":loss, "score":score};
              socket.emit('game_end',msg);
              //return res.json(msg);
            })
          }
          else {
            conn.query('update user set score = score + ?, loss = loss + 1 where nickname = ?', params, (err, result) => {
              if(err) throw err;
              score += org_score;
              var msg = {"ticket":ticket, "time":time, "win":win, "loss":loss, "score":score};
              socket.emit('game_end',msg);
              //return res.json(msg);
            })
          }
        }
      })

      if(rooms[roomNum] != undefined) {
        delete rooms[roomNum];
      }
      socket.leave(roomNum);
      process.stdout.write('call disconnect' +'\n');
      socket.disconnect();
      process.stdout.write('game_end finish' +'\n');
    });
    //접속한 클라이언트의 정보가 수신되면

    socket.on('giveup',function(data){
      process.stdout.write("give-up" +'\n')
      var jsonData = JSON.parse(data);
      var nickname = jsonData.nickname;
      var roomNum = jsonData.room;

      if(rooms[roomNum]["giveuplist"] === undefined) {
        rooms[roomNum]["giveuplist"] = [];
      }
      rooms[roomNum]["giveuplist"].push({"nickname": nickname});
      conn.query('select * from user where nickname = ?', nickname, (err, result) => {
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

        conn.query('update user set loss = ?, score = ? where nickname = ?', params, (err, result) => {
          if(err) throw err;
          var msg = {"win":win, "loss":loss, "score":score, "ticket":ticket, "time":ticketchangedtime};

          socket.emit('giveup', msg);
          socket.leave(roomNum);
          socket.disconnect();
        })
      })

      process.stdout.write('finish-giveup' +'\n');
    })


    socket.on('disconnect', function() {
    //  process.stdout.write("force: ", socket);
    //  process.stdout.write('user disconnected: ' + socket.id);
      for(var i in rooms){
        var socketJson = rooms[i]["socketID"];
        if(socketJson[socket.id]!=undefined){
      //    process.stdout.write("deleteID: ",rooms[i]["socketID"][socket.id]);
          if(rooms[i]["giveuplist"]===undefined){
            rooms[i]["giveuplist"]=[];
          }
          rooms[i]["giveuplist"].push({"nickname":rooms[i]["socketID"][socket.id]})
          var nickname = rooms[i]["socketID"][socket.id];
          conn.query('select * from user where nickname = ?', nickname, (err, result) => {
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

            conn.query('update user set loss = ?, score = ? where nickname = ?', params, (err, result) => {
              if(err) throw err;
              socket.leave(i);
              delete rooms[i]["socketID"][socket.id];
            })
          })
        //    process.stdout.write("view room: ",rooms[i]);
        }
      }
    });
  });
}
