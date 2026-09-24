import { AstraConnections } from "../astra/connection.js";
import { toAstraMcpError } from "../astra/errors.js";
import { createGateway } from "../astra/gateway.js";
import { StaticCredentials } from "../credentials/resolver.js";
import { VERSION } from "../version.js";
import type { AstraGrantCreds } from "./oauth/types.js";

/** Prove the credentials reach a database (DevOps pick if no endpoint, then one listCollections). null = OK. */
export async function verifyAstraCredentials(creds: AstraGrantCreds): Promise<string | null> {
  const connections = new AstraConnections(new StaticCredentials(creds), createGateway(VERSION));
  try {
    const target = await connections.target();
    await connections.schema(target, true);
    return null;
  } catch (err) {
    const e = toAstraMcpError(err).toPayload();
    return `${e.message}${e.hint ? ` ${e.hint}` : ""}`;
  }
}
