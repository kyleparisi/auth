const proxy = require("http-proxy-middleware");
const logProvider = require("../providers/log");
const error = require("../handlers/error");
const debug = require("debug")(process.env.DEBUG_NAMESPACE);
const url = require("url");

module.exports = function(req, res, next) {
  if (res.headersSent) return next();

  const { domain, ip } = req.auth.config;
  let target = false;

  if (domain) {
    target = domain;
  }

  if (ip) {
    target = ip;
  }

  if (domain && !url.parse(domain).protocol) {
    target = "https://" + domain;
  }

  if (ip && !url.parse(ip).protocol) {
    target = "http://" + ip;
  }

  debug("Sending proxy request to: %s", target);
  const upstream = proxy({
    target,
    changeOrigin: true,
    ws: true,
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
