const connectEnsureLoggedIn = require("connect-ensure-login");
const ensureLoggedIn = require("./ensureLoggedIn");
let next_mock;

jest.mock("connect-ensure-login", () => {
  return { ensureLoggedIn: jest.fn().mockReturnValueOnce(() => false) };
});

beforeEach(() => {
  next_mock = jest.fn();
  global.debug = jest.fn();
});

test("headers sent", () => {
  ensureLoggedIn({}, { headersSent: true }, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toHaveBeenCalledTimes(0);
});

test("no guard", () => {
  ensureLoggedIn({ auth: { config: {} } }, {}, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toHaveBeenCalledTimes(0);
});

test("guard", () => {
  ensureLoggedIn({ auth: { config: { guard: "blah" } } }, {}, next_mock);
  // 0 times since mocked
  expect(next_mock).toHaveBeenCalledTimes(0);
  expect(global.debug).toHaveBeenCalledTimes(1);
  expect(connectEnsureLoggedIn.ensureLoggedIn).toHaveBeenCalledTimes(1);
});
