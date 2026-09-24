# Privacy

*Last updated: 2026-09-24*

Astra DB for Agents (the `astra-db` plugin and the `@erichare/astra-mcp` server) is a community project. It collects no analytics or telemetry, and nothing phones home.

## Local server (npm, plugins, Claude Desktop bundle)

The server runs on your machine and talks only to:

- **Your Astra DB databases** through the Data API, and to the Astra **DevOps API** (`api.astra.datastax.com`) to list databases, keyspaces, and providers. Requests carry your token and a `User-Agent` naming `astra-mcp` and its version, like any DataStax client.
- **npm**, when your agent launches it with `npx`, to download the package.

Data returned by the tools goes to your agent, and from there to whichever model provider your agent uses, under that provider's terms. Only what a tool returns is shared, and you choose what to ask for.

Files it writes, all on your machine:

- `.env` in your project, or `~/.config/astra-mcp/credentials.json` (`%APPDATA%\astra-mcp\` on Windows), by `login`, with mode 0600
- agent configuration files, by `init`, with a `.bak-astra` backup of each file it changes
- HTML views, only when you ask for one (`emit: "html_file"`), in your temp directory with mode 0600, deleted after 24 hours

`code_examples` searches examples bundled in the package and makes no network requests.

## Hosted server (`astra-widgets-mcp.vercel.app`)

- **No storage.** No database, no sessions. Your Astra token, endpoint, and keyspace travel inside an OAuth token encrypted with a key only the deployment holds, or in the headers you send, and are used only to call Astra DB for that request.
- **Logs.** The hosting platform (Vercel) records standard request metadata such as time, path, status, and IP address, under [Vercel's privacy policy](https://vercel.com/legal/privacy-policy). The server doesn't log request bodies, tool results, or credentials.
- **OAuth clients.** When a client identifies itself with a metadata URL, the server fetches that public document to check the redirect URI, and caches it briefly in memory.

## Your controls

- Revoke access at any time by deleting the Astra token in the Astra console; every local and hosted credential derived from it stops working.
- `npx -y @erichare/astra-mcp uninstall` removes the agent configuration. Delete `.env` or the credentials file to remove stored credentials.

Questions: open an issue at [github.com/erichare/astra-db-plugin](https://github.com/erichare/astra-db-plugin/issues).
