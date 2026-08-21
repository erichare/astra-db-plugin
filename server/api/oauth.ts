import { handleOAuthRequest } from "../src/oauth/router.js";
import { verifyAstraCredentials } from "../src/oauth/verify.js";

const handler = (req: Request) =>
  handleOAuthRequest(req, { secret: process.env.ASTRA_WIDGETS_AUTH_SECRET, verifyCredentials: verifyAstraCredentials });

export const GET = handler;
export const POST = handler;
export const OPTIONS = handler;
