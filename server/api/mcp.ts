import { createHttpHandler } from "../src/http/handler.js";

// Vercel passes (request, context): only the request is forwarded.
const handleMcpRequest = createHttpHandler();
const handler = (req: Request) => handleMcpRequest(req);

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
export const OPTIONS = handler;
