const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get("/status", function() {
  res.sendStatus(200);
});

router.get(
  "/login",
  passport.authenticate("auth0", {
    clientID: process.env.AUTH0_CLIENT_ID,
    domain: process.env.AUTH0_DOMAIN,
    redirectUri: process.env.AUTH0_CALLBACK_URL,
    audience: "https://" + process.env.AUTH0_DOMAIN + "/userinfo",
    responseType: "code",
    scope: process.env.AUTH0_SCOPE || "openid profile"
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

module.exports = router;
