module.exports  = function (err, req, res) {
  if (process.env.NODE_ENV === "development") {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });

      return false;
  }

  // no stacktraces leaked to user
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });

};
