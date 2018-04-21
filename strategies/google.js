var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

module.exports = function() {
  const strategy = new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CONSUMER_KEY,
      clientSecret: process.env.GOOGLE_CONSUMER_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    function(token, tokenSecret, profile, done) {
      return done(null, Object.assign({}, profile));
    }
  );

  passport.use(strategy);

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  return passport;
};
