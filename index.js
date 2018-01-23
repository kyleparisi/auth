const debug = require("debug")(process.env.DEBUG_NAMESPACE);
global.debug = debug;
const express = require("express");
const authStrategy = process.env.AUTH_STRATEGY;
const auth = require("./strategies/" + authStrategy);
const routesAuth = require("./routes/auth");
const routesApiUser = require("./routes/api/user");
const flash = require("connect-flash");
const failure = require("./handlers/failure");
const sessionDriver = process.env.SESSION_DRIVER;
const session = require("./sessions/" + sessionDriver);
const audience = process.env.AUTH0_AUDIENCE;
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn();
const bodyParser = require("body-parser");
const stream = require("stream");
const originIsAwsDomain = process.env.ORIGIN.search("amazonaws.com") !== -1;
const request = require("request");

var proxy = "./proxies/standard";
if (originIsAwsDomain) {
  proxy = "./proxies/aws";
}

debug("Using proxy: %s", proxy.replace("./", ""));
debug("Using auth strategy: %s", authStrategy);
debug("Using session driver: %s", sessionDriver);
audience
  ? debug("Authenticating for auth0 audience: " + audience)
  : debug("No authenticated auth0 audience");
debug("Listening on port: %s", process.env.PORT);

proxy = require(proxy);
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
app.use("/", routesAuth);
app.use("/api", routesApiUser);
app.use(function(req, res, next) {
  if (Buffer.isBuffer(req.body)) {
    var bufferStream = new stream.PassThrough();
    bufferStream.end(req.body);
    req.bufferStream = bufferStream;
  }

  next();
});

function addHeader(req, res, next) {
  if (audience && req.user && req.user.token_type && req.user.access_token) {
    req.headers["Authorization"] =
      req.user.token_type + " " + req.user.access_token;
  }
  next();
}

app.use("/*", ensureLoggedIn, addHeader, proxy.proxy);

// # Post response actions
app.use(function(req, res) {
  if (req.path.search(/\./) !== -1) {
    return;
  }

  const start = new Date(req.start);
  const now = new Date();
  const data = {};
  data.request = {};
  data.headers = req.headers;
  data.start = start.toISOString();
  data.end = now.toISOString();
  data.delta = now - start;
  data.response = {};
  data.status = res.proxyRes.statusCode;
  data.message = res.proxyRes.statusMessage;
  data.user_id = req.user._json.sub;
  data.path = req.path;

  request(
    {
      method: "post",
      body: data,
      json: true,
      url: "http://localhost:3001"
    },
    function(error, response) {
      if (error) {
        console.log(error);
      }
      console.log(response);
    }
  );
});

app.listen(process.env.PORT);
