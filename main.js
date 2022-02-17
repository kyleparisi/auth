const express = require("express");
const flash = require("connect-flash");
const R = require("ramda");
const failure = require("./handlers/failure");
const routesAuth = require("./routes/auth");
const routesGoogle = require("./routes/google");
const routesApiUser = require("./routes/api/user");
const routesHealthz = require("./routes/api/healthz");
const findOrigin = require("./origins");
const ensureLoggedIn = require("./origins/guards/ensureLoggedIn");
const guards = require("./origins/guards");
const addHeaders = require("./origins/addHeaders");
const proxy = require("./proxies/standard");
const hook = require("./hooks/track");
const localAuth = require("./strategies/local-dynamodb");

function main(db) {
  if (!db) {
    throw new Error("db not defined");
  }
  const sessionDriver = R.pathOr(
    process.env.SESSION_DRIVER,
    ["session", "driver"],
    db
  );
  const session = require("./sessions/" + sessionDriver);

  const authStrategy = "google";
  const auth = require("./strategies/" + authStrategy);
  const strategy = auth(db);

  const localStrategy = localAuth();
  const app = express();
  app.set("view engine", "pug");
  app.set("views", "./routes/views");
  app.use(function(req, res, next) {
    req.start = new Date().toString();
    next();
  });
  app.use(session);
  app.use(flash());
  app.use(failure);
  app.use(strategy.initialize());
  app.use(strategy.session());
  app.use(localStrategy.initialize());
  app.use(localStrategy.session());

  app.use("/", routesAuth, routesGoogle);
  app.use("/api", routesApiUser, routesHealthz);
  app.use(
    "/*",
    findOrigin(db),
    ensureLoggedIn,
    guards,
    addHeaders,
    proxy,
    hook(db)
  );
  return app;
}

module.exports = main;
