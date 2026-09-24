// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VIEWS } from "./fixtures.js";

async function mount(data: unknown) {
  document.documentElement.className = "";
  document.body.innerHTML = '<main id="app"></main>';
  (window as unknown as { __ASTRA_DATA__: unknown }).__ASTRA_DATA__ = data;
  vi.resetModules();
  await import("../../ui/src/main.js");
  return document.getElementById("app") as HTMLElement;
}

describe("app shell (standalone mode)", () => {
  beforeEach(() => {
    delete (window as unknown as { __ASTRA_DATA__?: unknown }).__ASTRA_DATA__;
  });

  it("renders the overview with keyspace errors and no drill-down affordances", async () => {
    const root = await mount(VIEWS.overview);
    expect(root.querySelector("h1")?.textContent).toBe("prod-db");
    expect(root.textContent).toContain("articles");
    expect(root.textContent).toContain("~12,400");
    expect(root.textContent).toContain("Keyspace unavailable (503)");
    expect(root.querySelectorAll('[role="button"]').length).toBe(0);
    expect(document.documentElement.classList.contains("standalone")).toBe(true);
  });

  it("renders the collection card without actions in standalone mode", async () => {
    const root = await mount(VIEWS.collection);
    expect(root.querySelector("h1")?.textContent).toBe("articles");
    expect(root.textContent).toContain("vectorize · nvidia/nv-embedqa-e5-v5");
    expect(root.textContent).toContain("not indexed: body");
    expect(root.querySelector("form.search")).toBeNull();
  });

  it("renders table schema with key badges and indexes", async () => {
    const root = await mount(VIEWS.table);
    expect(root.textContent).toContain("partition");
    expect(root.textContent).toContain("embedding_idx · embedding (vector)");
  });

  it("renders the explorer; rows expand with the keyboard", async () => {
    const root = await mount(VIEWS.explorer);
    const row = root.querySelector("tr.clickable") as HTMLElement;
    expect(row.getAttribute("tabindex")).toBe("0");
    expect(row.getAttribute("aria-expanded")).toBe("false");
    row.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(row.getAttribute("aria-expanded")).toBe("true");
    expect((row.nextElementSibling as HTMLElement).hidden).toBe(false);
    expect(root.textContent).toContain("filter");
  });

  it("renders similarity hits, the map toggle, and hit details", async () => {
    const root = await mount(VIEWS.similarity);
    expect(root.querySelectorAll("li.hit").length).toBe(8);
    expect(root.querySelector("h1")?.textContent).toContain("black holes evaporate");
    const [list, map] = Array.from(root.querySelectorAll("button.seg")) as HTMLButtonElement[];
    map.click();
    expect(map.getAttribute("aria-pressed")).toBe("true");
    expect((root.querySelector(".hits") as HTMLElement).hidden).toBe(true);
    expect(root.querySelectorAll("circle.star").length).toBe(8);
    list.click();
    (root.querySelector("li.hit") as HTMLElement).click();
    expect(root.querySelector(".hit-detail")?.textContent).toContain("Hawking radiation");
  });
});
