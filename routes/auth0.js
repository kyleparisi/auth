const express = require("express");
const passport = require("passport");
const router = express.Router();
const nocache = require("./nocache");

router.get(
  "/login",
  nocache,
  passport.authenticate("auth0", { audience: process.env.AUTH0_AUDIENCE }),
  function(req, res) {
    res.redirect("/");
  }
);

router.get("/logout", nocache, function(req, res) {
  req.logout();
  res.redirect(process.env.AUTH0_DOMAIN + "/v2/logout");
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

module.exports = router;
