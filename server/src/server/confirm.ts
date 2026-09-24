/**
 * Confirmation for destructive operations.
 *
 * 1. An explicit `confirm` argument must equal the target name (the model may
 *    only set it after the user approved in the conversation).
 * 2. Otherwise, if the client supports form elicitation, ask the user directly
 *    (multi-round-trip `input_required` on the 2026-07-28 protocol; the SDK
 *    falls back to `elicitation/create` for older clients).
 * 3. Otherwise fail with `confirmation_required` so the model asks the user.
 */
import {
  CLIENT_CAPABILITIES_META_KEY, type CallToolResult, type ClientCapabilities, type InputRequiredResult,
  type McpServer, type ServerContext, acceptedContent, inputRequired, inputResponse,
} from "@modelcontextprotocol/server";
import { z } from "zod";
import { AstraMcpError } from "../astra/errors.js";
import { fail, ok } from "./results.js";

export interface ConfirmationSpec {
  operation: string;
  /** What the user must type to confirm (the collection/table/index name). */
  expected: string;
  /** One sentence describing the blast radius. */
  impact: string;
  keyspace: string;
  kind: string;
}

export function clientCapabilities(server: McpServer, ctx: ServerContext): ClientCapabilities | undefined {
  const envelope = ctx.mcpReq.envelope as Record<string, unknown> | undefined;
  const fromEnvelope = envelope?.[CLIENT_CAPABILITIES_META_KEY] as ClientCapabilities | undefined;
  if (fromEnvelope) return fromEnvelope;
  try {
    return server.server.getClientCapabilities();
  } catch {
    return undefined;
  }
}

export function canElicitForm(caps: ClientCapabilities | undefined): boolean {
  const elicitation = caps?.elicitation as Record<string, unknown> | undefined;
  if (!elicitation) return false;
  return elicitation.form !== undefined || Object.keys(elicitation).length === 0;
}

const ConfirmForm = z.object({ confirm: z.string() });

/** "confirmed", or a result to return from the tool (question, cancellation, or error). */
export function requireConfirmation(
  server: McpServer,
  ctx: ServerContext,
  confirm: string | undefined,
  spec: ConfirmationSpec,
): "confirmed" | CallToolResult | InputRequiredResult {
  const mismatch = () => fail(new AstraMcpError("confirmation_mismatch", `Confirmation did not match '${spec.expected}'. Nothing was changed.`, {
    hint: `Only proceed if the user explicitly confirms; the confirmation value is exactly "${spec.expected}".`,
  }));

  if (confirm !== undefined) return confirm.trim() === spec.expected ? "confirmed" : mismatch();

  const answer = inputResponse(ctx.mcpReq.inputResponses, "confirm");
  if (answer.kind === "elicit") {
    if (answer.action !== "accept") {
      return ok(`Cancelled: the user declined to ${spec.operation} ${spec.expected}. Nothing was changed.`, {
        view: "mutation", operation: spec.operation, status: "cancelled", keyspace: spec.keyspace,
        name: spec.expected, kind: spec.kind, message: "Cancelled by the user.",
      });
    }
    const content = acceptedContent(ctx.mcpReq.inputResponses, "confirm", ConfirmForm);
    return content?.confirm.trim() === spec.expected ? "confirmed" : mismatch();
  }

  if (canElicitForm(clientCapabilities(server, ctx))) {
    return inputRequired({
      inputRequests: {
        confirm: inputRequired.elicit({
          message: `${spec.impact}\n\nThis cannot be undone. Type "${spec.expected}" to confirm.`,
          requestedSchema: {
            type: "object",
            properties: { confirm: { type: "string", title: `Type ${spec.expected} to confirm` } },
            required: ["confirm"],
          },
        }),
      },
    });
  }

  return fail(new AstraMcpError("confirmation_required", `${spec.impact} This needs the user's explicit confirmation.`, {
    hint: `Describe the impact to the user and ask them to confirm. Only if they clearly approve, call again with confirm: "${spec.expected}".`,
    details: { expected: spec.expected },
  }));
}
