/**
 * Client ID Metadata Documents: an https `client_id` is a URL that serves the
 * client's metadata. Fetched with SSRF guards: https only, no redirects, no
 * private/loopback addresses (checked on the address actually connected to, so
 * DNS rebinding can't slip past), 5 s timeout, 64 KB cap; cached for 5 minutes.
 */
import { type LookupAddress, type LookupOptions, lookup as dnsLookup } from "node:dns";
import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { isIP } from "node:net";
import type { ResolvedClient } from "./types.js";

const MAX_BYTES = 64 * 1024;
const TTL_MS = 5 * 60_000;
const cache = new Map<string, { at: number; client: ResolvedClient }>();

export function isMetadataClientId(clientId: string): boolean {
  return clientId.startsWith("https://");
}

function privateAddress(address: string): boolean {
  if (address.includes(":")) {
    const a = address.toLowerCase();
    return a === "::1" || a === "::" || a.startsWith("fc") || a.startsWith("fd") || a.startsWith("fe80") || a.startsWith("::ffff:127.") || a.startsWith("::ffff:10.") || a.startsWith("::ffff:192.168.");
  }
  const [a, b] = address.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

export async function assertPublicHost(hostname: string): Promise<void> {
  if (/^localhost$|\.localhost$|\.local$|\.internal$/i.test(hostname)) throw new Error("client_id host is not public");
  const addresses = isIP(hostname) ? [hostname] : (await lookup(hostname, { all: true })).map((r) => r.address);
  if (!addresses.length || addresses.some(privateAddress)) throw new Error("client_id host resolves to a private address");
}

type Resolver = (hostname: string, options: { all: true }, callback: (err: NodeJS.ErrnoException | null, addresses: LookupAddress[]) => void) => void;
type LookupCallback = (err: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void;

/**
 * A `lookup` for the socket itself: resolves, refuses private answers, and hands
 * the validated addresses to the connection, so there is no second resolution
 * an attacker's DNS could answer differently.
 */
export function publicLookup(resolve: Resolver = dnsLookup as unknown as Resolver) {
  return (hostname: string, options: LookupOptions, callback: LookupCallback): void => {
    resolve(hostname, { all: true }, (err, addresses) => {
      if (err) return callback(err, []);
      if (!addresses.length || addresses.some((a) => privateAddress(a.address))) {
        return callback(Object.assign(new Error("client_id host resolves to a private address"), { code: "EPRIVATE" }), []);
      }
      if (options?.all) return callback(null, addresses);
      callback(null, addresses[0].address, addresses[0].family);
    });
  };
}

export async function defaultFetchClientMetadata(url: string): Promise<unknown> {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") throw new Error("client_id must be an https URL");
  await assertPublicHost(parsed.hostname);
  return new Promise((resolvePromise, reject) => {
    const req = request(parsed, {
      method: "GET",
      headers: { accept: "application/json" },
      lookup: publicLookup() as never,
      timeout: 5000,
    }, (res) => {
      const status = res.statusCode ?? 0;
      if (status < 200 || status >= 300) {
        res.resume();
        reject(new Error(`client metadata fetch returned ${status}`));
        return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      res.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_BYTES) {
          req.destroy(new Error("client metadata too large"));
          return;
        }
        chunks.push(chunk);
      });
      res.on("end", () => {
        try {
          resolvePromise(JSON.parse(Buffer.concat(chunks).toString("utf8")));
        } catch {
          reject(new Error("client metadata is not valid JSON"));
        }
      });
      res.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new Error("client metadata fetch timed out")));
    req.on("error", reject);
    req.end();
  });
}

export async function resolveMetadataClient(
  clientId: string,
  fetchMetadata: (url: string) => Promise<unknown> = defaultFetchClientMetadata,
  now = Date.now(),
): Promise<ResolvedClient> {
  const hit = cache.get(clientId);
  if (hit && now - hit.at < TTL_MS) return hit.client;
  const doc = (await fetchMetadata(clientId)) as Record<string, unknown>;
  if (!doc || doc.client_id !== clientId) throw new Error("client metadata client_id does not match its URL");
  const redirects = Array.isArray(doc.redirect_uris) ? doc.redirect_uris.filter((u): u is string => typeof u === "string") : [];
  if (!redirects.length) throw new Error("client metadata has no redirect_uris");
  const client: ResolvedClient = {
    client_id: clientId,
    client_name: typeof doc.client_name === "string" ? doc.client_name.slice(0, 120) : new URL(clientId).hostname,
    redirect_uris: redirects,
    origin: "metadata-document",
  };
  cache.set(clientId, { at: now, client });
  return client;
}
