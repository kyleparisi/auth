const proxy = require("http-proxy-middleware");
const logProvider = require("../providers/log");
const error = require("../handlers/error");

exports.proxy = function(req, res, next) {
  const upstream = proxy({
    target: process.env.ORIGIN,
    changeOrigin: true,
    ws: true,
    buffer: req.bufferStream,
    logLevel: process.env.LOG_LEVEL,
    logProvider: logProvider,
    onError: error
  });

  return upstream(req, res, next);
};
