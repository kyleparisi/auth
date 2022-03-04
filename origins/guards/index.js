const R = require("ramda");

Array.prototype.diff =
  Array.prototype.diff ||
  function(arr2) {
    var ret = [];
    for (var i in this) {
      if (arr2.indexOf(this[i]) > -1) {
        ret.push(this[i]);
      }
    }
    return ret;
  };

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
    return next();
  }

  debug("User guard match found: %s", emails);
  next();
};
