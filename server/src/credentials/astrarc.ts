/**
 * Astra CLI configuration (INI with one section per profile):
 *
 *   [default]
 *   ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
 *   ASTRA_ENV=prod
 *
 * Location, first match wins: $ASTRARC, $XDG_CONFIG_HOME/astra/.astrarc,
 * ~/.astrarc (%USERPROFILE%\.astrarc on Windows).
 */
import { join } from "node:path";

export interface AstrarcProfile {
  token?: string;
  environment?: string;
}

export function astrarcCandidates(env: NodeJS.ProcessEnv, home: string): string[] {
  const out: string[] = [];
  if (env.ASTRARC) out.push(env.ASTRARC);
  if (env.XDG_CONFIG_HOME) out.push(join(env.XDG_CONFIG_HOME, "astra", ".astrarc"));
  out.push(join(home, ".astrarc"));
  return out;
}

export function parseAstrarc(text: string): Record<string, Record<string, string>> {
  const sections: Record<string, Record<string, string>> = {};
  let current: Record<string, string> | undefined;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith(";")) continue;
    const section = line.match(/^\[(.+)]$/);
    if (section) {
      current = sections[section[1].trim()] ??= {};
      continue;
    }
    const eq = line.indexOf("=");
    if (eq > 0 && current) current[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
  return sections;
}

export function profileFrom(text: string, profile = "default"): AstrarcProfile | undefined {
  const section = parseAstrarc(text)[profile];
  if (!section) return undefined;
  return {
    token: section.ASTRA_DB_APPLICATION_TOKEN ?? section.ASTRA_DB_TOKEN,
    environment: section.ASTRA_ENV,
  };
}
