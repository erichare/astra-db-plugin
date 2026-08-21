import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an admin object
const client = new DataAPIClient("**APPLICATION_TOKEN**");
const admin = client.admin();
