import { mkdtempSync, readFileSync, readdirSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DataAPIVector, ObjectId, UUID, oid, uuid } from "@datastax/astra-db-ts";
import { describe, expect, it } from "vitest";
import { alternativeIds, coerceId, idToString } from "../../src/astra/ids.js";
import { fromJson, toJsonSafe } from "../../src/astra/serialize.js";
import { renderStandalone, writeHtmlFile } from "../../src/widgets/html-file.js";

const U = "0190b2c4-7a3e-7c1d-9f00-5d3c2b1a0e9f";
const O = "66f1c0ffee0123456789abcd";

describe("ids", () => {
  it("coerces by explicit type, by the collection's default id, and from extended JSON", () => {
    expect(coerceId(U, "uuid")).toBeInstanceOf(UUID);
    expect(coerceId(O, "objectId")).toBeInstanceOf(ObjectId);
    expect(coerceId(U, "auto", "uuidv7")).toBeInstanceOf(UUID);
    expect(coerceId(O, "auto", "objectId")).toBeInstanceOf(ObjectId);
    expect(coerceId(U, "auto", "string")).toBe(U);
    expect(coerceId(U, "auto")).toBe(U);
    expect(coerceId("not-a-uuid", "uuid")).toBe("not-a-uuid");
    expect(coerceId({ $uuid: U })).toBeInstanceOf(UUID);
    expect(coerceId({ $objectId: O })).toBeInstanceOf(ObjectId);
    expect(coerceId({ pk: 1 })).toEqual({ pk: 1 });
    expect(coerceId(42)).toBe(42);
  });

  it("offers typed alternatives for id-shaped strings only", () => {
    expect(alternativeIds(U)[0]).toBeInstanceOf(UUID);
    expect(alternativeIds(O)[0]).toBeInstanceOf(ObjectId);
    expect(alternativeIds("doc-1")).toEqual([]);
    expect(alternativeIds(7)).toEqual([]);
  });

  it("renders any id as a stable string", () => {
    expect(idToString("a")).toBe("a");
    expect(idToString(null)).toBe("");
    expect(idToString(uuid(U))).toBe(U);
    expect(idToString({ product: "lamp", id: 1 })).toBe('{"product":"lamp","id":1}');
    expect(idToString(12)).toBe("12");
  });
});

describe("serialize", () => {
  it("makes Data API values JSON-safe", () => {
    class Point {
      toString() {
        return "POINT(1 2)";
      }
    }
    const out = toJsonSafe({
      u: uuid(U), o: oid(O), d: new Date(0), v: new DataAPIVector([1, 2, 3]), n: 10n,
      m: new Map([["k", 1]]), s: new Set([1, 2]), a: [undefined], p: new Point(), nested: { x: 1 },
    });
    expect(out).toEqual({
      u: { $uuid: U }, o: { $objectId: O }, d: { $date: 0 }, v: { $vector: "[3 dims]" }, n: "10",
      m: { k: 1 }, s: [1, 2], a: [null], p: "POINT(1 2)", nested: { x: 1 },
    });
    let deep: unknown = "leaf";
    for (let i = 0; i < 20; i++) deep = { deep };
    expect(JSON.stringify(toJsonSafe(deep))).toContain("[…]");
  });

  it("revives extended JSON in filters and documents", () => {
    const revived = fromJson({ _id: { $uuid: U }, ref: { $objectId: O }, at: { $date: 0 }, list: [{ $uuid: U }], both: { $uuid: U, extra: 1 } }) as Record<string, unknown>;
    expect(revived._id).toBeInstanceOf(UUID);
    expect(revived.ref).toBeInstanceOf(ObjectId);
    expect(revived.at).toEqual(new Date(0));
    expect((revived.list as unknown[])[0]).toBeInstanceOf(UUID);
    expect(revived.both).toEqual({ $uuid: U, extra: 1 });
    expect(fromJson("x")).toBe("x");
  });
});

describe("standalone HTML", () => {
  it("inlines the data without letting it break out of the script tag", () => {
    const html = renderStandalone({ title: "</script><script>alert(1)</script>" });
    expect(html).toContain("window.__ASTRA_DATA__");
    expect(html).not.toContain("</script><script>alert(1)");
  });

  it("writes private files and prunes old and excess ones", () => {
    const dir = mkdtempSync(join(tmpdir(), "astra-html-test-"));
    const now = Date.now();
    const stale = join(dir, "old.html");
    writeFileSync(stale, "old");
    utimesSync(stale, new Date(now - 48 * 3600_000), new Date(now - 48 * 3600_000));
    for (let i = 0; i < 55; i++) {
      const file = join(dir, `f${i}.html`);
      writeFileSync(file, "x");
      utimesSync(file, new Date(now - i * 1000), new Date(now - i * 1000));
    }
    const path = writeHtmlFile("overview", { view: "overview" }, dir, now);
    expect(readFileSync(path, "utf8")).toContain("__ASTRA_DATA__");
    if (process.platform !== "win32") expect(statSync(path).mode & 0o777).toBe(0o600);
    const left = readdirSync(dir);
    expect(left).not.toContain("old.html");
    expect(left.length).toBeLessThanOrEqual(51);
  });
});
