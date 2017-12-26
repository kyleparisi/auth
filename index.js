require("dotenv").config();

const debug = require("debug")(process.env.NAMESPACE || "app");
const express = require("express");
const auth = require("./strategies/" + (process.env.AUTH_STRATEGY || "auth0"));
const session = require("./sessions/" + (process.env.SESSION_DRIVER || "memory"));
const routes = require("./routes/auth");
const _404 = require("./handlers/404");
const error = require("./handlers/error");
const flash = require("connect-flash");
const failure = require("./handlers/failure");

const app = express();

app.use(session);

app.use(flash());

app.use(failure);

const strategy = auth();
app.use(strategy.initialize());
app.use(strategy.session());

app.use("/", routes);

// # Error handlers
app.use(_404);
app.use(error);

const port = process.env.PORT || 3000;
debug("Listening on port %s", port);
app.listen(port);
