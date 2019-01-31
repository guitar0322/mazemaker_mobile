var app = require('express')();
var server = require('http').createServer(app);
// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);

// localhost:3000으로 서버에 접속하면 클라이언트로 index.html을 전송한다
app.get('/', function(req, res) {
//  res.sendFile(__dirname + '/index.html');
  res.send("ok");
});


var rooms = {};

var Random = (min, max) => {
  var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
  return ranNum;
}
// connection event handler
// connection이 수립되면 event handler function의 인자로 socket인 들어온다
io.on('connection', function(socket) {
  console.log("COnnection");
  console.log(socket.id);
  var msg = {'ok':'ok'}
  //io.emit('check',JSON.stringify(msg));

  socket.on('start',function(data){
    console.log('origin: ',data);

    var jsonData = JSON.parse(data);
    var roomNum = jsonData.room;
    socket.join(roomNum);

    if(rooms[roomNum]===undefined)
      rooms[roomNum]={};

    rooms[roomNum][nickname]={};

    console.log(rooms);
    console.log(Object.key(rooms[roomNum]).length);
    if(Object.key(rooms[roomNum]).length===2)
    {
      var map = new Array();
      var wall = new Array();
      for(var i = 0; i < 19; i++) {
        wall[i] = new Array(19);
        for(var j=0;j<19;j++){
          wall[i][j]=0;
        }
      }

      var tmp = Random(8, 14);
      for(var i = 0; i < tmp; i++) {
        var x = Random(3, 16);
        var y = Random(1, 16);
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

      var msg = {"status":"OK", "wall":wall, "map":map};
      io.sockets.in(roomNum).emit('start',msg);
    }
  });

  socket.on('round_end',function(data){
    //roomnum, nickname
    //모든점수, 다음 맵정보, 1등맵정보
    var jsonData = JSON.parse(data);

    var roomNum = jsonData.room
    var nickname = jsonData.nickname;

    rooms[roomNum][nickname] = {"score":jsonData.score, "maze":jsonData.maze};

    if(Object.keys(rooms[roomNum]).length===2){
      var roomData= rooms[roomNum];
      var scoreArr = [];

      /*
      var cnt=0;
      var maze = jsonData.maze;
      for(var i in maze){
        wall[cnt++][i%19]=maze[i];
      }
      */

      for(var i in roomData)
        scoreArr.push(roomData[i].score);

      var max=Math.max(apply(null),scoreArr);


      var map = new Array();
      var wall = new Array();
      for(var i = 0; i < 19; i++) {
        wall[i] = new Array(19);
        for(var j=0;j<19;j++){
          wall[i][j]=0;
        }
      }
      var tmp = Random(8, 14);
      for(var i = 0; i < tmp; i++) {
        var x = Random(3, 16);
        var y = Random(1, 16);
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

      var msg = {"status":"OK", "info":roomData,"best":max,"wall":wall, "map":map};
      io.sockets.in(roomNum).emit('round_end',msg);
    }




    console.log(data);
  });

  socket.on('ok',function(data){

  });

  //접속한 클라이언트의 정보가 수신되면
  socket.on('match_giveup',function(data){
    socket.broadcast.emit('match_giveup', data.nickname);
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

  // force client disconnect from server
  socket.on('forceDisconnect', function() {
    console.log('1234');
    socket.disconnect();
  })

  socket.on('disconnect', function() {
    console.log('user disconnected: ' + socket.name);
  });
});

server.listen(8088, function() {
  console.log('Socket IO server listening on port 8088');
});
