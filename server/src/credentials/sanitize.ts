/**
 * Value hygiene for credentials coming from env vars, dotenv files, and host
 * config templating. Hosts pass unset template variables through literally
 * (e.g. Claude Code hands the server "${user_config.token}" when the option is
 * blank), so those must read as "unset", never as a token.
 */

const TEMPLATE = /^\$\{[^}]*\}$/;
const ASTRA_TOKEN = /^AstraCS:[A-Za-z0-9._:-]{8,}$/;

/** Trim, and map empty strings / unexpanded ${...} templates to undefined. */
export function clean(value: string | undefined | null): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed || TEMPLATE.test(trimmed)) return undefined;
  return trimmed;
}

export function looksLikeAstraToken(token: string): boolean {
  return ASTRA_TOKEN.test(token);
}

/** "AstraCS:…abcd" — safe to print. */
export function maskToken(token: string | undefined): string {
  if (!token) return "(none)";
  const tail = token.slice(-4);
  return token.startsWith("AstraCS:") ? `AstraCS:…${tail}` : `…${tail}`;
}

/** Truthy switch parsing for env/config booleans ("1", "true", "yes", "on"). */
export function parseBool(value: string | undefined): boolean | undefined {
  const v = clean(value)?.toLowerCase();
  if (v === undefined) return undefined;
  if (["1", "true", "yes", "on"].includes(v)) return true;
  if (["0", "false", "no", "off"].includes(v)) return false;
  return undefined;
}

/** Strip anything that looks like a token or a full URL from a message before it reaches a model or log. */
export function sanitizeMessage(message: string): string {
  return message
    .replace(/AstraCS:[A-Za-z0-9._:-]+/g, "AstraCS:***")
    .replace(/Cassandra:[A-Za-z0-9+/=:]+/g, "Cassandra:***")
    .replace(/https?:\/\/[^\s"'<>)]+/g, (url) => {
      try {
        return new URL(url).hostname;
      } catch {
        return "<url>";
      }
    });
}
