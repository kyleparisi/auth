module.exports = function(req, origin) {
  if (!origin.headers.length) return false;

  origin.headers.forEach(function(item, index) {
    if (index % 2 === 0) {
      req.headers[item] = origin.headers[index + 1];
    }
  });
};
