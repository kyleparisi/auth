const express = require("express");
const router = express.Router();
const passport = require("passport");
const nocache = require("./nocache");

router.get(
  "/auth/google",
  nocache,
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login"]
  })
);

router.get(
  "/auth/google/callback",
  nocache,
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect(req.session.returnTo || "/");
  }
);

module.exports = router;
