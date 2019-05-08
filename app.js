var app = require('./config/express')();
var router = require('./router/index');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

require('./socket/ingame_socket')(io);
require('./socket/match_socket')(io);

app.use(router);
//app.use('/',register);
app.listen(8081, function(){
  console.log('Connected 8080 port!');
});
server.listen(8089, function() {
  console.log('Socket IO server listening on port 8088');
});
