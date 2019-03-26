var app = require('./config/express')();
var router = require('./router/index');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

require('./socket/ingame_socket')(io,conn);
require('./socket/match_socket')(io,conn);

app.use(router);
//app.use('/',register);
app.listen(8080, function(){
  console.log('Connected 8080 port!');
});
server.listen(8088, function() {
  console.log('Socket IO server listening on port 8088');
});
