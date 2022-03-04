const index = require("./index");
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
  index({}, { headersSent: true }, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toHaveBeenCalledTimes(0);
});

test("no guard", () => {
  index({ auth: { config: {} } }, {}, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toHaveBeenCalledTimes(0);
});

test("no emails", () => {
  index({ auth: { config: { guard: true } } }, res_mock, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toHaveBeenCalledTimes(1);
  expect(res_mock.status).toBeCalledWith(401);
  expect(res_mock.send).toBeCalledWith("Route guarded.  Unauthorized.");
});

test("no matching emails", () => {
  index(
    {
      user: { emails: [{ value: "abc@def.com" }] },
      auth: { config: { guard: { emails: ["test@test.com"] } } }
    },
    res_mock,
    next_mock
  );
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toHaveBeenCalledTimes(1);
  expect(res_mock.status).toBeCalledWith(401);
  expect(res_mock.send).toBeCalledWith(
    "Route guarded.  Unauthorized.  Please login with correct user."
  );
});

test("matching emails", () => {
  index(
    {
      user: { emails: [{ value: "test@test.com" }] },
      auth: { config: { guard: { emails: ["test@test.com"] } } }
    },
    res_mock,
    next_mock
  );
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toHaveBeenCalledTimes(1);
  expect(res_mock.status).toHaveBeenCalledTimes(0);
  expect(res_mock.send).toHaveBeenCalledTimes(0);
});
