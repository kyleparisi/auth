const passport = require("passport");
const Auth0Strategy = require("passport-auth0");

module.exports = function() {
  const strategy = new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL: process.env.AUTH0_CALLBACK_URL,
      successReturnToOrRedirect: process.env.SUCCESS_RETURN_TO,
      scope: process.env.AUTH0_SCOPE
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
      return done(null, Object.assign({}, extraParams, profile));
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
