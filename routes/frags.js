var express = require('express');
var router = express.Router();
var async = require('async');

var Video = require('../models/frag');
var User = require('../models/users');


/* GET users listing. */


router.get('/my-frags', isLoggedIn, function(req, res, next){
    Video.find({})
    .where('ownByUser', req.user._id)
    .exec(function(err, owner){
      if(err) return next(err);
      res.render('videos/my-frags', {owner: owner, dynamicTitle: 'My Frags'});

    });
});

router.get('/submit', isLoggedIn, function(req, res, next) {
  res.render('videos/submit-frag', {dynamicTitle: 'Overview'});
});


router.post('/submit', isLoggedIn, limitVideo, function (req, res, next){
       User.findOne({_id: req.user._id}, function (err, userfound){
               var video = new Video({
                 title : req.body.title,
                 videoLink : req.body.videoLink,
                 category : req.body.category,
                 ownByUser : req.user._id,
               });

               video.save(function (err, moreVideo){
                       userfound.myFrags.push(moreVideo); //Error : Cannot read property 'push' of undefined
                       userfound.save();
               });
               res.redirect('/dashboard')
       });
   });

   function limitVideo (req, res, next) {
    Video.findOne({ownByUser: req.user._id },{ date : 1})
    .sort({date : -1})
    .exec (function (err, data) {
         if(err) {
           return next(err);
         }
         if(!data) {
              return next(err);
         } else {
              var ONE_HOUR = 60 * 60 * 1000; // in ms
              var lastPostdate = data.date;
              if(((new Date) - lastPostdate) >= ONE_HOUR) {
                   next();
              } else {
                   return next(err);
              }
         }
    })
   }


   router.get('/report/:videoLink',isLoggedIn, function(req, res, next){
     async.waterfall([
       function(callback){
         User.findOne({_id: req.user._id}, function(err, foundUser){
           if(err) return next(err)
           callback(err, foundUser)
         })
       },
       function(foundUser, callback){
         Video.findOne({videoLink: req.params.videoLink}, function(err, reportVideo){


           if (reportVideo.reportedBy.indexOf(foundUser._id) < 0) {
             reportVideo.reports++;
             reportVideo.reportedBy.push(foundUser);
             reportVideo.save(function(err){
               if(err) return next();
             });
             res.redirect('/');
           } else {
             res.redirect('/')
           }

           if (reportVideo.reports > 4) {
             reportVideo.remove();
           }
         });
      }
     ]);
     });

     router.get('/starVote/:id',isLoggedIn, function(req, res, next){
       async.waterfall([
         function(callback){
           User.findOne({_id: req.user._id}, function(err, foundUser){
             if(err) return next(err)
             callback(err, foundUser)
           })
         },
         function(foundUser, callback){
           Video.findOne({videoLink: req.params.id}, function(err, voteFrag){

             if (voteFrag.voteBy.indexOf(foundUser._id) < 0 && foundUser.myFrags.indexOf(voteFrag._id) < 0) {
               voteFrag.votes+=3;
               voteFrag.voteBy.push(foundUser);
               voteFrag.save(function(err){
                 if(err) return next();
               });
               res.redirect('/dashboard');
             } else {
               res.redirect('/dashboard')
             }
           });
        }
       ]);
     });

   router.get('/upVote/:id',isLoggedIn, function(req, res, next){
     async.waterfall([
       function(callback){
         User.findOne({_id: req.user._id}, function(err, foundUser){
           if(err) return next(err)
           callback(err, foundUser)
         })
       },
       function(foundUser, callback){
         Video.findOne({videoLink: req.params.id, ownByUser}, function(err, voteFrag){

           if (voteFrag.voteBy.indexOf(foundUser._id) < 0 && foundUser.myFrags.indexOf(voteFrag._id) < 0) {
             voteFrag.votes++;
             voteFrag.voteBy.push(foundUser);
             voteFrag.save(function(err){
               if(err) return next();
             });
             res.redirect('/dashboard')
           } else {
             res.redirect('/dashboard')
           }
         });
      }
     ]);
   });

   router.get('/downVote/:id', isLoggedIn, function(req, res, next){
     async.waterfall([
       function(callback){
         User.findOne({_id: req.user._id}, function(err, foundUser){
           if(err) return next(err)
           callback(err, foundUser)
         })
       },
       function(foundUser, callback){
         Video.findOne({videoLink: req.params.id}, function(err, voteFrag){

           if (voteFrag.voteBy.indexOf(foundUser._id) < 0 && foundUser.myFrags.indexOf(voteFrag._id) < 0) {
             voteFrag.voteBy.push(foundUser);
             voteFrag.save(function(err){
               if(err) return next();
             });
             res.redirect('/dashboard');
           } else {
             res.redirect('/dashboard')
           }
         });
      }
     ]);
   });

  router.get('/edit-frag/:id', isLoggedIn, function(req, res, next){
    Video.findOne({videoLink: req.params.id}, function(err, findFrag){
      res.render('videos/edit-frag', {findFrag: findFrag})
    });
  });

  router.post('/edit-frag/:id', isLoggedIn, function(req, res, next){
    Video.findOne({videoLink: req.params.id}, function(err, findFrag){
      if(findFrag){
        if(req.body.title) findFrag.title = req.body.title;
        if(req.body.category) findFrag.category = req.body.category;
        if(req.body.videoLink) findFrag.videoLink = req.body.videoLink;

        findFrag.save(function(err){
          if(err) return next(err);
          res.redirect('/my-frags')
        });
      }
    });
  });



  router.get('/delete/:id',isLoggedIn, function(req, res, next){
    Video.remove({videoLink: req.params.id}, function(err, deleteVideo){
      if(err) return next();
      res.render('videos/my-frags', {owner: deleteVideo})
    });
    res.redirect('/')
  });

  router.get('/global-top', function(req, res, next){
    async.parallel([
      function(callback){
        Video.find({})
        .sort('-votes')
        .limit(3)
        .exec(function(err, allGlobal){
          callback(err, allGlobal)
        });
      },

      function(callback){
        Video.find({})
        .sort('-votes')
        .limit(10)
        .exec(function(err, allGlobal){
          callback(err, allGlobal)
        });
      },
      function(callback){
        Video.findOne({})
        .populate('ownByUser')
        .exec(function(err, foundUser){
          callback(err, foundUser);
        });
    },
    ], function(err, results){
      var top3 = results[0];
      var top10 = results[1];
      var byUser = results[2];
      res.render('videos/global-frags.ejs', {top3: top3, top10: top10, byUser: byUser, dynamicTitle: 'Global Top List', numbers: [1,2,3,4,5,6,7,8,9,10]})

    });

  });

