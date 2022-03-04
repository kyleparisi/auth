const addHeaders = require("./addHeaders");
let next_mock, res_mock;

beforeEach(() => {
  next_mock = jest.fn();
  global.debug = jest.fn();
  res_mock = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  };
});

test("headers sent", () => {
  addHeaders({}, { headersSent: true }, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toHaveBeenCalledTimes(0);
});

test("no headers", () => {
  addHeaders({ auth: { config: {} } }, {}, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toHaveBeenCalledTimes(1);
});

test("user id headers", () => {
  const req = { user: { id: 10 }, headers: {}, auth: { config: {} } };
  addHeaders(req, {}, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toHaveBeenCalledTimes(1);
  expect(req.headers["x-user-id"]).toEqual(10);
});

test("adding headers", () => {
  const req = { headers: {}, auth: { config: { headers: ["test", "test"] } } };
  addHeaders(req, {}, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toHaveBeenCalledTimes(1);
  expect(req.headers.test).toEqual("test");
});
