module.exports  = function (err, req, res) {
  if (process.env.NODE_ENV === "development") {
      res.status(err.status || 500);
      res.write("Message: %s", err.message);
      res.write("error: %s", err);
      res.send();
      return false;
  }

  // no stacktraces leaked to user
  res.status(err.status || 500);
  res.write("Message: %s", err.message);
  res.send();

};