router.get('/top-fragmovies', function(req, res, next){
  async.parallel([
    function(callback) {
      User.find({})
      .limit(5)
      .exec(function(err, allGlobal){
        callback(err, allGlobal)
      });

    },
  ], function(err, results){
    var allGlobal = results[0];
    res.render('videos/top-fragmovies', {allGlobal: allGlobal, dynamicTitle: 'MovieMaker Top List', numbers: [1,2,3,4,5,6,7,8,9,10]});
  });
});


router.get('/top-aces', function(req, res, next){
  var allAces = 'Ace';
  Video.find({})
  .where('category', allAces)
  .sort('-votes')
  .limit(8)
  .exec(function(err, aces){
    if(err) return next(err);
    res.render('videos/top-frags', {categorySort: aces, dynamicTitle: 'Top Aces'})
  });
});

router.get('/top-clutches', function(req, res, next){
  var allClutch = 'Clutch';
  Video.find({})
  .where('category', allClutch)
  .sort('-votes')
  .limit(8)
  .exec(function(err, clutch){
    if(err) return next(err);
    res.render('videos/top-frags', {categorySort: clutch, dynamicTitle: 'Top Clutches'})
  });
});

router.get('/top-ninjas', function(req, res, next){
  var allNinja = 'Ninja';
  Video.find({})
  .where('category', allNinja)
  .sort('-votes')
  .limit(8)
  .exec(function(err, ninja){
    if(err) return next(err);
    res.render('videos/top-frags', {categorySort: ninja, dynamicTitle: 'Top Ninja Defuses'})
  });
});

router.get('/top-pistol', function(req, res, next){
  var allPistol = 'Pistol';
  Video.find({})
  .where('category', allPistol)
  .sort('-votes')
  .limit(8)
  .exec(function(err, pistol){
    if(err) return next(err);
    res.render('videos/top-frags', {categorySort: pistol, dynamicTitle: 'Top Pistol'})
  });
});

router.get('/top-pros', function(req, res, next){
  var allPros = 'Pros';
  Video.find({})
  .where('category', allPros)
  .sort('-votes')
  .limit(8)
  .exec(function(err, pros){
    if(err) return next(err);
    res.render('videos/top-frags', {categorySort: pros, dynamicTitle: 'Top Pros'})
  });
});

router.get('/top-funny', function(req, res, next){
  var allFunny = 'Funny';
  Video.find({})
  .where('category', allFunny)
  .sort('-votes')
  .limit(8)
  .exec(function(err, funny){
    if(err) return next(err);
    res.render('videos/top-frags', {categorySort: funny, dynamicTitle: 'To Funny'})
  });
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
