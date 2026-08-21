// Stateless, encrypted tokens (AES-256-GCM via Web Crypto). Tokens carry the user's Astra
// credentials, so they are encrypted — not merely signed — with a server secret.
// Format: aw1.<base64url iv>.<base64url ciphertext+tag>

const PREFIX = "aw1";
const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}
function fromB64url(text: string): Uint8Array<ArrayBuffer> {
  const buf = Buffer.from(text, "base64url");
  return new Uint8Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

async function keyFromSecret(secret: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function seal(payload: unknown, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyFromSecret(secret);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(payload))),
  );
  return `${PREFIX}.${b64url(iv)}.${b64url(ciphertext)}`;
}

/** Returns the payload, or null for anything malformed, tampered, or encrypted with another secret. */
export async function open<T>(token: string, secret: string): Promise<T | null> {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== PREFIX) return null;
  try {
    const key = await keyFromSecret(secret);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64url(parts[1]) }, key, fromB64url(parts[2]));
    return JSON.parse(dec.decode(plain)) as T;
  } catch {
    return null;
  }
}

export function isSealedToken(token: string): boolean {
  return token.startsWith(`${PREFIX}.`);
}

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function randomId(bytes = 16): string {
  return b64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

/** PKCE S256: base64url(sha256(verifier)) === challenge */
export async function pkceMatches(verifier: string, challenge: string): Promise<boolean> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(verifier)));
  return b64url(digest) === challenge;
}
