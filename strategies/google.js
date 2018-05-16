const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");

const adapter = new FileSync(path.join(__dirname, "/../storage/db.json"));
const db = low(adapter);

module.exports = function() {
  const strategy = new GoogleStrategy(
    db.get("strategies.google").value(),
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
