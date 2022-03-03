const express = require("express");
const flash = require("connect-flash");
const R = require("ramda");
const failure = require("./handlers/failure");
const routesAuth = require("./routes/auth");
const routesGoogle = require("./routes/google");
const routesApiUser = require("./routes/api/user");
const findOrigin = require("./origins");
const ensureLoggedIn = require("./origins/guards/ensureLoggedIn");
const guards = require("./origins/guards");
const addHeaders = require("./origins/addHeaders");
const proxy = require("./proxies/standard");
const hook = require("./hooks/track");

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

  const app = express();
  app.use(function(req, res, next) {
    req.start = new Date().toString();
    next();
  });
  app.use(session);
  app.use(flash());
  app.use(failure);
  app.use(strategy.initialize());
  app.use(strategy.session());

  app.use("/", routesAuth, routesGoogle);
  app.use("/api", routesApiUser);
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
