const ensureLoggedIn = require("ensureLoggedIn");

module.exports = function(req, res, next) {
  if (res.headersSent) return next();

  const guard = req.auth.config.guard;
  if (!guard.length) {
    return next();
  }

  debug("Using guard strategy: %s", guard.strategy);
  ensureLoggedIn.ensureLoggedIn({ redirectTo: "/auth/" + guard.strategy })(
    req,
    res,
    next
  );
};
