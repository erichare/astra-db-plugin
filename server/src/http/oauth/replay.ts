/**
 * Replay store over a Redis REST API: Vercel KV / Upstash for Redis
 * (KV_REST_API_URL + KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN). Unset, the hosted server stays stateless.
 */
import type { ReplayStore } from "./types.js";

export function replayStoreFromEnv(env: NodeJS.ProcessEnv = process.env, fetchImpl: typeof fetch = fetch): ReplayStore | undefined {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return undefined;

  const command = async (args: string[]): Promise<unknown> => {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`token store returned ${res.status}`);
    const body = (await res.json()) as { result?: unknown; error?: string };
    if (body.error) throw new Error(`token store: ${body.error}`);
    return body.result;
  };

  return {
    claim: async (key, ttlSeconds) =>
      (await command(["SET", `astra-mcp:${key}`, "1", "NX", "EX", String(Math.max(1, Math.ceil(ttlSeconds)))])) === "OK",
    has: async (key) => Number(await command(["EXISTS", `astra-mcp:${key}`])) > 0,
  };
}
