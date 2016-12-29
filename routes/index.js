var express = require('express');
var router = express.Router();
var passport = require('passport');
var passportConf = require('../config/passport');
var random = require('mongoose-random');
var async = require('async');

var User = require('../models/users');
var Video = require('../models/frag');


/* GET home page. */
router.get('/', function(req, res, next) {
  async.parallel([
    function(callback){
      var filter = { voted: false};
      Video.findRandom({}, filter, { limit: 24}, function(err, foundAll){
      callback(err, foundAll);
    });
  },
  function(callback){
    Video.findOne({})
    .populate('ownByUser')
    .exec(function(err, foundUser){
      callback(err, foundUser);
    });
},

], function(err, result){
  var foundAll = result[0];
  var foundUser = result[1];
    res.render('main/index', {foundAll:foundAll, foundUser:foundUser, dynamicTitle: 'Rating Overview'});
});

});

router.get('/dashboard', isLoggedIn, function(req, res, next){
  Video.find({'voteBy': {$ne: req.user._id}, 'ownByUser': {$ne: req.user._id}}, function(err, foundUpVoted){
    if(err) return next(err);
    res.render('main/dashboard', {foundUpVoted: foundUpVoted, dynamicTitle: 'Rate Frags'});
  }).limit(24);
});


router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/dashboard',
  failureRedirect: '/'
}));


router.get('/logout', isLoggedIn, function(req, res, next){
  req.logout();
  res.redirect('/');

});

module.exports = router;

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req, res, next){
  if(!req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}
