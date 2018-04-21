const proxy = require("http-proxy-middleware");
const logProvider = require("../providers/log");
const error = require("../handlers/error");
const debug = require("debug")(process.env.DEBUG_NAMESPACE);

exports.proxy = function(req, res, next) {
  if (res.headersSent) return next();

  const targets = {
    // [regex]: target
    rules: {},
    default: process.env.ORIGIN
  };

  const rules = Object.keys(targets.rules);
  var target = targets.default;
  for (var i = 0; i < rules.length; i++) {
    const regExp = rules[i];
    if (req.baseUrl.match(regExp)) {
      target = targets.rules[regExp];
      break;
    }
  }

  debug("Setting target: %s", target);

  const upstream = proxy({
    target: target,
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
