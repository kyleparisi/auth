const express = require("express");
const router = express.Router();
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn();
const nocache = require("../nocache");

router.get("/user", ensureLoggedIn, nocache, function(req, res) {
  res.send(req.user);
});

module.exports = router;
