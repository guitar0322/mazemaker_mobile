module.exports = function(io) {
  var matches = {};

  io.on('connection', function(socket) {
    socket.on('cancel', function(data){
      var cancel_request_msg = {"cancel_request":"CANCEl"};
      var jsonData = JSON.parse(data);
      var nickname = jsonData.nickname;
      var score = jsonData.rankscore;
      var room_idx = Math.floor(score/100, 0);
      var msg = {"complete":"COMPLETE", "info":"ERROR"};

      console.log(nickname, score);
      for(var i = 0; i < 10000; i++) {
        if(matches[room_idx][i] != undefined) {
          console.log('cancel_test',nickname ,matches[room_idx][i][nickname]);
          if(matches[room_idx][i][nickname].nickname === nickname && Object.keys(matches[room_idx][i]).length === 1) {
            delete matches[room_idx][i];
            var roomNum = i*100+room_idx;
            io.sockets.in(roomNum).emit('match_complete', msg);
            io.sockets.in(roomNum).emit('cancel_request', cancel_request_msg);
            console.log(cancel_request_msg);
            //socket.disconnect();
            break;
          }
          else if(matches[room_idx][i][nickname].nickname === nickname && Object.keys(matches[room_idx][i]).length === 2) {
            delete matches[room_idx][i][nickname];
            var roomNum = i*100+room_idx;
            io.sockets.in(roomNum).emit('match_complete', msg);
            io.sockets.in(roomNum).emit('cancel_request', cancel_request_msg);
            console.log(cancel_request_msg);
            //socket.disconnect();
            break;
          }
        }
      }
    })

    socket.on('match', function(data){
      var socket_nickname = {};
      var socket_id = socket.id;
      var match_request_msg = {"match_request":"COMPLETE"};
      var jsonData = JSON.parse(data);
      var nickname = jsonData.nickname;
      var score = jsonData.rankscore;
      var room_idx = Math.floor(score/100, 0);
      var tmp = 0;
      var room = 0;
      var flag = 0;
      console.log(nickname, score);
      if(matches[room_idx] === undefined) {
        matches[room_idx] = {};
        matches[room_idx][tmp] = {};
        matches[room_idx][tmp][nickname] = {};
      }
      else {
        for(var i = 0; i < 10000; i++) {
          if(matches[room_idx][i] != undefined) {
            if(Object.keys(matches[room_idx][tmp]).length === 1) {
              tmp = i;
              flag = 1;
              break;
            }
          }
        }
        if(flag === 0) {
          for(var i = 0; i < 10000; i++) {
            if(matches[room_idx][i] === undefined) {
              tmp = i;
              matches[room_idx][tmp] = {};
              break;
            }
          }
        }
        matches[room_idx][tmp][nickname] = {};
      }
      room = tmp*100+room_idx;
      socket.join(room);
      matches[room_idx][tmp][nickname] = {"nickname":nickname, "rankscore":score, "room":room, "socket_id":socket_id};

      io.sockets.in(room).emit('match_request', match_request_msg);

      console.log("match_request : ",matches[room_idx][tmp][nickname], room, Object.keys(matches[room_idx][tmp]).length);

      if(Object.keys(matches[room_idx][tmp]).length === 2) {
        var matchData = matches[room_idx][tmp];
        var msg = {"complete":"COMPLETE", "info":matchData};
        io.sockets.in(room).emit('match_complete', msg);
        socket.disconnet();
        delete matches[room_idx][tmp];
      }
      /*matches[idx][nickname] = {"nickname":nickname, "rankscore":score, "room":idx};

      if(Object.key(matches[idx]).length===2){
        var matchData = matches[idx];
        var msg = {"complete":"COMPLETE", "info":matchData};
        io.sockets.in(idx).emit('match_complete',msg);
      }*/
        //1 비슷한 점수대 애들 있는 지 확인
        //2 비슷한 점수대 애들이 없는 경우
          //2-1 디비에 추가 및 소켓에도 추가 후 error 송신
        //3 비슷한 점수대 애들이 있는 경우
          //3-1 3명인 경우
            //3-1-1 디비상에 클라 추가
            //3-1-2 소켓에도 추가
            //3-1-3 해당 소켓에 있는 클라들에게 정보 송신
          //3-2 그 미만의경우
            //3-2-1 디비상에 추가
            //3-2-2 해당 클라 소켓에 추가
            //3-2-3 소켓에 있는 클라들에게 error 송신
    });

    socket.on('disconnect', function() {
      console.log('user disconnected: ' + socket.id);
      //disconnect if match_complete
      //disconnect if forced
      /*for(var i = 0; i <= 30; i++) {
        if(matches[i] != undefined) {
          for(var j = 0; j <= 10000; j++) {
            if(matches[i][j] != undefined && matches[i][j][]) {
            }
          }
        }
      }*/
    });

  });
}
