import { describe, expect, it } from "vitest";
import { AstraMcpError, toAstraMcpError } from "../../src/astra/errors.js";

const err = (props: Record<string, unknown>, message = "boom") => Object.assign(new Error(message), props);

describe("toAstraMcpError", () => {
  it("passes our errors through", () => {
    const e = new AstraMcpError("read_only", "nope");
    expect(toAstraMcpError(e)).toBe(e);
    expect(e.toPayload()).toEqual({ code: "read_only", message: "nope", retryable: false });
  });
  it.each([
    [{ name: "DataAPITimeoutError" }, "timeout", true],
    [{ name: "DataAPIHttpError", status: 401 }, "invalid_credentials", false],
    [{ name: "DevOpsAPIResponseError", status: 403 }, "forbidden", false],
    [{ name: "DataAPIHttpError", status: 429 }, "rate_limited", true],
    [{ name: "DataAPIHttpError", status: 404 }, "not_found", false],
    [{ name: "DataAPIHttpError", status: 503 }, "data_api_error", true],
    [{ name: "DevOpsAPIResponseError", status: 500 }, "devops_api_error", true],
    [{ name: "DataAPIResponseError", errorDescriptors: [{ errorCode: "COLLECTION_NOT_EXIST", message: "no such collection" }] }, "not_found", false],
    [{ name: "DataAPIResponseError", errorDescriptors: [{ errorCode: "INVALID_FILTER_EXPRESSION", message: "bad" }] }, "invalid_argument", false],
    [{ name: "DataAPIResponseError", errorDescriptors: [{ errorCode: "UNAUTHENTICATED_REQUEST", message: "x" }] }, "invalid_credentials", false],
    [{ name: "DataAPIResponseError", errorDescriptors: [{ errorCode: "SERVER_INTERNAL_ERROR", message: "x" }] }, "data_api_error", false],
    [{ code: "ENOTFOUND" }, "data_api_error", true],
  ])("maps %o to %s", (props, code, retryable) => {
    const mapped = toAstraMcpError(err(props));
    expect(mapped.code).toBe(code);
    expect(mapped.retryable).toBe(retryable);
  });
  it("sanitizes secrets out of messages", () => {
    const mapped = toAstraMcpError(new Error("failed with AstraCS:secretsecret:abc at https://host.example/path"));
    expect(mapped.toPayload().message).toBe("failed with AstraCS:*** at host.example");
  });
  it("handles non-Error values", () => {
    expect(toAstraMcpError("plain").message).toBe("plain");
    expect(toAstraMcpError(undefined).code).toBe("data_api_error");
  });
});
