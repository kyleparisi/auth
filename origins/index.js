const debug = require("debug")(process.env.DEBUG_NAMESPACE);
const R = require("ramda");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const addHeaders = require("./addHeaders");
const path = require("path");
const guards = require("./guards/index");
const ensureLoggedIn = require("connect-ensure-login");

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
        debug("Found match: %s", rules[i]);
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
    return false;
  }

  addHeaders(req, originCache[host]);

  const guard = originCache[host].guard;
  if (guard && Object.keys(guard).length) {
    debug("Using guard strategy: %s", guard.strategy);
    ensureLoggedIn.ensureLoggedIn({ redirectTo: "/auth/" + guard.strategy })(
      req,
      res,
      next
    );

    let { emails } = req.user;
    emails = emails.map(email => email.value);
    const match = emails.diff(guard.emails);
    if (!match.length) {
      debug("No guard match found for user: %s", emails);
      res.send(401, "Route guarded.  Unauthorized.");
      return false;
    }

    debug("User guard match found: %s", emails);
  }

  return origin;
};
