const nocache = require("../nocache");

router.get("/healthz", nocache, function(req, res) {
  res.send("Ok");
});
