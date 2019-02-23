module.exports = function(io) {
  var matches = {};
  var socket_nick = {};

  io.on('connection', function(socket) {
  //  console.log('match_socket: ',socket.id);
    socket.on('cancel', function(data){
      var cancel_request_msg = {"cancel_request":"CANCEl"};
      var jsonData = JSON.parse(data);
      var nickname = jsonData.nickname;
      var score = jsonData.rankscore;
      var room_idx = Math.floor(score/100, 0);
      var msg = {"complete":"COMPLETE", "info":"ERROR"};

      console.log(nickname, score);

      if(socket_nick[socket.id] != undefined)
        delete socket_nick[socket.id];

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
          else if(matches[room_idx][i][nickname].nickname === nickname && Object.keys(matches[room_idx][i]).length > 1) {
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
      room = tmp*100+room_idx; // 방번호 계산부분
      socket.join(room); //클라 해당 방번호에 join

      matches[room_idx][tmp][nickname] = {"nickname":nickname, "rankscore":score, "room":room, "socket_id":socket_id};
      socket_nick[socket_id] = {};
      socket_nick[socket_id] = {"nickname":nickname};

      io.to(socket_id).emit('match_request', match_request_msg);

      console.log("match_request : ",matches[room_idx][tmp][nickname], room, Object.keys(matches[room_idx][tmp]).length);

      if(Object.keys(matches[room_idx][tmp]).length === 2) {
        var matchData = matches[room_idx][tmp];
        var msg = {"complete":"COMPLETE", "info":matchData};
        console.log('match_complete : ', msg);
        io.sockets.in(room).emit('match_complete', msg);
        delete socket_nick[socket_id];
        delete matches[room_idx][tmp];
        socket.disconnect();
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
      //console.log('user disconnected: ' + socket.id);
      console.log('match_disconnected : ',socket_nick[socket.id]);
      var flag = 0;
      if(socket_nick[socket.id] != undefined) {
        var nickname = socket_nick[socket.id].nickname;
        delete socket_nick[socket.id];
        for(var i = 0; i < 30; i++) {
          if(matches[i] != undefined) {
            for(var j = 0; j < 10000; j++) {
              if(matches[i][j] != undefined && matches[i][j][nickname] != undefined && matches[i][j][nickname].nickname === nickname) {
                console.log("before delete match_que : ", matches[i][j]);
                if(Object.keys(matches[i][j]).length === 1) {
                  delete matches[i][j];
                  delete socket_nick[socket.id];
                  console.log("after delete match_que : ", matches[i][j]);
                  break;
                }
                else if(Object.keys(matches[i][j]).length > 1) {
                  delete socket_nick[socket.id];
                  delete matches[i][j][nickname];
                  console.log("after delete match_que : ", matches[i][j]);
                  break;
                }
                flag = 1;
              }
            }
          }
          if(flag == 1)
            break;
        }
      }
      console.log("match_disconnect complete",socket_nick[socket.id]);
    });
  });
}
