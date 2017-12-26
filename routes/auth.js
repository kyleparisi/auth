const express = require("express");
const passport = require("passport");
const request = require("request");
const router = express.Router();
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn();
const debug = require("debug")(process.env.NAMESPACE || "app");

router.get("/status", function() {
  res.sendStatus(200);
});

router.get(
  "/login",
  passport.authenticate("auth0", {
    clientID: process.env.CLIENT_ID,
    domain: process.env.DOMAIN,
    redirectUri: process.env.CALLBACK_URL,
    audience: "https://" + process.env.DOMAIN + "/userinfo",
    responseType: "code",
    scope: "openid profile"
  }),
  function(req, res) {
    res.redirect("/");
  }
);

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

router.get(
  "/callback",
  passport.authenticate("auth0", {
    failureRedirect: "/failure"
  }),
  function(req, res) {
    res.redirect(req.session.returnTo || "/");
  }
);

router.get("/failure", function(req, res) {
  var error = req.flash("error");
  var error_description = req.flash("error_description");
  req.logout();
  res.write("error: " + error[0] + "\n");
  res.write("error description: " + error_description[0]);
  res.send();
});

router.get("/*", ensureLoggedIn, function(req, res) {
  const url = process.env.ORIGIN + req.url;
  debug("Requested url is %s", url);
  req.pipe(request(url)).pipe(res);
});

router.post("/*", ensureLoggedIn, function(req, res) {
  const url = process.env.ORIGIN + req.url;
  debug("Requested url is %s", url);
  req.pipe(request(url)).pipe(res);
});

module.exports = router;
