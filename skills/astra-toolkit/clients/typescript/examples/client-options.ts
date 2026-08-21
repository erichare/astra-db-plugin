import { DataAPIClient } from "@datastax/astra-db-ts";
import * as fetchH2 from "fetch-h2";

const client = new DataAPIClient({
  logging: [
    { events: "commandStarted", emits: "stdout" },
    { events: "commandFailed", emits: "stderr" },
  ],
  httpOptions: { client: "fetch-h2", fetchH2: fetchH2 },
  timeoutDefaults: {
    requestTimeoutMs: 20000,
    generalMethodTimeoutMs: 40000,
  },
});
