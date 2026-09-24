/**
 * The small, realistic Astra DB the plugin evals run against. The eval mocks in
 * ../../../evals/mocks/astra-db/ are this world's real tool output (see
 * eval-mocks.test.ts), so they never drift from what the server returns.
 */
import type { Doc } from "../../src/astra/gateway.js";
import type { FakeState } from "../fake.js";

export const WORLD_ENDPOINT = "https://2f0c6a3e-8d1b-4c55-9a7e-1b2c3d4e5f60-us-east-2.apps.astra.datastax.com";

const ARTICLES: [string, string, number, number][] = [
  ["Hawking radiation, gently", "R. Moreno", 2018, 0.912],
  ["The quiet physics of black holes", "A. Chen", 2019, 0.887],
  ["Event horizons and information", "R. Moreno", 2020, 0.861],
  ["Neutron stars at the limit", "S. Okafor", 2021, 0.81],
  ["Dark energy, measured", "A. Chen", 2022, 0.779],
  ["Quantum fields for the curious", "L. Varga", 2023, 0.755],
  ["Gravitational waves: a primer", "S. Okafor", 2024, 0.731],
  ["How stars die", "L. Varga", 2025, 0.7],
];

const ORDERS: [string, string, string, number, string][] = [
  ["ord-5519", "c-1042", "pending", 129.5, "2026-09-18T14:02:00Z"],
  ["ord-5507", "c-1042", "pending", 42, "2026-09-15T09:41:00Z"],
  ["ord-5488", "c-1042", "pending", 310.25, "2026-09-09T17:20:00Z"],
];

export function evalWorld(): FakeState {
  const articles: Doc[] = ARTICLES.map(([title, author, year, similarity], i) => ({
    _id: `4f6d1a2e-0000-4000-8000-00000000000${i}`,
    title,
    author,
    year,
    topic: "astrophysics",
    $vector: [0.1, 0.2, 0.3],
    $similarity: similarity,
  }));
  const orders: Doc[] = ORDERS.map(([_id, customerId, status, total, at]) => ({
    _id, customerId, status, total, currency: "USD", createdAt: new Date(at), items: 2,
  }));
  const products: Doc[] = [
    ["USB-C charger 65W", 39.99, "electronics"], ["Noise-cancelling earbuds", 89, "electronics"], ["Mechanical keyboard", 129, "electronics"],
    ["Desk lamp", 45, "home"], ["Portable SSD 1TB", 99.5, "electronics"],
  ].map(([name, price, category], i) => ({ _id: `p-${100 + i}`, name, price, category, stock: 10 + i }));
  const scratch: Doc[] = Array.from({ length: 3 }, (_, i) => ({ _id: `tmp-${i}`, text: `test chunk ${i}`, $vector: [0.1, 0.2] }));

  return {
    keyspaces: new Map([
      ["default_keyspace", {
        collections: new Map([
          ["articles", {
            descriptor: {
              name: "articles",
              definition: {
                vector: { dimension: 1024, metric: "cosine", service: { provider: "nvidia", modelName: "nv-embedqa-e5-v5" } },
                lexical: { enabled: true, analyzer: "standard" },
                rerank: { enabled: true, service: { provider: "nvidia", modelName: "llama-3.2-nv-rerankqa-1b-v2" } },
                defaultId: { type: "uuid" },
              },
            },
            docs: articles,
          }],
          ["orders", { descriptor: { name: "orders", definition: { defaultId: { type: "objectId" } } }, docs: orders }],
          ["products", { descriptor: { name: "products", definition: {} }, docs: products }],
          ["scratch_embeddings", { descriptor: { name: "scratch_embeddings", definition: { vector: { dimension: 1536, metric: "dot_product" } } }, docs: scratch }],
        ]),
        tables: new Map(),
      }],
    ]),
    calls: [],
    failures: new Map(),
    databases: [{
      id: "2f0c6a3e-8d1b-4c55-9a7e-1b2c3d4e5f60", name: "demo-db", status: "ACTIVE", keyspaces: ["default_keyspace"],
      cloudProvider: "AWS", regions: [{ name: "us-east-2", apiEndpoint: WORLD_ENDPOINT }],
    }],
    embeddingProviders: {
      nvidia: { displayName: "NVIDIA", supportedAuthentication: { NONE: { enabled: true } }, models: [{ name: "nv-embedqa-e5-v5", vectorDimension: 1024 }] },
    },
  };
}
