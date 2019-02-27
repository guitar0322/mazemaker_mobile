module.exports=function(app){
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;
  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
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
  var googleCredentials = require('google.json');

  passport.use(new GoogleStrategy({
      clientID: googleCredentials.web.client_id,
      clientSecret: googleCredentials.web.client_secret,
      callbackURL: googleCredentials.web.redirect_uris
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOrCreate({googleId: profile.id}, function(err, user) {
        return done(err, user);
      });
    }
  ));
  app.get('google/auth')
  return passport
}
