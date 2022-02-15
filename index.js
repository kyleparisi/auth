require("./config/env");
const debug = require("debug")(process.env.DEBUG_NAMESPACE);
let db;
try {
  db = require("./storage/db.json");
} catch (err) {
  console.log(err.message);
  debug("Please run administration first: npm run start:admin");
  process.exit(1);
}
global.debug = debug;
const R = require("ramda");
const express = require("express");
const authStrategy = "google";
const auth = require("./strategies/" + authStrategy);
const localAuth = require("./strategies/local-dynamodb");
const routesAuth = require("./routes/auth");
const routesGoogle = require("./routes/google");
const routesApiUser = require("./routes/api/user");
const flash = require("connect-flash");
const failure = require("./handlers/failure");
const sessionDriver = R.pathOr(
  process.env.SESSION_DRIVER,
  ["session", "driver"],
  db
);
const session = require("./sessions/" + sessionDriver);
const audience = process.env.AUTH0_AUDIENCE;
const findOrigin = require("./origins/index");
const addHeaders = require("./origins/addHeaders");
const guards = require("./origins/guards/index");
const ensureLoggedIn = require("./origins/guards/ensureLoggedIn");
const proxy = require("./proxies/standard");
const hook = require("./hooks/track");

debug("Using auth strategy: %s", authStrategy);
debug("Using session driver: %s", sessionDriver);
audience
  ? debug("Authenticating for auth0 audience: %s", audience)
  : debug("No authenticated auth0 audience");
debug("Listening on port: %s", process.env.PORT);

const strategy = auth();
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
app.use("/api", routesApiUser);
app.use("/*", findOrigin, ensureLoggedIn, guards, addHeaders, proxy, hook);

app.listen(process.env.PORT);
