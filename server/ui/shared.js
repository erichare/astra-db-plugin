(function(){
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const h = (tag, attrs, ...children) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (v !== undefined && v !== null && v !== false) el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of children.flat()) {
      if (c === null || c === undefined || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  };
  const fmt = (n) => (n === null || n === undefined) ? "—" : Number(n).toLocaleString();
  const pct = (x) => `${Math.round(x * 100)}%`;
  const chip = (text, kind) => h("span", { class: `chip ${kind || ""}` }, text);
  const json = (v) => h("pre", { class: "json" }, JSON.stringify(v, null, 2));
  const vectorLabel = (v) => v ? `${v.dimension ?? "?"}d · ${v.metric ?? "?"}` : null;
  const srSummary = (text) => h("h2", { class: "sr-only" }, text);
  const errorBox = (msg) => h("div", { class: "error" }, msg);
  window.AstraUI = { esc, h, fmt, pct, chip, json, vectorLabel, srSummary, errorBox };
})();
