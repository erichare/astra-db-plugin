import { createDb, type Credentials } from "../core/client.js";

/** Prove the credentials reach the database (one cheap listCollections call). */
export async function verifyAstraCredentials(creds: Credentials): Promise<boolean> {
  const db = createDb(creds);
  await db.listCollections({ nameOnly: false });
  return true;
}
