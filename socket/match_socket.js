module.exports = function(io) {
  matches = {};
  socket_nick = {};

  const MAX_USER = 2;
  io.on('connection', function(socket) {
    console.log('match_socket_connect: ', socket.id);

    socket.on('login', function(data) {
      var jsonData = JSON.parse(data);
      var nickname = jsonData.nickname;

      socket_nick[socket.id] = [];
      socket_nick[socket.id].push({"nickname":nickname, "room":0});
    })

    socket.on('matchFriend', function(data) {
      ;
    })

    socket.on('match_over', function(data) {
      //해당 클라의 matches에 접근(여기서 필요한거 방번호랑 닉네임)
      //생길 수 있는 문제점 : 점수가 100점 미만인 클라의 경우 계속 같은 하위 큐를 탐색, 점수가 2900점 초과하는 클라의 경우 계속 같은 상위 큐를 탐색
      // if (socket_nick[socket.id] === undefined) {
      //   return;
      // }

      console.log('match_over : ', socket_nick[socket.id]);
      var nickname = socket_nick[socket.id][0]["nickname"];
      var room = socket_nick[socket.id][0]["room"];
      var room_idx = room % 100,
        room_idx2 = Math.floor(room / 100, 0);
      var score = matches[room_idx][room_idx2][nickname].rankscore;
      var tmp_room_idx = room_idx;
      var cur_room_length = Object.keys(matches[room_idx][room_idx2]).length - 1;
      var tmp_room_length = cur_room_length;

      if (Object.keys(matches[room_idx][room_idx2]).length === 1) {
        delete matches[room_idx][room_idx2];
      } else {
        delete matches[room_idx][room_idx2][nickname];
      }

      for (var i = -1; i < 3; i += 2) {
        if (matches[room_idx + i] != undefined) {
          tmp_room_idx = room_idx + i;
          for (var j = 0; j < 10000; j++) {
            if ((matches[room_idx + i][j] != undefined) && (cur_room_length < Object.keys(matches[tmp_room_idx][j]).length) && (Object.keys(matches[room_idx + i][j]).length != MAX_USER)) {
              cur_room_length = Object.keys(matches[room_idx + i][j]).length;
              room_idx2 = j;
              if (cur_room_length == MAX_USER - 1)
                break;
            }
          }
        }
        if (cur_room_length == MAX_USER - 1) {
          break;
        }
      }

      if (cur_room_length != tmp_room_length)
        room_idx = tmp_room_idx;

      room = room_idx2 * 100 + room_idx;
      console.log("after match_over room : ", room);
      socket.join(room);
      socket_nick[socket.id][0]["room"] = room;
      if (matches[room_idx] === undefined) {
        matches[room_idx] = {};
        matches[room_idx][room_idx2] = {};
      }
      if (matches[room_idx][room_idx2] === undefined) {
        matches[room_idx][room_idx2] = {};
      }
      matches[room_idx][room_idx2][nickname] = {};
      matches[room_idx][room_idx2][nickname] = {
        "nickname": nickname,
        "rankscore": score,
        "room": room,
        "socket_id": socket.id
      };
      //  console.log('match_over : ', matches[room_idx][room_idx2], room_idx, room_idx2);
      if (Object.keys(matches[room_idx][room_idx2]).length === MAX_USER) {
        var matchData = matches[room_idx][room_idx2];
        var msg = {
          "complete": "COMPLETE",
          "info": matchData
        };
        //  console.log('match_complete : ', msg);
        io.sockets.in(room).emit('match_complete', msg);
        // for (var user in matches[room_idx][room_idx2]) {
        //   var user_socket_id = matches[room_idx][room_idx2][user].socket_id;
        //   console.log("delete socket_nick : ", user_socket_id);
        //   delete socket_nick[user_socket_id];
        // }
      }
    })

    socket.on('cancel', function(data) {
      // if (socket_nick[socket.id] === undefined)
      //   return;
      var cancel_request_msg = {
        "cancel_request": "CANCEl"
      };
      var roomNum = socket_nick[socket.id][0]["room"];
      var jsonData = JSON.parse(data);
      var nickname = jsonData.nickname;
      var score = jsonData.rankscore;
      var room_idx = roomNum % 100,
        room_idx2 = Math.floor(roomNum / 100, 0);
      var msg = {
        "complete": "COMPLETE",
        "info": "ERROR"
      };

      console.log("match_cancel : ", nickname, score);

      //socket_nick[socket.id][0]["room"] = 0;
       if (socket_nick[socket.id] != undefined)
         delete socket_nick[socket.id];

      if (matches[room_idx][room_idx2][nickname].nickname === nickname && Object.keys(matches[room_idx][room_idx2]).length === 1) {
        delete matches[room_idx][room_idx2];
        io.to(socket.id).emit('match_complete', msg);
        io.to(socket.id).emit('cancel_request', cancel_request_msg);
        socket.leave(roomNum);
      } else if (matches[room_idx][room_idx2][nickname].nickname === nickname && Object.keys(matches[room_idx][room_idx2]).length > 1) {
        delete matches[room_idx][room_idx2][nickname];
        io.to(socket.id).emit('match_complete', msg);
        io.to(socket.id).emit('cancel_request', cancel_request_msg);
        socket.leave(roomNum); //    console.log("cancel_request_msg", cancel_request_msg);
        //socket.disconnect();
      }
    })

    socket.on('disconnect', function() {
      console.log("main disconnect in : ", socket.id);
      if(socket_nick[socket.id] !== undefined){
        if(socket_nick[socket.id][0]["room"] !== 0) {
          var room = socket_nick[socket.id][0]["room"];
          var room_idx1 = room % 100;
          var room_idx2 = Math.floor(room / 100, 0);
          var nickname = socket_nick[socket.id][0]["nickname"];

          socket.leave(room);
          if(matches[room_idx1][room_idx2][nickname] !== undefined && matches[room_idx1][room_idx2] !== undefined) {
            if(Object.keys(matches[room_idx1][room_idx2]).length === 1){
              delete matches[room_idx1][room_idx2];
            }
            else {
              delete matches[room_idx1][room_idx2][nickname];
            }
          }
        }
        delete socket_nick[socket.id];
      }
      // if (socket_nick[socket.id] != undefined) {
      //   var room = socket_nick[socket.id].room;
      //   console.log("delete", socket_nick[socket.id].nickname, "in", room);
      //   var room_idx1 = room % 100;
      //   var room_idx2 = Math.floor(room / 100, 0);
      //   socket.leave(room);
      //   delete matches[room_idx1][room_idx2][socket_nick[socket.id].nickname];
      //   // delete socket_nick[socket.id];
      // }
    })

    socket.on('match', function(data) {
      var match_request_msg = {
        "match_request": "COMPLETE"
      };
      var jsonData = JSON.parse(data);
      var nickname = jsonData.nickname;
      var score = jsonData.rankscore;
      var room_idx = Math.floor(score / 100, 0);
      var room_idx2 = 0;
      var room = 0;
      var flag = 0;
      socket_nick[socket.id] = [];
      socket_nick[socket.id].push({"nickname":nickname, "room":0});

      if (matches[room_idx] === undefined) {
        matches[room_idx] = {};
        matches[room_idx][room_idx2] = {};
        matches[room_idx][room_idx2][nickname] = {};
      } else {
        for (var i = 0; i < 10000; i++) {
          if (matches[room_idx][i] != undefined) {
            if (Object.keys(matches[room_idx][i]).length != MAX_USER) {
              room_idx2 = i;
              flag = 1;
              break;
            }
          }
        }
        if (flag === 0) {
          for (var i = 0; i < 10000; i++) {
            if (matches[room_idx][i] === undefined) {
              room_idx2 = i;
              matches[room_idx][room_idx2] = {};
              break;
            }
          }
        }
        matches[room_idx][room_idx2][nickname] = {};
      }
      room = room_idx2 * 100 + room_idx; // 방번호 계산부분
      console.log("match_request : ", nickname, score, room);
      socket.join(room); //클라 해당 방번호에 join


      matches[room_idx][room_idx2][nickname] = {
        "nickname": nickname,
        "rankscore": score,
        "room": room,
        "socket_id": socket.id
      };
      socket_nick[socket.id][0]["room"] = room;
      io.to(socket.id).emit('match_request', match_request_msg);

      //console.log("match_request_msg : ",matches[room_idx][room_idx2], room, tmp);

      if (Object.keys(matches[room_idx][room_idx2]).length === MAX_USER) {
        var matchData = matches[room_idx][room_idx2];
        var msg = {
          "complete": "COMPLETE",
          "info": matchData
        };
        console.log('match_complete : ', msg);
        io.sockets.in(room).emit('match_complete', msg);
        // for (var user in matchData) {
        //   var user_socket_id = matchData[user].socket_id;
        //   console.log("delete socket_nick : ", user_socket_id);
        //   delete socket_nick[user_socket_id];
        // }
      }
    });
  });
}
