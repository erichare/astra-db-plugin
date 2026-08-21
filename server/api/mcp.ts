import { handleMcpRequest } from "../src/http.js";

// Vercel passes (request, context) — never forward the context into the secret parameter.
const handler = (req: Request) => handleMcpRequest(req, process.env.ASTRA_WIDGETS_AUTH_SECRET);

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
export const OPTIONS = handler;
