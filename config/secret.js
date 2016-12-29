module.exports = {
  database: 'mongodb://localhost:27017/fragrater',
  secretKey: 'Alex12931wer23',
  facebook: {
    clientID: '1614069665565570',
    clientSecret: '2b3ac5aaae3f8fc9c570885b89979894',
    profileFields: ['email', 'displayName'],
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    passReqToCallback: true,

  }

};
