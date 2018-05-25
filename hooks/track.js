const request = require("request");
const debug = require("debug")(process.env.DEBUG_NAMESPACE + ":track");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");
const R = require("ramda");

const adapter = new FileSync(path.join(__dirname, "/../storage/db.json"));
const db = low(adapter);

module.exports = function(req, res, next) {
  if (req.path.search(/\./) !== -1) {
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
  data.user_id = req.user._json.sub;
  data.path = req.path;

  let url = db.get("track.url").value();
  if (!url) {
    debug("No track url to send.");
    return false;
  }

  url = "http://" + url + "/" + req.host.replace(".", "-") + "/_doc";
  debug("Sending track data to: %s", url);

  request(
    {
      method: "post",
      body: data,
      json: true,
      url
    },
    function(error, data) {
      if (error) {
        debug("Error: " + error);
        return false;
      }
      debug(data);
      debug("Hook success");
    }
  );

  next();
};
