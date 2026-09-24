/**
 * An in-memory stand-in for astra-db-ts: enough Data API + DevOps semantics
 * (equality/$ne/$in filters, paging, vector "similarity", CRUD, DDL) to drive
 * the tools end to end without a network.
 */
import type {
  AstraGateway, CollectionDescriptorLike, CollectionLike, CursorLike, DatabaseInfoLike, DbLike, Doc,
  TableDescriptorLike, TableIndexLike, TableLike,
} from "../src/astra/gateway.js";

export interface FakeCollection {
  descriptor: CollectionDescriptorLike;
  docs: Doc[];
}

export interface FakeTable {
  descriptor: TableDescriptorLike;
  rows: Doc[];
  indexes: TableIndexLike[];
}

export interface FakeKeyspace {
  collections: Map<string, FakeCollection>;
  tables: Map<string, FakeTable>;
}

export interface FakeState {
  keyspaces: Map<string, FakeKeyspace>;
  calls: { method: string; args: unknown[] }[];
  databases: DatabaseInfoLike[];
  failures: Map<string, unknown>;
  embeddingProviders: Record<string, Doc>;
}

const PAGE = 20;

function idKey(value: unknown): string {
  if (value && typeof value === "object" && typeof (value as { toString?: unknown }).toString === "function") {
    const text = String(value);
    if (text !== "[object Object]") return text;
  }
  return JSON.stringify(value);
}

export function matches(doc: Doc, filter: Doc): boolean {
  return Object.entries(filter).every(([key, cond]) => {
    const value = key.split(".").reduce<unknown>((node, part) => (node as Doc | undefined)?.[part], doc);
    if (cond && typeof cond === "object" && !Array.isArray(cond) && Object.keys(cond as Doc).some((k) => k.startsWith("$"))) {
      const ops = cond as Doc;
      if ("$ne" in ops && idKey(value) === idKey(ops.$ne)) return false;
      if ("$in" in ops && !(ops.$in as unknown[]).some((v) => idKey(v) === idKey(value))) return false;
      if ("$gte" in ops && !((value as number) >= (ops.$gte as number))) return false;
      if ("$lt" in ops && !((value as number) < (ops.$lt as number))) return false;
      return true;
    }
    return idKey(value) === idKey(cond);
  });
}

function applyUpdate(doc: Doc, update: Doc): Doc {
  const next = { ...doc };
  for (const [k, v] of Object.entries((update.$set as Doc) ?? {})) next[k] = v;
  for (const k of Object.keys((update.$unset as Doc) ?? {})) delete next[k];
  for (const [k, v] of Object.entries((update.$inc as Doc) ?? {})) next[k] = ((next[k] as number) ?? 0) + (v as number);
  return next;
}

function cursor(state: FakeState, source: () => Doc[], filter: Doc, options: Doc = {}): CursorLike {
  let pageState: string | undefined;
  const limit = typeof options.limit === "number" ? options.limit : undefined;
  const sort = (options.sort ?? {}) as Doc;
  const results = () => {
    let docs = source().filter((d) => matches(d, filter));
    if ("$vector" in sort || "$vectorize" in sort || Object.values(sort).some((v) => Array.isArray(v) || typeof v === "string")) {
      docs = [...docs].sort((a, b) => ((b.$similarity as number) ?? 0) - ((a.$similarity as number) ?? 0));
    }
    const projection = (options.projection ?? {}) as Doc;
    const excluded = Object.entries(projection).filter(([, v]) => v === 0 || v === false).map(([k]) => k);
    const included = Object.entries(projection).filter(([, v]) => v === 1 || v === true).map(([k]) => k);
    return docs.map((d) => {
      let out: Doc = { ...d };
      if (!options.includeSimilarity) delete out.$similarity;
      if (included.length && !included.includes("$vector")) out = Object.fromEntries(Object.entries(out).filter(([k]) => k === "_id" || included.includes(k)));
      if (!included.includes("$vector")) delete out.$vector;
      for (const k of excluded) delete out[k];
      return out;
    });
  };
  const self: CursorLike = {
    async toArray() {
      state.calls.push({ method: "find.toArray", args: [filter, options] });
      const all = results();
      return limit ? all.slice(0, limit) : all;
    },
    initialPageState(s?: string) {
      pageState = s;
      return self;
    },
    async fetchNextPage() {
      state.calls.push({ method: "find.fetchNextPage", args: [filter, options, pageState] });
      const all = results();
      const start = pageState ? Number(pageState) : 0;
      const end = start + PAGE;
      return { result: all.slice(start, end), nextPageState: end < all.length ? String(end) : null };
    },
  };
  return self;
}

