var app = require('./config/express')();
var router = require('./router/index');

var server = require('http').createServer(app);
var io = require('socket.io')(server);

require('./socket/ingame_socket')(io);
require('./socket/match_socket')(io);

app.use(router);
//app.use('/',register);
app.listen(8080, function(){
  process.stdout.write('Connected 8080 port!' +'\n');
});
server.listen(8088, function() {
  process.stdout.write('Socket IO server listening on port 8088' +'\n');
});
