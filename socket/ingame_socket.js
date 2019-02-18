module.exports=function(io){
  var conn = require('../config/db');
  require('date-utils');

  var rooms = {};

  var Random = (min, max) => {
    var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
    return ranNum;
  }
  // connection event handler
  // connection이 수립되면 event handler function의 인자로 socket인 들어온다
  io.on('connection', function(socket) {
    console.log("COnnection");
    console.log("socket: ", socket.id);

    socket.on('start',function(data){
      console.log('origin: ',data);

      var jsonData = JSON.parse(data);
      var roomNum = jsonData.room;
      var nickname = jsonData.username;

      socket.join(roomNum);

      conn.query('update user set ticket = ticket -1 where nickname = ?', nickname, (err, result) => {
        if(err) throw err;
        conn.query('select * from user where nickname = ?', nickname, (err, result) => {
          if(err) throw err;
          console.log(result[0]);
        })
      })
      if(rooms[roomNum]===undefined)
      {
        console.log("UNDEFINED");
        rooms[roomNum]={};
        rooms[roomNum]["userlist"]=[];
      }
      //rooms[roomNum]["userlist"].push(nickname);
      rooms[roomNum]["userlist"].push({"username": nickname});


      if(Object.keys(rooms[roomNum]["userlist"]).length===2)
      {
        console.log("userlist: ",rooms[roomNum]["userlist"]);
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
      var nickname = jsonData.username;
      var user_cnt = 0;

      console.log("####ROUND_END");
      console.log(nickname,"가 들어왔습니다");
      console.log('rn: ',roomNum);
      if(rooms[roomNum]["userlist"]===undefined){
          rooms[roomNum]["userlist"]=[];
      }
      rooms[roomNum]["userlist"].push({"username": nickname, "score":jsonData.score, "maze":jsonData.maze});

      if(rooms[roomNum]["giveuplist"] === undefined) {
        user_cnt = Object.keys(rooms[roomNum]["userlist"]).length;
      }
      else {
        user_cnt =Object.keys(rooms[roomNum]["userlist"]).length+Object.keys(rooms[roomNum]["giveuplist"]).length;
      }

      if(user_cnt===2){
        console.log("userlist: ",rooms[roomNum]["userlist"]);
        //console.log("info: ", rooms[roomNum]["info"]);
        var roomData= rooms[roomNum]["userlist"];
        var scoreArr = [];

        console.log("round_end: ",roomData);
        var max =-1;
        var temp ;

        for(var i in roomData){
          console.log("i: ",roomData[i]);
          //console.log(typeof(roomData[i].score));
          var num = parseFloat(roomData[i].score);
          console.log(typeof(num));
          if(max<num)
          {
            max = parseFloat(roomData[i].score);
            temp = roomData[i];
          }
        }
        var maze = temp["maze"];


        console.log("maze: ",temp);

        //var max=Math.max.apply(null,scoreArr);


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
          //console.log("i: ",roomData[i]);
          delete roomData[i].maze;
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
      var username = jsonData.username;
      var roomNum = jsonData.room;
      var rank = jsonData.result;


    });
    //접속한 클라이언트의 정보가 수신되면

    socket.on('giveup',function(data){
      var jsonData = JSON.parse(data);
      var nickname = jsonData.username;
      var roomNum = jsonData.room;

      if(rooms[roomNum]["giveuplist"] === undefined) {
        rooms[roomNum]["giveuplist"] = [];
      }
      rooms[roomNum]["giveuplist"].push({"username": nickname});
      socket.leave(roomNum);
      socket.disconnect();
    })
    // 접속한 클라이언트의 정보가 수신되면
    socket.on('login', function(data) {
      console.log('Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid);

      // socket에 클라이언트 정보를 저장한다
      socket.name = data.name;
      socket.userid = data.userid;

      // 접속된 모든 클라이언트에게 메시지를 전송한다
      io.emit('login', data.name );
    });

    // 클라이언트로부터의 메시지가 수신되면
    socket.on('chat', function(data) {
      console.log('Message from %s: %s', socket.name, data.msg);

      var msg = {
        from: {
          name: socket.name,
          userid: socket.userid
        },
        msg: data.msg
      };

      // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
      socket.broadcast.emit('chat', msg);

      // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
      // socket.emit('s2c chat', msg);

      // 접속된 모든 클라이언트에게 메시지를 전송한다
      // io.emit('s2c chat', msg);

      // 특정 클라이언트에게만 메시지를 전송한다
      // io.to(id).emit('s2c chat', data);
    });

    socket.on('finish', function() {
        //rooms내 roomNum 초기화
    })

    // force client disconnect from server
    socket.on('forceDisconnect', function() {
      console.log('1234');
      socket.disconnect();
    })

    socket.on('disconnect', function() {
    //  console.log("force: ", socket);
      console.log('user disconnected: ' + socket.id);
      rooms={};
    });
  });
}
