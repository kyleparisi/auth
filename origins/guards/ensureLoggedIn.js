const ensureLoggedIn = require("connect-ensure-login");

module.exports = function(req, res, next) {
  if (res.headersSent) return next();

  const guard = req.auth.config.guard;
  if (!guard) {
    return next();
  }

  const { domain, ip } = req.auth.config;

  if (domain) {
    guard.strategies.callbackURL =
      "https://" + domain + "/auth/google/callback";
  }

  if (ip) {
    guard.strategies.callbackURL = "http://" + domain + "/auth/google/callback";
  }

  debug("Using guard strategy: %s", guard.strategy);
  ensureLoggedIn.ensureLoggedIn({ redirectTo: "/auth/" + guard.strategy })(
    req,
    res,
    next
  );
};
