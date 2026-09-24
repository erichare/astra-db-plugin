import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an admin object
const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN!);
const admin = client.admin();

// Get a database admin object
const databaseAdmin = admin.dbAdmin(process.env.ASTRA_DB_API_ENDPOINT!);
