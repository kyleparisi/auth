const debug = require("debug")(process.env.DEBUG_NAMESPACE);
const R = require("ramda");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");

const originCache = {};
const adapter = new FileSync(path.join(__dirname, "/../storage/db.json"));
const db = low(adapter);

Array.prototype.diff = function(arr2) {
  var ret = [];
  for (var i in this) {
    if (arr2.indexOf(this[i]) > -1) {
      ret.push(this[i]);
    }
  }
  return ret;
};

module.exports = function(req, res, next) {
  const host = req.headers["host"];
  const origins = db.get("origins").value();
  const rules = Object.keys(origins);

  debug("Finding origin based on host: %s", host);
  debug("Rules available: %s", rules);

  let origin = false;

  if (originCache[host]) {
    debug("Using cached host: %j", originCache[host]);
    if (originCache[host].ip) {
      origin = "http://" + originCache[host].ip;
    }

    if (originCache[host].domain) {
      origin = "https://" + originCache[host].domain;
    }
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
    if (ip) {
      origin = "http://" + ip;
      debug("Using origin: %s", origin);
    }

    const domain = R.path([host, "domain"], originCache);
    if (domain) {
      origin = "https://" + domain;
      debug("Using origin: %s", origin);
    }
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
