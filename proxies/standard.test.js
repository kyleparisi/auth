const index = require("./standard");
const proxy = require("http-proxy-middleware");
let next_mock;

jest.mock("http-proxy-middleware");

beforeEach(() => {
  next_mock = jest.fn();
  global.debug = jest.fn();
  jest.clearAllMocks();
});

test("headers sent", () => {
  index({}, { headersSent: true }, next_mock);
  expect(next_mock).toHaveBeenCalled();
  expect(global.debug).toHaveBeenCalledTimes(0);
});

test("proxy domain no protocol", () => {
  proxy.mockReturnValueOnce(() => true);
  index({ auth: { config: { domain: "google.com" } } }, {}, next_mock);
  expect(global.debug).toHaveBeenCalledTimes(1);
  expect(proxy).toHaveBeenCalledTimes(1);
  // todo, figure out what to da about these callbacks
  expect(proxy).toBeCalledWith({
    target: "https://google.com",
    changeOrigin: true,
    ws: true,
    logLevel: undefined,
    logProvider: expect.anything(),
    onError: expect.anything(),
    onProxyRes: expect.anything()
  });
});

test("proxy domain with protocol", () => {
  proxy.mockReturnValueOnce(() => true);
  index({ auth: { config: { domain: "https://google.com" } } }, {}, next_mock);
  expect(global.debug).toHaveBeenCalledTimes(1);
  expect(proxy).toHaveBeenCalledTimes(1);
  // todo, figure out what to da about these callbacks
  expect(proxy).toBeCalledWith({
    target: "https://google.com",
    changeOrigin: false,
    ws: true,
    logLevel: undefined,
    logProvider: expect.anything(),
    onError: expect.anything(),
    onProxyRes: expect.anything()
  });
});

test("proxy ip no protocol", () => {
  proxy.mockReturnValueOnce(() => true);
  index({ auth: { config: { ip: "127.0.0.1" } } }, {}, next_mock);
  expect(global.debug).toHaveBeenCalledTimes(1);
  expect(proxy).toHaveBeenCalledTimes(1);
  // todo, figure out what to da about these callbacks
  expect(proxy).toBeCalledWith({
    target: "http://127.0.0.1",
    changeOrigin: false,
    ws: true,
    logLevel: undefined,
    logProvider: expect.anything(),
    onError: expect.anything(),
    onProxyRes: expect.anything()
  });
});

test("proxy ip protocol", () => {
  proxy.mockReturnValueOnce(() => true);
  index({ auth: { config: { ip: "http://127.0.0.1" } } }, {}, next_mock);
  expect(global.debug).toHaveBeenCalledTimes(1);
  expect(proxy).toHaveBeenCalledTimes(1);
  // todo, figure out what to da about these callbacks
  expect(proxy).toBeCalledWith({
    target: "http://127.0.0.1",
    changeOrigin: false,
    ws: true,
    logLevel: undefined,
    logProvider: expect.anything(),
    onError: expect.anything(),
    onProxyRes: expect.anything()
  });
});
