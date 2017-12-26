const session = require("express-session");
const RedisStore = require("connect-redis")(session);

module.exports = session({
  store: new RedisStore({
    host: process.env.REDIS_HOST || "localhost"
  }),
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
});
