const debug = require("debug")(process.env.DEBUG_NAMESPACE);

module.exports = function(req, origin) {
  const { headers } = origin;

  if (!headers) {
    debug("No headers found for domain");
    return false;
  }

  origin.headers.forEach(function(item, index) {
    if (index % 2 === 0) {
      debug("Adding header %s=%s", item, origin.headers[index + 1]);
      req.headers[item] = origin.headers[index + 1];
    }
  });
};
