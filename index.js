const debug = require("debug")(process.env.NAMESPACE || "app");
const express = require("express");
const auth = require("./strategies/" + (process.env.AUTH_STRATEGY || "auth0"));
const session = require("./sessions/" +
  (process.env.SESSION_DRIVER || "memory"));
const routes = require("./routes/auth");
const _404 = require("./handlers/404");
const error = require("./handlers/error");
const flash = require("connect-flash");
const failure = require("./handlers/failure");
const proxy = require("http-proxy-middleware");
const logProvider = require("./providers/log");
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn();

const app = express();

app.use(session);

app.use(flash());

app.use(failure);

const strategy = auth();
app.use(strategy.initialize());
app.use(strategy.session());

app.use("/", routes);
app.use(
  "/*",
  ensureLoggedIn,
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

const port = process.env.PORT || 3000;
debug("Listening on port %s", port);
app.listen(port);
