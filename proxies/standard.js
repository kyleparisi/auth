const proxy = require("http-proxy-middleware");
const logProvider = require("../providers/log");
const error = require("../handlers/error");
const debug = require("debug")(process.env.DEBUG_NAMESPACE);

module.exports = function(req, res, next) {
  if (res.headersSent) return next();

  const { domain, ip } = req.auth.config;
  let target = false;

  if (domain) {
    target = "https://" + domain;
  }

  if (ip) {
    target = "http://" + ip;
  }

  debug("Sending proxy request");
  const upstream = proxy({
    target,
    changeOrigin: true,
    ws: true,
    buffer: req.bufferStream,
    logLevel: process.env.LOG_LEVEL,
    logProvider: logProvider,
    onError: error,
    onProxyRes: function(proxyRes, req, res) {
      res.proxyRes = proxyRes;
      next();
    }
  });

  return upstream(req, res, next);
};
