const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const _ = require("lodash");

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
db_path = path.join(__dirname, "/storage/db.json");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/administration"));

app.get("/", (req, res) =>
  res.render("index", { title: "Hey", message: "Hello there!" })
);

app.get("/origins", (req, res) => {
  const db_buffer = fs.readFileSync(db_path);
  const db = JSON.parse(db_buffer.toString());
  console.log(_.get(db, "origins"));
  res.render("origins", { origins: _.get(db, "origins") });
});

app.post("/origins/save", (req, res) => {
  const { regex_key, domain, ip, guard_emails } = req.body;
  let { headers } = req.body;

  headers = headers.filter(header => (header ? header : false));

  let db_buffer = fs.readFileSync(db_path);
  let db = JSON.parse(db_buffer.toString());
  _.set(db, "session", { driver: "memory" });
  _.set(db, "strategies", {
    google: {
      clientID: "abc",
      clientSecret: "def"
    }
  });
  _.set(db, `origins.["${regex_key}"]`, { domain, ip, headers, guard_emails });
  fs.writeFileSync(db_path, JSON.stringify(db, null, 2));
  console.log(req.body, db);
  res.redirect("/");
});

app.listen(3001, () => console.log("Admin dashboard listening on port 3001!"));
