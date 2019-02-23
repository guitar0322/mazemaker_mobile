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
  //  console.log("ingame_socket: ", socket.id);

    socket.on('start',function(data){
      console.log('origin: ',data);

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
        console.log("UNDEFINED");
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
        map[0] = Random(8,25);
        map[1] = Random(0,2);


        wall = JSON.stringify(wall);

        var msg = {"status":"OK", "wall":wall, "map":map};
        io.sockets.in(roomNum).emit('start',msg);


        rooms[roomNum]["userlist"]=[];

        console.log("room: ", rooms);
        console.log("finish");
      }
    });

    socket.on('round_end',function(data){
      //roomnum, nickname
      //모든점수, 다음 맵정보, 1등맵정보
      var jsonData = JSON.parse(data);

      var roomNum = jsonData.room
      var nickname = jsonData.nickname;
      var user_cnt = 0;

      console.log("####ROUND_END");
      console.log(nickname,"가 들어왔습니다");
      console.log('rn: ',rooms);

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
        //console.log("info: ", rooms[roomNum]["info"]);
        var roomData= rooms[roomNum]["userlist"];

        console.log("round_end: ",roomData);
        var max =-1;
        var temp ;

        for(var i in roomData){
          //console.log(typeof(roomData[i].score));
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
        console.log("msg: ",msg);
        rooms[roomNum]["userlist"]=[];
  //      rooms[roomNum]["userlist"]=[];
        console.log("round_end finish");
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

      console.log('game_end : ', rank);
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
        console.log('game_end testing : ', nickname, org_score, score, win, loss);
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
      console.log('call disconnect');
      socket.disconnect();
      console.log('game_end finish');
    });
    //접속한 클라이언트의 정보가 수신되면

    socket.on('giveup',function(data){
      console.log("give-up")
      var jsonData = JSON.parse(data);
      var nickname = jsonData.nickname;
      var roomNum = jsonData.room;

      if(rooms[roomNum]["giveuplist"] === undefined) {
        rooms[roomNum]["giveuplist"] = [];
      }
      rooms[roomNum]["giveuplist"].push({"nickname": nickname});
      socket.leave(roomNum);

      socket.disconnect();
      console.log('finish-giveup');
    })


    socket.on('disconnect', function() {
    //  console.log("force: ", socket);
    //  console.log('user disconnected: ' + socket.id);
      for(var i in rooms){
        var socketJson = rooms[i]["socketID"];
        if(socketJson[socket.id]!=undefined){
      //    console.log("deleteID: ",rooms[i]["socketID"][socket.id]);
          if(rooms[i]["giveuplist"]===undefined){
            rooms[i]["giveuplist"]=[];
          }
          rooms[i]["giveuplist"].push({"nickname":rooms[i]["socketID"][socket.id]})
            delete rooms[i]["socketID"][socket.id];
        //    console.log("view room: ",rooms[i]);
        }
      }

    });
  });
}
