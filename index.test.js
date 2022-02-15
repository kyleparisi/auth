const request = require("supertest");

test("fails to start", done => {
  expect(require("./index")).toThrow();
});
