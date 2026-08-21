// The /authorize consent page: collects the user's Astra token + endpoint once.
// Self-contained HTML in the plugin's style; credentials are posted straight back to
// /authorize and sealed into the authorization code — never stored.

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export interface AuthorizePageModel {
  clientName: string;
  hidden: Record<string, string>;
  error?: string;
  endpoint?: string;
  keyspace?: string;
}

export function renderAuthorizePage(m: AuthorizePageModel): string {
  const hidden = Object.entries(m.hidden)
    .map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`)
    .join("\n      ");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Connect Astra DB</title>
<style>
:root{--accent:#7C3AED;--accent-soft:#EDE9FE;--accent-text:#4C1D95;--bg:#F9FAFB;--card:#fff;--text:#111827;--text-2:#4B5563;--text-3:#6B7280;--border:#E5E7EB;--danger:#B91C1C;--danger-bg:#FEF2F2}
@media(prefers-color-scheme:dark){:root{--accent:#A78BFA;--accent-soft:#2E1065;--accent-text:#DDD6FE;--bg:#0B0F19;--card:#111827;--text:#F9FAFB;--text-2:#D1D5DB;--text-3:#9CA3AF;--border:#374151;--danger:#FCA5A5;--danger-bg:#450A0A}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;display:flex;justify-content:center;padding:48px 16px}
.card{width:100%;max-width:460px;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:26px 28px}
h1{font-size:20px;font-weight:600;margin:0 0 4px}p{margin:0 0 14px;color:var(--text-2);font-size:14px}
label{display:block;font-size:13px;color:var(--text-2);margin:14px 0 6px}input[type=text],input[type=password],input[type=url]{width:100%;font:inherit;font-size:14px;padding:9px 11px;border:1px solid var(--border);border-radius:9px;background:var(--bg);color:var(--text)}
input:focus{outline:2px solid var(--accent);outline-offset:1px;border-color:transparent}
button{margin-top:18px;width:100%;font:inherit;font-size:15px;font-weight:600;padding:11px;border:0;border-radius:10px;background:var(--accent);color:#fff;cursor:pointer}
.chip{display:inline-block;padding:2px 9px;border-radius:999px;font-size:12px;background:var(--accent-soft);color:var(--accent-text);margin-bottom:12px}
.err{background:var(--danger-bg);color:var(--danger);border-radius:9px;padding:9px 11px;font-size:13px;margin-top:12px}
.fine{font-size:12px;color:var(--text-3);margin-top:14px}
</style></head>
<body><form class="card" method="post" action="/authorize" autocomplete="off">
  <span class="chip">${esc(m.clientName)}</span>
  <h1>Connect Astra DB</h1>
  <p>Enter a Database Administrator token and your database's Data API endpoint. They are encrypted into the access token handed back to <strong>${esc(m.clientName)}</strong> and never stored on this server.</p>
  ${m.error ? `<div class="err">${esc(m.error)}</div>` : ""}
  <label for="token">Application token</label>
  <input id="token" name="token" type="password" placeholder="AstraCS:…" required autocomplete="off">
  <label for="endpoint">Data API endpoint</label>
  <input id="endpoint" name="endpoint" type="url" placeholder="https://…apps.astra.datastax.com" value="${esc(m.endpoint ?? "")}" required>
  <label for="keyspace">Keyspace <span style="color:var(--text-3)">(optional)</span></label>
  <input id="keyspace" name="keyspace" type="text" placeholder="default_keyspace" value="${esc(m.keyspace ?? "")}">
  ${hidden}
  <button type="submit">Connect</button>
  <div class="fine">Read-only tools only (overview, collection card, similarity search, explorer). Revoke access any time by rotating the token in the Astra console.</div>
</form></body></html>`;
}
