module.exports = function(io) {
  matches = {};
  var socket_nick = {};
  const MAX_USER = 2;
  io.on('connection', function(socket) {
  //  console.log('match_socket: ',socket.id);

    socket.on('match_over', function(data){
        //해당 클라의 matches에 접근(여기서 필요한거 방번호랑 닉네임)
        //생길 수 있는 문제점 : 점수가 100점 미만인 클라의 경우 계속 같은 하위 큐를 탐색, 점수가 2900점 초과하는 클라의 경우 계속 같은 상위 큐를 탐색

        //console.log('match_over : ', socket_nick[socket.id]);
        var nickname = socket_nick[socket.id].nickname;
        var room = socket_nick[socket.id].room;
        var room_idx = room % 100, room_idx2 = Math.floor(room / 100, 0);
        var score = matches[room_idx][room_idx2][nickname].rankscore;
        var tmp1 = 0, tmp2 = 0;

        if(Object.keys(matches[room_idx][room_idx2]).length === 1) {
          delete matches[room_idx][room_idx2];
        }
        else {
          delete matches[room_idx][room_idx2][nickname];
        }

        for(var i = 0; i < 3; i++) {
          if(matches[room_idx+i] != undefined) {
            tmp2 = room_idx+i;
            for(var j = 0; j < 10000; j++) {
              if((matches[room_idx+i][j] != undefined) && (Object.keys(matches[room_idx+i][j]).length >= 1) && (tmp1 < Object.keys(matches[room_idx+i][j]).length)) {
                tmp1 = Object.keys(matches[room_idx+i][j]).length;
                room_idx2 = j;
              }
            }
          }
          if(tmp1 != 0) {
            break;
          }
        }

        if(tmp1 === 0) {
          for(var i = 0; i < 10000; i++) {
            if((matches[room_idx][i] != undefined) && (Object.keys(matches[room_idx][i]).length >= 1) && (tmp1 < Object.keys(matches[room_idx][i]).length)) {
              tmp1 = Object.keys(matches[room_idx][i]).length;
              room_idx2 = i;
            }
          }
        }
        else {
          room_idx = tmp2;
        }
        room = room_idx2*100+room_idx;
        socket.join(room);
        socket_nick[socket.id].room = room;
        if(matches[room_idx] === undefined) {
          matches[room_idx] = {};
          matches[room_idx][room_idx2] = {};
        }
        if(matches[room_idx][room_idx2] === undefined) {
          matches[room_idx][room_idx2] = {};
        }
        matches[room_idx][room_idx2][nickname] = {};
        matches[room_idx][room_idx2][nickname] = {"nickname":nickname, "rankscore":score, "room":room, "socket_id":socket.id};
      //  console.log('match_over : ', matches[room_idx][room_idx2], room_idx, room_idx2);
        if(Object.keys(matches[room_idx][room_idx2]).length === MAX_USER) {
          var matchData = matches[room_idx][room_idx2];
          var msg = {"complete":"COMPLETE", "info":matchData};
        //  console.log('match_complete : ', msg);
          io.sockets.in(room).emit('match_complete', msg);
        }
    })

    socket.on('cancel', function(data){
      var cancel_request_msg = {"cancel_request":"CANCEl"};
      var roomNum = socket_nick[socket.id].room;
      var jsonData = JSON.parse(data);
      var nickname = jsonData.nickname;
      var score = jsonData.rankscore;
      var room_idx = roomNum % 100, room_idx2 = Math.floor(roomNum / 100, 0);
      var msg = {"complete":"COMPLETE", "info":"ERROR"};

    //  console.log("match_cancel : ",nickname, score);

      if(socket_nick[socket.id] != undefined)
        delete socket_nick[socket.id];

      if(matches[room_idx][room_idx2][nickname].nickname === nickname && Object.keys(matches[room_idx][room_idx2]).length === 1) {
        delete matches[room_idx][room_idx2];
        io.to(socket.id).emit('match_complete', msg);
        io.to(socket.id).emit('cancel_request', cancel_request_msg);
        socket.leave(roomNum);
        //  console.log("cancel_request_msg : ",cancel_request_msg);
        //socket.disconnect();
      }
      else if(matches[room_idx][room_idx2][nickname].nickname === nickname && Object.keys(matches[room_idx][room_idx2]).length > 1) {
        delete matches[room_idx][room_idx2][nickname];
        io.to(socket.id).emit('match_complete', msg);
        io.to(socket.id).emit('cancel_request', cancel_request_msg);
        socket.leave(roomNum);      //    console.log("cancel_request_msg", cancel_request_msg);
        //socket.disconnect();
      }
    })

    socket.on('match', function(data){
      var match_request_msg = {"match_request":"COMPLETE"};
      var jsonData = JSON.parse(data);
      var nickname = jsonData.nickname;
      var score = jsonData.rankscore;
      var room_idx = Math.floor(score/100, 0);
      var tmp = 0;
      var room = 0;
      var flag = 0;

  //    console.log("match_start : ", nickname, score);

      if(matches[room_idx] === undefined) {
        matches[room_idx] = {};
        matches[room_idx][tmp] = {};
        matches[room_idx][tmp][nickname] = {};
      }
      else {
        for(var i = 0; i < 10000; i++) {
          if(matches[room_idx][i] != undefined) {
            if(Object.keys(matches[room_idx][i]).length == 1) {
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

      matches[room_idx][tmp][nickname] = {"nickname":nickname, "rankscore":score, "room":room, "socket_id":socket.id};
      socket_nick[socket.id] = {};
      socket_nick[socket.id] = {"nickname":nickname, "room":room};

      io.to(socket.id).emit('match_request', match_request_msg);

      console.log("match_request_msg : ",matches[room_idx][tmp], room, tmp);

      if(Object.keys(matches[room_idx][tmp]).length === MAX_USER) {
        var matchData = matches[room_idx][tmp];
        var msg = {"complete":"COMPLETE", "info":matchData};
        console.log('match_complete : ', msg);
        io.sockets.in(room).emit('match_complete', msg);
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
      console.log('user_match disconnected: ' + socket.id);
      var flag = 0;
      if(socket_nick[socket.id] != undefined) {
        var nickname = socket_nick[socket.id].nickname;
        var room = socket_nick[socket.id].room;
        var room_idx = room % 100, room_idx2 = Math.floor(room / 100, 0);
        delete socket_nick[socket.id];
        if(Object.keys(matches[room_idx][room_idx2]).length === 1) {
          delete matches[room_idx][room_idx2];
          socket.leave(room);
        }
        else if(Object.keys(matches[room_idx][room_idx2]).length > 1) {
          delete matches[room_idx][room_idx2][nickname];
          socket.leave(room);
        }
        /*for(var i = 0; i < 30; i++) {
          if(matches[i] != undefined) {
            for(var j = 0; j < 10000; j++) {
              if(matches[i][j] != undefined && matches[i][j][nickname] != undefined && matches[i][j][nickname].nickname === nickname) {
                if(Object.keys(matches[i][j]).length === 1) {
                  delete matches[i][j];
                  delete socket_nick[socket.id];
                  socket.leave(room);
                  break;
                }
                else if(Object.keys(matches[i][j]).length > 1) {
                  delete socket_nick[socket.id];
                  delete matches[i][j][nickname];
                  socket.leave(room);
                  break;
                }
                flag = 1;
              }
            }
          }
          if(flag == 1)
            break;
        }*/
      }
    });
  });
}
