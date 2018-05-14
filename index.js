const debug = require("debug")(process.env.DEBUG_NAMESPACE);
try {
  require("./storage/db.json");
} catch ($err) {
  debug("Please run administration first");
  process.exit(1);
}
global.debug = debug;
const express = require("express");
const authStrategy = process.env.AUTH_STRATEGY;
const auth = require("./strategies/" + authStrategy);
const routesAuth = require("./routes/auth");
const routesGoogle = require("./routes/google");
const routesApiUser = require("./routes/api/user");
const flash = require("connect-flash");
const failure = require("./handlers/failure");
const sessionDriver = process.env.SESSION_DRIVER;
const session = require("./sessions/" + sessionDriver);
const audience = process.env.AUTH0_AUDIENCE;
const bodyParser = require("body-parser");
const stream = require("stream");
const originIsAwsDomain = process.env.ORIGIN.search("amazonaws.com") !== -1;

let hook = function() {};
if (process.env.HOOK_NAME) {
  hook = require("./hooks/" + process.env.HOOK_NAME);
}

let proxy = require("./proxies/standard");

debug("Using auth strategy: %s", authStrategy);
debug("Using session driver: %s", sessionDriver);
audience
  ? debug("Authenticating for auth0 audience: %s", audience)
  : debug("No authenticated auth0 audience");
debug("Listening on port: %s", process.env.PORT);

const strategy = auth();
const app = express();
app.use(function(req, res, next) {
  req.start = new Date().toString();
  next();
});
app.use(session);
app.use(flash());
app.use(failure);
app.use(
  bodyParser.raw({
    type: function() {
      return true;
    }
  })
);
if (originIsAwsDomain) app.use(proxy.getCredentials);
app.use(strategy.initialize());
app.use(strategy.session());
app.use("/", routesAuth, routesGoogle);
app.use("/api", routesApiUser);
app.use(function(req, res, next) {
  if (Buffer.isBuffer(req.body)) {
    let bufferStream = new stream.PassThrough();
    bufferStream.end(req.body);
    req.bufferStream = bufferStream;
  }

  next();
});

function addHeader(req, res, next) {
  if (res.headersSent) return next();
  if (audience && req.user && req.user.token_type && req.user.access_token) {
    req.headers["Authorization"] =
      req.user.token_type + " " + req.user.access_token;
  }
  next();
}

app.use("/*", addHeader, proxy, hook);

app.listen(process.env.PORT);
