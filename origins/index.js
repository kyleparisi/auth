const R = require("ramda");
const _ = require("lodash");
const url = require("url");

const originCache = {};

Array.prototype.diff = function(arr2) {
  var ret = [];
  for (var i in this) {
    if (arr2.indexOf(this[i]) > -1) {
      ret.push(this[i]);
    }
  }
  return ret;
};

module.exports = function(db) {
  return function(req, res, next) {
    if (res.headersSent) return next();

    const host = req.headers["host"];
    const origins = _.get(db, "origins");
    const rules = Object.keys(origins);

    debug("Finding origin based on host: %s", host);
    debug("Rules available: %s", rules);

    let origin = false;

    if (originCache[host]) {
      debug("Using cached host: %j", originCache[host]);
      const { domain, ip } = originCache[host];
      origin = ip || domain;
      if (ip && !url.parse(ip).protocol) {
        origin = "http://" + ip;
      }

      if (domain && !url.parse(domain).protocol) {
        origin = "https://" + domain;
      }
      debug("Using origin: %s", origin);
    }

    if (!origin) {
      for (let i = 0; i < rules.length; i++) {
        const regExp = new RegExp(rules[i]);
        debug("Checking regex for: ", rules[i]);
        debug(regExp);
        if (host.match(regExp)) {
          debug("Found match: %s -> %j", rules[i], origins[rules[i]]);
          originCache[host] = origins[rules[i]];
          break;
        }
      }

      const ip = R.path([host, "ip"], originCache);
      const domain = R.path([host, "domain"], originCache);
      origin = ip || domain;

      if (ip && !url.parse(ip).protocol) {
        origin = "http://" + ip;
      }
      if (domain && !url.parse(domain).protocol) {
        origin = "https://" + domain;
      }
      debug("Using origin: %s", origin);
    }

    if (!origin) {
      debug("No origin found");
      res.status(404).send("No origin found.");
      return next();
    }

    req.auth = req.auth || {};
    req.auth.config = originCache[host];
    return next();
  };
};
