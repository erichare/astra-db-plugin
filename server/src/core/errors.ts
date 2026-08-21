export type AstraWidgetsErrorCode =
  | "missing_credentials"
  | "collection_not_found"
  | "document_not_found"
  | "unsupported_query"
  | "data_api_error";

export class AstraWidgetsError extends Error {
  constructor(
    public readonly code: AstraWidgetsErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AstraWidgetsError";
  }
}

/** Strip anything that looks like a token or full endpoint URL from an error message. */
export function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/AstraCS:[A-Za-z0-9:_-]+/g, "AstraCS:***")
    .replace(/https?:\/\/[^\s"']+/g, (url) => {
      try {
        return new URL(url).hostname;
      } catch {
        return "<endpoint>";
      }
    });
}
