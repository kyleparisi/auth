const debug = require("debug")(process.env.DEBUG_NAMESPACE);
const R = require("ramda");
const origins = require("../storage/db.json").origins;
const rules = Object.keys(origins);
const originCache = {};

debug("Rules available: %s", rules);

module.exports = function(req) {
  const host = req.headers["host"];
  debug("Finding origin based on host: %s", host);

  if (originCache[host]) {
    debug("Using cached host: %j", originCache[host]);
    if (originCache[host].ip) {
      return "http://" + originCache[host].ip;
    }

    if (originCache[host].domain) {
      return "https://" + originCache[host].domain;
    }
  }

  for (var i = 0; i < rules.length; i++) {
    const regExp = new RegExp(rules[i]);
    debug("Checking regex for: ", rules[i]);
    debug(regExp);
    if (host.match(regExp)) {
      debug("Found match: %s", rules[i]);
      originCache[host] = origins[rules[i]];
      break;
    }
  }

  const ip = R.path([host, "ip"], originCache);
  if (ip) {
    let origin = "http://" + ip;
    debug("Using origin: %s", origin);
    return origin;
  }

  const domain = R.path([host, "domain"], originCache);
  if (domain) {
    let origin = "https://" + domain;
    debug("Using origin: %s", origin);
    return origin;
  }

  debug("No origin found");
  return false;
};
