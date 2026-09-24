import { secretsFromEnv } from "../src/http/crypto.js";
import { handleOAuthRequest } from "../src/http/oauth/router.js";
import { verifyAstraCredentials } from "../src/http/verify.js";

const handler = (req: Request) => handleOAuthRequest(req, { secrets: secretsFromEnv(), verify: verifyAstraCredentials });

export const GET = handler;
export const POST = handler;
export const OPTIONS = handler;
