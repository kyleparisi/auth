const debug = require("debug")(process.env.DEBUG_NAMESPACE);

module.exports = function(req, res, next) {
  if (res.headersSent) return next();

  if (req.user) {
    req.headers["x-user-id"] = req.user.id;
  }

  const { headers } = req.auth.config;
  if (!headers) {
    debug("No headers found for domain");
    return next();
  }

  headers.forEach(function(item, index) {
    if (index % 2 === 0) {
      debug("Adding header %s=%s", item, headers[index + 1]);
      req.headers[item] = headers[index + 1];
    }
  });

  next();
};
