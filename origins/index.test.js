const index = require("./index");

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
const origin = index(defaultConfig);
let next_mock, res_mock;

beforeEach(() => {
  global.debug = jest.fn();
  next_mock = jest.fn();
  res_mock = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  };
});

test("header sent", () => {
  origin({}, { headersSent: true }, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toBeCalledTimes(0);
});

test("404 origin", () => {
  origin({ headers: { host: "blah" } }, res_mock, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toBeCalledTimes(6);
  expect(res_mock.status).toBeCalledWith(404);
  expect(res_mock.send).toBeCalledWith("No origin found.");
});

test("matching rule", () => {
  const req = { headers: { host: "localhost:8080" } };
  origin(req, res_mock, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toBeCalledTimes(6);
  expect(res_mock.status).toBeCalledTimes(0);
  expect(res_mock.send).toBeCalledTimes(0);
  const expected_config = {
    domain: "google.com",
    guard_emails: undefined,
    headers: {},
    ip: undefined
  };
  expect(req.auth.config).toEqual(expected_config);
});

test("caching host", () => {
  const req = { headers: { host: "localhost:8080" } };
  origin(req, res_mock, next_mock);
  global.debug = jest.fn();
  next_mock = jest.fn();
  origin(req, res_mock, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toBeCalledTimes(4);
  const expected_config = {
    domain: "google.com",
    guard_emails: undefined,
    headers: {},
    ip: undefined
  };
  expect(req.auth.config).toEqual(expected_config);
});
