const request = require("request");
const debug = require("debug")(process.env.DEBUG_NAMESPACE + ":track");
const R = require("ramda");
const _ = require("lodash");

module.exports = function(db) {
  return function(req, res, next) {
    if (req.path.search(/\./) !== -1) {
      return;
    }

    if (req.path === "/status") {
      return;
    }

    debug("Setting up track data.");

    const start = new Date(req.start);
    const now = new Date();
    const data = {};
    data.request = {};
    data.headers = req.headers;
    data.start = start.toISOString();
    data.end = now.toISOString();
    data.delta = now - start;
    data.response = {};
    data.status = res.status;
    data.message = res.statusMessage;
    data.proxy_status = R.path(["proxyRes", "statusCode"], res);
    data.proxy_message = R.path(["proxyRes", "statusMessage"], res);
    data.user_id = R.pathOr(0, ["user", "_json", "sub"], req);
    data.path = req.path;

    let url = _.get(db, "track.url");
    if (!url) {
      debug("No track url to send.");
      return false;
    }

    url = "http://" + url + "/" + req.hostname.replace(/\./g, "-") + "/_doc";
    debug("Sending track data to: %s", url);

    request(
      {
        method: "post",
        body: data,
        json: true,
        url
      },
      function(error) {
        if (error) {
          debug("Error: " + error);
          return false;
        }
        debug("Hook success");
      }
    );

    next();
  };
};
