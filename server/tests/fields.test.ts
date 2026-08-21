import { describe, expect, it } from "vitest";
import { displayDocument, pickDisplayFields, round, snippet, summarizeFields } from "../src/core/fields.js";
import { sanitizeErrorMessage } from "../src/core/errors.js";

describe("fields", () => {
  it("prefers title-like string fields and skips hidden keys", () => {
    const doc = { _id: "1", $vector: [1], score: 3, body: "long", title: "T", flag: true, url: "u" };
    expect(pickDisplayFields(doc)).toEqual(["title", "body", "url"]);
    expect(pickDisplayFields({ _id: "1", n: 1 })).toEqual(["n"]);
  });

  it("snips long values and flattens whitespace", () => {
    expect(snippet("a  b\n c")).toBe("a b c");
    expect(snippet("x".repeat(200), 10)).toBe("xxxxxxxxx…");
    expect(snippet({ a: 1 })).toBe('{"a":1}');
  });

  it("rounds and summarizes", () => {
    expect(round(0.123456)).toBe(0.123);
    const summary = summarizeFields([{ a: 1, b: "x", $vector: [] }, { a: 2 }]);
    expect(summary).toEqual([
      { name: "a", type: "number", present: 2 },
      { name: "b", type: "string", present: 1 },
    ]);
  });

  it("display documents drop $vector and snip long strings", () => {
    const out = displayDocument({ $vector: [1, 2], text: "y".repeat(500), n: 1 });
    expect(out).not.toHaveProperty("$vector");
    expect((out.text as string).length).toBeLessThan(500);
    expect(out.n).toBe(1);
  });

  it("sanitizes tokens and endpoints in error messages", () => {
    const msg = sanitizeErrorMessage("failed AstraCS:abc:def at https://x.apps.astra.datastax.com/api/json?x=1");
    expect(msg).toBe("failed AstraCS:*** at x.apps.astra.datastax.com");
  });
});
