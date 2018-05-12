const debug = require("debug")(process.env.DEBUG_NAMESPACE);
const R = require("ramda");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const addHeaders = require("../origins/addHeaders");
const path = require("path");

const originCache = {};
const adapter = new FileSync(path.join(__dirname, "/../storage/db.json"));
const db = low(adapter);

module.exports = function(req) {
  const host = req.headers["host"];
  const origins = db.get("origins").value();
  const rules = Object.keys(origins);

  debug("Finding origin based on host: %s", host);
  debug("Rules available: %s", rules);

  let origin = false;
  let rule = false;

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
        debug("Found match: %s", rules[i]);
        originCache[host] = origins[rules[i]];
        rule = originCache[host];
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
    return false;
  }

  addHeaders(req, rule);

  return origin;
};
