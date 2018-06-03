const R = require("ramda");

module.exports = function(req, res, next) {
  if (res.headersSent) return next();

  const guard = req.auth.config.guard;
  if (!guard) {
    return next();
  }

  let { emails } = R.pathOr({ emails: false }, ["user"], req);
  if (!emails) {
    debug("No req emails found for user.");
    res.status(401).send("Route guarded.  Unauthorized.");
    return next();
  }
  emails = emails.map(email => email.value);
  const match = emails.diff(guard.emails);
  if (!match.length) {
    debug("User's email did not match the guard");
    res
      .status(401)
      .send("Route guarded.  Unauthorized.  Please login with correct user.");
  }

  debug("User guard match found: %s", emails);
  next();
};
