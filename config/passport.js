module.exports=function(app){
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;
  app.use(passport.initialize()); //passport초기화!
  app.use(passport.session()); //passport에서 세션을쓰겠다.

  passport.serializeUser(functione(user,done){
    console.log('serializeUser',user);
    done(null,user);
  });
  passport.deserializeUser(function(id,done){
    console.log('deserializeUser',id);
    var sql =
  })
  passport.use(new LocalStrategy(
    function(username, password, done){

    }
  ));
  return passport
}
