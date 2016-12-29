var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var secret = require('../config/secret');
var User = require('../models/users');

passport.serializeUser(function(user, done){
  done(null, user._id);
});

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});

passport.use(new FacebookStrategy(secret.facebook, function(req, token, refreshToken, profile, done){
  User.findOne({facebook: profile.id}, function(err, user){
    if(err) return done(err);

    if(user) {
      return done(null, user)
    }else{
      var newUser = new User();
      newUser.email = profile._json.email;
      newUser.facebook = profile.id;
      newUser.tokens.push({kind: 'facebook', token: token});
      newUser.profile.name = profile.displayName;
      newUser.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
      newUser.role = "fragrater";
      newUser.save(function(err){
        if(err) throw err;
        return done(null, newUser);
      });
    }
  });
}));
