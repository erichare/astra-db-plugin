import { secretsFromEnv } from "../src/http/crypto.js";
import { replayStoreFromEnv } from "../src/http/oauth/replay.js";
import { handleOAuthRequest } from "../src/http/oauth/router.js";
import { verifyAstraCredentials } from "../src/http/verify.js";

const replay = replayStoreFromEnv();
const handler = (req: Request) => handleOAuthRequest(req, { secrets: secretsFromEnv(), verify: verifyAstraCredentials, replay });

export const GET = handler;
export const POST = handler;
export const OPTIONS = handler;
