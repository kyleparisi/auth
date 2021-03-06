const AWS = require("aws-sdk");
const proxy = require("http-proxy-middleware");
const logProvider = require("../providers/log");
const error = require("../handlers/error");
const url = require("url");

var credentials;
var chain = new AWS.CredentialProviderChain();
chain.resolve(function(err, resolved) {
  if (err) throw err;
  else credentials = resolved;
});

exports.getCredentials = function(req, res, next) {
  return credentials.get(function(err) {
    if (err) return next(err);
    else return next();
  });
};

exports.proxy = function(req, res, next) {
  if (res.headersSent) return next();
  const ORIGIN = url.parse(process.env.ORIGIN).hostname;

  const upstream = proxy({
    target: process.env.ORIGIN,
    changeOrigin: true,
    ws: true,
    logLevel: process.env.LOG_LEVEL,
    logProvider: logProvider,
    onError: error,
    buffer: req.bufferStream,
    onProxyReq: function(proxyReq, req) {
      var endpoint = new AWS.Endpoint(ORIGIN);
      var request = new AWS.HttpRequest(endpoint);
      request.method = proxyReq.method;
      request.path = proxyReq.path;
      request.region = "us-east-1";
      if (Buffer.isBuffer(req.body)) request.body = req.body;
      if (!request.headers) request.headers = {};
      request.headers["presigned-expires"] = false;
      request.headers["Host"] = ORIGIN;

      var signer = new AWS.Signers.V4(request, "es");
      signer.addAuthorization(credentials, new Date());

      proxyReq.setHeader("Host", request.headers["Host"]);
      proxyReq.setHeader("X-Amz-Date", request.headers["X-Amz-Date"]);
      proxyReq.setHeader("Authorization", request.headers["Authorization"]);
      if (request.headers["x-amz-security-token"])
        proxyReq.setHeader(
          "x-amz-security-token",
          request.headers["x-amz-security-token"]
        );
    },
    onProxyRes: function(proxyRes, req, res) {
      res.proxyRes = proxyRes;
      next();
    }
  });

  return upstream(req, res, next);
};
