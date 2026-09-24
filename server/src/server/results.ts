import type { CallToolResult } from "@modelcontextprotocol/server";
import { toAstraMcpError } from "../astra/errors.js";

/** Cap on the JSON copy of structuredContent that follows the summary (models read text). */
const MAX_JSON_CHARS = 12_000;

type ContentBlock = CallToolResult["content"][number];

/**
 * A successful result: a human summary first, then the data as compact JSON
 * (for hosts/models that read only text), plus structuredContent for UIs and
 * output-schema validation.
 */
export function ok(summary: string, data: Record<string, unknown>, extra: ContentBlock[] = [], includeJson = true): CallToolResult {
  const content: ContentBlock[] = [{ type: "text", text: summary }];
  if (includeJson) {
    const json = JSON.stringify(data);
    content.push({
      type: "text",
      text: json.length > MAX_JSON_CHARS ? `${json.slice(0, MAX_JSON_CHARS)}… [truncated — narrow the request for the rest]` : json,
    });
  }
  return { content: [...content, ...extra], structuredContent: data };
}

/** An error result with a stable code and hint (never throws out of a tool). */
export function fail(error: unknown): CallToolResult {
  const payload = toAstraMcpError(error).toPayload();
  const text = `${payload.code}: ${payload.message}${payload.hint ? `\nHint: ${payload.hint}` : ""}`;
  return { isError: true, content: [{ type: "text", text }], structuredContent: { error: payload } };
}
