const index = require("./track");

beforeEach(() => {
  global.debug = jest.fn();
});

test("no db config", () => {
  let result = index({})({}, {}, {});
  expect(result).toBe(false);
  expect(global.debug).toHaveBeenCalledTimes(1);
});

// todo: this feature is not worth testing right now
