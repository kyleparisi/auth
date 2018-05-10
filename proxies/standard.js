const proxy = require("http-proxy-middleware");
const logProvider = require("../providers/log");
const error = require("../handlers/error");
const findOrigin = require("../origins/index");

module.exports = function(req, res, next) {
  if (res.headersSent) return next();

  const upstream = proxy({
    target: findOrigin(req),
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
