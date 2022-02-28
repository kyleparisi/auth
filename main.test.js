require("./config/env");
const request = require("supertest");
const main = require("./main");

const defaultConfig = {
  session: {
    driver: "memory"
  },
  strategies: {
    google: {
      clientID: "abc",
      clientSecret: "def"
    }
  },
  origins: {
    "localhost:8080": {
      domain: "google.com",
      ip: undefined,
      headers: {},
      guard_emails: undefined
    }
  }
};

beforeEach(() => {
  const debug = require("debug")("app");
  global.debug = debug;
});

test("does nothing", () => {
  expect(main).toThrow(Error);
});

test("starts", () => {
  db = {
    session: {
      driver: "memory"
    },
    strategies: {
      google: {
        clientID: "abc",
        clientSecret: "def"
      }
    }
  };
  const app = main(db);
  expect(app).toBeDefined();
});

test("[GET] /status", done => {
  const app = main(defaultConfig);
  request(app)
    .get("/status")
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
      done();
    });
});

test("[GET] /api/user requires login", done => {
  const app = main(defaultConfig);
  request(app)
    .get("/api/user")
    .expect(302)
    .expect("Location", "/login")
    .end(function(err, res) {
      if (err) throw err;
      done();
    });
});

test("[GET] /api/user/id requires login", done => {
  const app = main(defaultConfig);
  request(app)
    .get("/api/user/id")
    .expect(302)
    .expect("Location", "/login")
    .end(function(err, res) {
      if (err) throw err;
      done();
    });
});

test("[GET] /signup", done => {
  const app = main(defaultConfig);
  request(app)
    .get("/signup")
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
      expect(res.text).toEqual(expect.stringContaining("Login"));
      done();
    });
});
