import type {
  CollectionResultT, ExplorerResultT, OverviewResultT, SimilarityResultT, TableResultT,
} from "../../src/server/schemas.js";

export type { CollectionResultT, ExplorerResultT, OverviewResultT, SimilarityResultT, TableResultT };
export type ViewData = OverviewResultT | CollectionResultT | TableResultT | ExplorerResultT | SimilarityResultT;

export interface CallOptions {
  /** navigate (push a new view) or replace the current view's data (e.g. load more). */
  mode?: "navigate" | "merge";
  /** Short description for model context updates, e.g. "collection articles". */
  label?: string;
}

export interface ViewContext {
  /** False in standalone HTML files and hosts without server-tool access. */
  canCall: boolean;
  call(tool: string, args: Record<string, unknown>, options?: CallOptions): Promise<void>;
  /** Merge-in handler used by "load more" (explorer). */
  merge?(next: ViewData): void;
}
