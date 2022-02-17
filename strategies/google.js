const passport = require("passport");
const _ = require("lodash");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

module.exports = function(db) {
  const googleStrategy = _.get(db, "strategies.google");
  googleStrategy.callbackURL = "/auth/google/callback";

  const strategy = new GoogleStrategy(googleStrategy, function(
    token,
    tokenSecret,
    profile,
    done
  ) {
    return done(null, Object.assign({}, profile));
  });

  passport.use(strategy);

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  return passport;
};
