const express = require("express");
const router = express.Router();
const nocache = require("./nocache");
const bodyParser = require("body-parser");
const passport = require("passport");

router.get("/status", nocache, function(req, res) {
  res.sendStatus(200);
});

router.get("/signup", nocache, function(req, res) {
  res.render("signup", { message: { error: "" }, user: { email: "" } });
});

router.post(
  "/signup",
  nocache,
  bodyParser.urlencoded({ extended: true }),
  passport.authenticate("local-signup", { failureRedirect: "/signup" })
);

router.get("/logout", nocache, function(req, res) {
  req.logout();
  res.redirect("/login");
});

router.get("/failure", nocache, function(req, res) {
  var error = req.flash("error");
  var error_description = req.flash("error_description");
  req.logout();
  res.write("error: " + error[0] + "\n");
  res.write("error description: " + error_description[0]);
  res.send();
});

module.exports = router;
