import type { AstraDb, Doc } from "../client.js";
import { displayDocument, pickDisplayFields, summarizeFields } from "../fields.js";
import type { ExploreResultT } from "../schemas.js";

export interface ExploreInput {
  collection: string;
  keyspace?: string;
  filter?: Doc;
  pageState?: string;
  fields?: string[];
}

export async function exploreCollection(db: AstraDb, input: ExploreInput): Promise<ExploreResultT> {
  const keyspace = input.keyspace ?? db.keyspace;
  const coll = db.collection(input.collection, { keyspace });
  const projection: Doc = input.fields && input.fields.length > 0
    ? Object.fromEntries([...input.fields, "_id"].map((f) => [f, 1]))
    : { $vector: 0 };
  let cursor = coll.find(input.filter ?? {}, { projection });
  if (input.pageState) cursor = cursor.initialPageState(input.pageState);
  const page = await cursor.fetchNextPage();
  const documents = page.result.map((d) => displayDocument(d));
  const displayFields = documents.length > 0 ? pickDisplayFields(documents[0], 4) : [];
  return {
    widget: "explorer",
    keyspace,
    collection: input.collection,
    filter: input.filter && Object.keys(input.filter).length > 0 ? input.filter : null,
    documents,
    displayFields,
    fields: summarizeFields(documents),
    nextPageState: page.nextPageState ?? null,
  };
}
