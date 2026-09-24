/** astra-mcp — the Astra DB MCP server and its installer/doctor CLI. */
import { serve } from "./serve.js";

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  if (!command || command === "serve") {
    serve({ readOnly: rest.includes("--read-only") });
    return -1;
  }
  process.stderr.write(`unknown command: ${command}\n`);
  return 2;
}

main(process.argv.slice(2)).then((code) => {
  if (code >= 0) process.exit(code);
});
