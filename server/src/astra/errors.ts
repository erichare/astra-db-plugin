import { sanitizeMessage } from "../credentials/sanitize.js";

export type ErrorCode =
  | "not_configured"
  | "invalid_credentials"
  | "forbidden"
  | "not_found"
  | "ambiguous_database"
  | "invalid_argument"
  | "unsupported_operation"
  | "unsupported_query"
  | "confirmation_required"
  | "confirmation_mismatch"
  | "read_only"
  | "timeout"
  | "rate_limited"
  | "data_api_error"
  | "devops_api_error";

export interface ErrorPayload {
  code: ErrorCode;
  message: string;
  hint?: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export const LOGIN_HINT =
  "Ask the user to run `npx -y @erichare/astra-mcp login` in their own terminal (it picks a database and writes .env; no restart needed). Never ask them to paste a token into the chat.";

/** An error with a stable code and an actionable hint, safe to show a model. */
export class AstraMcpError extends Error {
  readonly code: ErrorCode;
  readonly hint?: string;
  readonly retryable: boolean;
  readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, options: { hint?: string; retryable?: boolean; details?: Record<string, unknown> } = {}) {
    super(message);
    this.name = "AstraMcpError";
    this.code = code;
    this.hint = options.hint;
    this.retryable = options.retryable ?? false;
    this.details = options.details;
  }

  toPayload(): ErrorPayload {
    return {
      code: this.code,
      message: sanitizeMessage(this.message),
      ...(this.hint ? { hint: this.hint } : {}),
      retryable: this.retryable,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

interface DescriptorLike {
  errorCode?: string;
  message?: string;
}

const NOT_FOUND_CODES = /(COLLECTION|TABLE|KEYSPACE|INDEX|DATABASE)_NOT_EXIST|NOT_FOUND|UNKNOWN_TABLE|UNKNOWN_COLLECTION/;
const ARGUMENT_CODES = /INVALID|UNSUPPORTED_FILTER|UNKNOWN_.*COLUMN|MISSING_|SHRED_|FILTER|SORT|PROJECTION|DOCUMENT_|TOO_MANY|LIMIT|VECTOR_SIZE|MISMATCH/;

function statusOf(err: Record<string, unknown>): number | undefined {
  const status = err.status ?? (err.raw as Record<string, unknown> | undefined)?.status;
  return typeof status === "number" ? status : undefined;
}

/** Map anything thrown by astra-db-ts (or fetch, or us) to a stable, sanitized AstraMcpError. */
export function toAstraMcpError(error: unknown): AstraMcpError {
  if (error instanceof AstraMcpError) return error;
  const err = (error ?? {}) as Record<string, unknown>;
  const name = typeof err.name === "string" ? err.name : "";
  const message = sanitizeMessage(error instanceof Error ? error.message : String(error));
  const status = statusOf(err);
  const devops = name.startsWith("DevOpsAPI");

  if (name.includes("Timeout")) {
    return new AstraMcpError("timeout", `Astra ${devops ? "DevOps" : "Data"} API request timed out.`, {
      hint: "Retry; hibernated databases can take a minute to resume. Narrow the query if it scans a lot of data.",
      retryable: true,
    });
  }

  if (status === 401) {
    return new AstraMcpError("invalid_credentials", `Astra rejected the token (401): ${message}`, {
      hint: `The token is invalid, expired, or revoked. ${LOGIN_HINT}`,
    });
  }
  if (status === 403) {
    return new AstraMcpError("forbidden", `The token lacks permission for this operation (403): ${message}`, {
      hint: devops
        ? "Listing databases needs an org-level role (e.g. Database Administrator). With a database-scoped token, set ASTRA_DB_API_ENDPOINT explicitly."
        : "Use a token whose role covers this database and operation (writes and DDL need more than read-only roles).",
    });
  }
  if (status === 429) {
    return new AstraMcpError("rate_limited", "Astra rate-limited the request (429).", {
      hint: "Wait a few seconds and retry with a smaller batch.",
      retryable: true,
    });
  }

  const descriptors = Array.isArray(err.errorDescriptors) ? (err.errorDescriptors as DescriptorLike[]) : [];
  const first = descriptors[0];
  if (first?.errorCode) {
    const code = first.errorCode;
    const detail = sanitizeMessage(first.message ?? message);
    if (NOT_FOUND_CODES.test(code)) {
      return new AstraMcpError("not_found", detail, {
        hint: "Check the name and keyspace with database_overview.",
        details: { dataApiErrorCode: code },
      });
    }
    if (/UNAUTHENTICATED|UNAUTHORIZED/.test(code)) {
      return new AstraMcpError("invalid_credentials", detail, { hint: LOGIN_HINT, details: { dataApiErrorCode: code } });
    }
    if (ARGUMENT_CODES.test(code)) {
      return new AstraMcpError("invalid_argument", detail, {
        hint: "Fix the request (filter/sort/document shape) and retry; describe_collection / describe_table show the schema.",
        details: { dataApiErrorCode: code },
      });
    }
    return new AstraMcpError("data_api_error", detail, { details: { dataApiErrorCode: code } });
  }

  if (status === 404) {
    return new AstraMcpError("not_found", `Not found (404): ${message}`, {
      hint: devops ? "Check the database id." : "Check ASTRA_DB_API_ENDPOINT — the database may have been deleted, or the URL is wrong.",
    });
  }
  if (status !== undefined && status >= 500) {
    return new AstraMcpError(devops ? "devops_api_error" : "data_api_error", `Astra returned ${status}: ${message}`, {
      hint: "Transient server error; retry shortly. A hibernated database resumes on first use.",
      retryable: true,
    });
  }

  const cause = (err.cause ?? {}) as Record<string, unknown>;
  const netCode = typeof err.code === "string" ? err.code : typeof cause.code === "string" ? cause.code : "";
  if (/ENOTFOUND|ECONNREFUSED|ECONNRESET|EAI_AGAIN|ETIMEDOUT|fetch failed/i.test(`${netCode} ${message}`)) {
    return new AstraMcpError("data_api_error", `Could not reach Astra: ${message}`, {
      hint: "Check the endpoint URL and network access (proxies, VPN).",
      retryable: true,
    });
  }

  return new AstraMcpError(devops ? "devops_api_error" : "data_api_error", message || "Astra request failed.");
}
