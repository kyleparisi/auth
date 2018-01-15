const debug = require("debug");
var namespace = process.env.NAMESPACE;
namespace += ":proxy";

module.exports = function() {
  return {
    log: debug(namespace + ":log"),
    debug: debug(namespace + ":debug"),
    info: debug(namespace + ":info"),
    warn: debug(namespace + ":warn"),
    error: debug(namespace + ":error")
  };
};