function maybeFail(state: FakeState, method: string): void {
  const failure = state.failures.get(method);
  if (failure) throw failure;
}

function collection(state: FakeState, coll: FakeCollection): CollectionLike {
  return {
    async estimatedDocumentCount() {
      maybeFail(state, "estimatedDocumentCount");
      return coll.docs.length;
    },
    async countDocuments(filter, upperBound) {
      const n = coll.docs.filter((d) => matches(d, filter)).length;
      if (n > upperBound) throw Object.assign(new Error("too many"), { name: "TooManyDocumentsToCountError" });
      return n;
    },
    async findOne(filter, options = {}) {
      state.calls.push({ method: "findOne", args: [filter, options] });
      maybeFail(state, "findOne");
      const doc = coll.docs.find((d) => matches(d, filter));
      if (!doc) return null;
      const projection = (options.projection ?? {}) as Doc;
      const out = { ...doc };
      delete out.$similarity;
      if (projection.$vector !== 1) delete out.$vector;
      return out;
    },
    find: (filter, options) => cursor(state, () => coll.docs, filter, options),
    findAndRerank(filter, options = {}) {
      state.calls.push({ method: "findAndRerank", args: [filter, options] });
      return {
        async toArray() {
          const docs = coll.docs.filter((d) => matches(d, filter)).slice(0, (options.limit as number) ?? 10);
          return docs.map((d) => {
            const { $similarity, $vector, ...document } = d;
            return { document, scores: { $rerank: 0.9, $vector: ($similarity as number) ?? 0.5 } };
          });
        },
      };
    },
    async insertMany(docs) {
      maybeFail(state, "insertMany");
      const ids = docs.map((d, i) => d._id ?? `gen-${coll.docs.length + i}`);
      for (const [i, d] of docs.entries()) coll.docs.push({ ...d, _id: ids[i] });
      return { insertedIds: ids, insertedCount: docs.length };
    },
    async updateOne(filter, update, options = {}) {
      const index = coll.docs.findIndex((d) => matches(d, filter));
      if (index < 0) {
        if (options.upsert) {
          coll.docs.push(applyUpdate({ _id: "upserted", ...filter }, update));
          return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1, upsertedId: "upserted" };
        }
        return { matchedCount: 0, modifiedCount: 0 };
      }
      coll.docs[index] = applyUpdate(coll.docs[index], update);
      return { matchedCount: 1, modifiedCount: 1 };
    },
    async updateMany(filter, update) {
      const n = coll.docs.filter((d) => matches(d, filter)).length;
      coll.docs = coll.docs.map((d) => (matches(d, filter) ? applyUpdate(d, update) : d));
      return { matchedCount: n, modifiedCount: n };
    },
    async deleteOne(filter) {
      const index = coll.docs.findIndex((d) => matches(d, filter));
      if (index >= 0) coll.docs.splice(index, 1);
      return { deletedCount: index >= 0 ? 1 : 0 };
    },
    async deleteMany(filter) {
      const before = coll.docs.length;
      coll.docs = coll.docs.filter((d) => !matches(d, filter));
      return { deletedCount: before - coll.docs.length };
    },
  };
}

