const debug = require("debug")(process.env.DEBUG_NAMESPACE);
global.debug = debug;
const express = require("express");
const authStrategy = process.env.AUTH_STRATEGY;
debug("Using auth strategy: %s", authStrategy);
const auth = require("./strategies/" + authStrategy);
const routesAuth = require("./routes/auth");
const routesApiUser = require("./routes/api/user");
const _404 = require("./handlers/404");
const error = require("./handlers/error");
const flash = require("connect-flash");
const failure = require("./handlers/failure");
const proxy = require("http-proxy-middleware");
const logProvider = require("./providers/log");
const sessionDriver = process.env.SESSION_DRIVER;
debug("Using session driver: %s", sessionDriver);
const session = require("./sessions/" + sessionDriver);
const audience = process.env.AUTH0_AUDIENCE;
audience
  ? debug("Authenticating for auth0 audience: " + audience)
  : debug("No authenticated auth0 audience");
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn();

const app = express();

app.use(session);

app.use(flash());

app.use(failure);

const strategy = auth();
app.use(strategy.initialize());
app.use(strategy.session());

app.use("/", routesAuth);
app.use("/api", routesApiUser);

function addHeader(req, res, next) {
  debug(req.user.token_type + " " + req.user.access_token);
  if (audience && req.user && req.user.token_type && req.user.access_token) {
    req.headers["Authorization"] =
      req.user.token_type + " " + req.user.access_token;
  }
  next();
}

app.use(
  "/*",
  ensureLoggedIn,
  addHeader,
  proxy({
    target: process.env.ORIGIN,
    changeOrigin: true,
    ws: true,
    logLevel: process.env.LOG_LEVEL,
    logProvider: logProvider,
    onError: error
  })
);

// # Error handlers
app.use(_404);
app.use(error);

const port = process.env.PORT;
debug("Listening on port: %s", port);
app.listen(port);
