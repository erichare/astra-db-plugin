import { DataAPIClient, DataAPIDate } from "@datastax/astra-db-ts";

// Manually define the type of the table's schema and primary key
type TableSchema = {
  title: string;
  author: string;
  number_of_pages?: number | null | undefined;
  rating?: number | null | undefined;
  genres?: Set<string> | undefined;
  metadata?: Map<string, string> | undefined;
  is_checked_out?: boolean | null | undefined;
  due_date?: DataAPIDate | null | undefined;
};

type TablePrimaryKey = Pick<TableSchema, "title" | "author">;

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table<TableSchema, TablePrimaryKey>("**TABLE_NAME**");
