module.exports = require("express-session")({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
});
