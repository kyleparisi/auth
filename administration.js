const express = require("express");
const path = require("path");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const bodyParser = require("body-parser");

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const adapter = new FileSync(path.join(__dirname, "/storage/db.json"));
const db = low(adapter);
db.defaults({ origins: {} }).write();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/administration"));

app.get("/", (req, res) =>
  res.render("index", { title: "Hey", message: "Hello there!" })
);

app.get("/origins", (req, res) => {
  res.render("origins", { origins: db.get("origins").value() });
});

app.post("/origins/save", (req, res) => {
  const { regex_key, domain, ip } = req.body;
  db.set(`origins.${regex_key}`, { domain, ip }).write();
  console.log(req.body);
  res.redirect("/");
});

app.listen(3001, "localhost", () =>
  console.log("Admin dashboard listening on port http://localhost:3001!")
);
