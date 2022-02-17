require("./config/env");
const request = require("supertest");
const main = require("./main");

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
  app = main(db);
  expect(app).toBeDefined();
});

test("/api/healthz", done => {
  db = {
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
  app = main(db);
  request(app)
    .get("/api/healthz")
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
      done();
    });
});