function table(state: FakeState, tbl: FakeTable): TableLike {
  return {
    async findOne(filter) {
      return tbl.rows.find((r) => matches(r, filter)) ?? null;
    },
    find: (filter, options) => cursor(state, () => tbl.rows, filter, options),
    async insertMany(rows) {
      tbl.rows.push(...rows);
      return { insertedIds: rows.map((r) => ({ id: r.id })), insertedCount: rows.length };
    },
    async updateOne(filter, update) {
      const index = tbl.rows.findIndex((r) => matches(r, filter));
      if (index >= 0) tbl.rows[index] = applyUpdate(tbl.rows[index], update);
    },
    async deleteOne(filter) {
      const index = tbl.rows.findIndex((r) => matches(r, filter));
      if (index >= 0) tbl.rows.splice(index, 1);
    },
    async deleteMany(filter) {
      tbl.rows = tbl.rows.filter((r) => !matches(r, filter));
    },
    async listIndexes() {
      return tbl.indexes;
    },
    async createIndex(name, column) {
      state.calls.push({ method: "createIndex", args: [name, column] });
      tbl.indexes.push({ name, definition: { column }, indexType: "regular" });
    },
    async createVectorIndex(name, column, options) {
      state.calls.push({ method: "createVectorIndex", args: [name, column, options] });
      tbl.indexes.push({ name, definition: { column }, indexType: "vector" });
    },
    async createTextIndex(name, column) {
      tbl.indexes.push({ name, definition: { column }, indexType: "text" });
    },
  };
}

export function createFakeState(): FakeState {
  const docs: Doc[] = Array.from({ length: 45 }, (_, i) => ({
    _id: `doc-${i}`,
    title: `Article ${i}`,
    genre: i % 3 === 0 ? "science" : i % 3 === 1 ? "history" : "fiction",
    year: 2000 + i,
    tags: ["a", i % 2 ? "odd" : "even"],
    $vector: [0.1, 0.2, 0.3],
    $similarity: 1 - i / 100,
  }));
  const articles: FakeCollection = {
    descriptor: {
      name: "articles",
      definition: {
        vector: { dimension: 1024, metric: "cosine", service: { provider: "nvidia", modelName: "nv-embedqa-e5-v5" } },
        lexical: { enabled: true, analyzer: "standard" },
        rerank: { enabled: true, service: { provider: "nvidia", modelName: "llama-3.2-nv-rerankqa-1b-v2" } },
        indexing: { deny: ["body"] },
        defaultId: { type: "uuid" },
      },
    },
    docs,
  };
  const plain: FakeCollection = { descriptor: { name: "plain", definition: {} }, docs: [{ _id: "p1", note: "hi" }] };
  const reviews: FakeTable = {
    descriptor: {
      name: "reviews",
      definition: {
        columns: {
          id: { type: "uuid" },
          product: { type: "text" },
          stars: { type: "int" },
          body: { type: "text" },
          embedding: { type: "vector", dimension: 3, service: { provider: "nvidia", modelName: "nv-embedqa-e5-v5" } },
        },
        primaryKey: { partitionBy: ["product"], partitionSort: { id: 1 } },
      },
    },
    rows: [
      { id: "r1", product: "lamp", stars: 5, body: "great", embedding: [0.1, 0.2, 0.3], $similarity: 0.91 },
      { id: "r2", product: "lamp", stars: 2, body: "dim", embedding: [0.3, 0.2, 0.1], $similarity: 0.52 },
    ],
    indexes: [{ name: "stars_idx", definition: { column: "stars" }, indexType: "regular" }],
  };
  return {
    keyspaces: new Map([
      ["default_keyspace", {
        collections: new Map([["articles", articles], ["plain", plain]]),
        tables: new Map([["reviews", reviews]]),
      }],
      ["analytics", { collections: new Map(), tables: new Map() }],
    ]),
    calls: [],
    failures: new Map(),
    databases: [
      {
        id: "11111111-1111-1111-1111-111111111111", name: "prod-db", status: "ACTIVE", keyspaces: ["default_keyspace", "analytics"],
        cloudProvider: "AWS", regions: [{ name: "us-east-2", apiEndpoint: "https://11111111-1111-1111-1111-111111111111-us-east-2.apps.astra.datastax.com" }],
      },
    ],
    embeddingProviders: {
      nvidia: { displayName: "NVIDIA", supportedAuthentication: { NONE: { enabled: true } }, models: [{ name: "nv-embedqa-e5-v5", vectorDimension: 1024 }] },
    },
  };
}

