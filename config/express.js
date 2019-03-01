module.exports = function(){
  var express = require('express');
  var bodyParser = require('body-parser');
  var session = require('express-session');//메모리에 session정보를 저장함.
  var MySQLStore = require('express-mysql-session')(session);
  var app = express();
  app.use(bodyParser.urlencoded({extended:false}));
  app.use(session({
    secret: 'ASDFNJ33idjfj4',
    resave: false, //session 쓸때마다 새로 발급 XX
    saveUninitialized: true,//session을 실제로 사용하기 전까지 세션 발급 X
    store:new MySQLStore({
      host:'localhost',
      port:3306,
      user:'root',
      password:'!Q2w3e4r',
      database:'miro',
      dateStrings: 'date'
    })
  }));
  return app;
}
