import type { AstraDb, CollectionDescriptorLike, CollectionLike, Doc, FindCursorLike, RerankedLike } from "../src/core/client.js";

export const DOCS: Doc[] = [
  { _id: "a1", title: "Vector search basics", category: "guide", body: "How vector search works in Astra DB.", $vector: [0.1, 0.2], $similarity: 0.93 },
  { _id: "a2", title: "Hybrid search", category: "guide", body: "Combine lexical and vector.", $vector: [0.2, 0.1], $similarity: 0.81 },
  { _id: "a3", title: "Data modeling", category: "reference", body: "Collections vs tables.", $vector: [0.3, 0.3], $similarity: 0.64 },
];

export const DESCRIPTORS: CollectionDescriptorLike[] = [
  {
    name: "articles",
    definition: {
      vector: { dimension: 1024, metric: "cosine", service: { provider: "nvidia", modelName: "nvidia/nv-embedqa-e5-v5" } },
      lexical: { enabled: true, analyzer: "standard" },
      rerank: { enabled: true, service: { provider: "nvidia", modelName: "nvidia/llama-3.2-nv-rerankqa-1b-v2" } },
      indexing: { deny: ["body"] },
      defaultId: { type: "uuid" },
    },
  },
  { name: "plain", definition: {} },
];

export interface MockOptions {
  keyspaces?: string[] | Error;
  tables?: string[];
  counts?: Record<string, number | Error>;
  docs?: Doc[];
  findOne?: (filter: Doc, options?: Doc) => Doc | null;
  nextPageState?: string | null;
  rerank?: RerankedLike[];
}

export interface Recorded {
  find: Array<{ filter: Doc; options?: Doc; pageState?: string }>;
  findAndRerank: Array<{ filter: Doc; options?: Doc }>;
  findOne: Array<{ filter: Doc; options?: Doc }>;
}

export function mockDb(options: MockOptions = {}): { db: AstraDb; calls: Recorded } {
  const calls: Recorded = { find: [], findAndRerank: [], findOne: [] };
  const docs = options.docs ?? DOCS;
  const collection: CollectionLike = {
    estimatedDocumentCount: async () => {
      const v = options.counts?.["*"] ?? 3;
      if (v instanceof Error) throw v;
      return v;
    },
    findOne: async (filter, opts) => {
      calls.findOne.push({ filter, options: opts });
      if (options.findOne) return options.findOne(filter, opts);
      if (filter._id) return docs.find((d) => d._id === filter._id) ?? null;
      return docs[0] ?? null;
    },
    find: (filter, opts) => {
      const entry: { filter: Doc; options?: Doc; pageState?: string } = { filter, options: opts };
      calls.find.push(entry);
      const cursor: FindCursorLike = {
        toArray: async () => docs.slice(0, (opts?.limit as number | undefined) ?? docs.length),
        initialPageState: (state) => {
          entry.pageState = state;
          return cursor;
        },
        fetchNextPage: async () => ({ result: docs, nextPageState: options.nextPageState ?? null }),
      };
      return cursor;
    },
    findAndRerank: (filter, opts) => {
      calls.findAndRerank.push({ filter, options: opts });
      return { toArray: async () => options.rerank ?? docs.map((d) => ({ document: d, scores: { $rerank: 0.5, $vector: 0.9 } })) };
    },
  };
  const db: AstraDb = {
    keyspace: "default_keyspace",
    listCollections: async () => DESCRIPTORS,
    listTables: async () => options.tables ?? ["events"],
    collection: () => collection,
    admin: () => ({
      listKeyspaces: async () => {
        if (options.keyspaces instanceof Error) throw options.keyspaces;
        return options.keyspaces ?? ["default_keyspace", "analytics"];
      },
    }),
  };
  return { db, calls };
}
