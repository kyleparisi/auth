const express = require("express");
const passport = require("passport");
const router = express.Router();

function nocache(req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
}

router.get("/status", nocache, function(req, res) {
  res.sendStatus(200);
});

router.get("/login", nocache, passport.authenticate("auth0"), function(
  req,
  res
) {
  res.redirect("/");
});

router.get("/logout", nocache, function(req, res) {
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

router.get("/failure", nocache, function(req, res) {
  var error = req.flash("error");
  var error_description = req.flash("error_description");
  req.logout();
  res.write("error: " + error[0] + "\n");
  res.write("error description: " + error_description[0]);
  res.send();
});

module.exports = router;
