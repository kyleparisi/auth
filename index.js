require("./config/env");
const main = require("./main");

const debug = require("debug")(process.env.DEBUG_NAMESPACE);
global.debug = debug;
let db;
try {
  db = require("./storage/db.json");
} catch (err) {
  console.log(err.message);
  debug("Please run administration first: npm run start:admin");
  process.exit(1);
}

app = main(db);
app.listen(process.env.PORT);

module.exports = app;
