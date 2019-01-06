var app = require('./config/express')();
var router = require('./router/index');
//var register = require('./router/register')();
app.use(router);
//app.use('/',register);
app.listen(8080, function(){
  console.log('Connected 8080 port!');
});