export function fakeDb(state: FakeState, defaultKeyspace = "default_keyspace"): DbLike {
  const ks = (name?: string) => {
    const key = name ?? defaultKeyspace;
    let keyspace = state.keyspaces.get(key);
    if (!keyspace) {
      keyspace = { collections: new Map(), tables: new Map() };
      state.keyspaces.set(key, keyspace);
    }
    return keyspace;
  };
  const notFound = (what: string, name: string) =>
    Object.assign(new Error(`${what} ${name} does not exist`), { name: "DataAPIResponseError", errorDescriptors: [{ errorCode: `${what.toUpperCase()}_NOT_EXIST`, message: `${what} ${name} does not exist` }] });
  return {
    keyspace: defaultKeyspace,
    async listCollections({ keyspace }) {
      maybeFail(state, "listCollections");
      return [...ks(keyspace).collections.values()].map((c) => c.descriptor);
    },
    async listTables({ keyspace }) {
      return [...ks(keyspace).tables.values()].map((t) => t.descriptor);
    },
    collection(name, options = {}) {
      const coll = ks(options.keyspace).collections.get(name);
      if (!coll) throw notFound("collection", name);
      return collection(state, coll);
    },
    table(name, options = {}) {
      const tbl = ks(options.keyspace).tables.get(name);
      if (!tbl) throw notFound("table", name);
      return table(state, tbl);
    },
    async createCollection(name, options = {}) {
      state.calls.push({ method: "createCollection", args: [name, options] });
      const { keyspace, ...definition } = options as Doc & { keyspace?: string };
      ks(keyspace).collections.set(name, { descriptor: { name, definition: definition as CollectionDescriptorLike["definition"] }, docs: [] });
    },
    async createTable(name, options) {
      state.calls.push({ method: "createTable", args: [name, options] });
      const { keyspace, definition } = options as { keyspace?: string; definition: TableDescriptorLike["definition"] };
      ks(keyspace).tables.set(name, { descriptor: { name, definition }, rows: [], indexes: [] });
    },
    async dropCollection(name, options = {}) {
      state.calls.push({ method: "dropCollection", args: [name, options] });
      ks(options.keyspace).collections.delete(name);
    },
    async dropTable(name, options = {}) {
      state.calls.push({ method: "dropTable", args: [name, options] });
      ks(options.keyspace).tables.delete(name);
    },
    async dropTableIndex(name, options = {}) {
      state.calls.push({ method: "dropTableIndex", args: [name, options] });
      for (const t of ks(options.keyspace).tables.values()) t.indexes = t.indexes.filter((i) => i.name !== name);
    },
    admin() {
      return {
        async listKeyspaces() {
          return [...state.keyspaces.keys()];
        },
        async findEmbeddingProviders() {
          return { embeddingProviders: state.embeddingProviders };
        },
        async findRerankingProviders() {
          return { rerankingProviders: { nvidia: { displayName: "NVIDIA", models: [{ name: "llama-3.2-nv-rerankqa-1b-v2", isDefault: true }] } } };
        },
      };
    },
  };
}

export function fakeGateway(state: FakeState): AstraGateway & { dbCalls: { token: string; endpoint: string; keyspace?: string }[] } {
  const dbCalls: { token: string; endpoint: string; keyspace?: string }[] = [];
  return {
    dbCalls,
    db(token, endpoint, keyspace) {
      dbCalls.push({ token, endpoint, keyspace });
      return fakeDb(state, keyspace ?? "default_keyspace");
    },
    devops() {
      return {
        async listDatabases() {
          maybeFail(state, "listDatabases");
          return state.databases;
        },
        async dbInfo(id) {
          const db = state.databases.find((d) => d.id === id);
          if (!db) throw Object.assign(new Error("not found"), { name: "DevOpsAPIResponseError", status: 404 });
          return db;
        },
      };
    },
  };
}
