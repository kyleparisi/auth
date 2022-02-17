const express = require("express");
const router = express.Router();
const nocache = require("../nocache");

router.get("/healthz", nocache, function(req, res) {
  res.send("Ok");
});

module.exports = router;
