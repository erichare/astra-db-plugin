# Troubleshooting

Start here:

```bash
npx -y @erichare/astra-mcp doctor
```

It checks the Node.js version, where each credential comes from, Data API and DevOps reachability, whether `.env` is git-ignored, committed tokens in tracked files, and each agent's configuration. Every failed check comes with a fix, and `--json` gives machine-readable output. Inside an agent, `/astra-db:doctor` (Claude Code) or asking "why isn't Astra DB working?" runs the same checks along with the live `connection_status` tool.

## Tool errors

| Error | Cause | Fix |
| --- | --- | --- |
| `not_configured` | No token found | Run `npx -y @erichare/astra-mcp login` in a terminal. No restart needed |
| `invalid_credentials` | Token revoked, expired, or mistyped | `login` again with a fresh token |
| `forbidden` on `list_databases` | The token is scoped to one database | Set `ASTRA_DB_API_ENDPOINT` (`login` asks for it); other tools still work |
| `forbidden` on a write | The token's role is read-only | Use a *Database Administrator* token, or keep exploring read-only |
| `ambiguous_database` | Token but no endpoint, and several active databases | Pass `database` to the tool, set `ASTRA_DB_NAME`, or pin one with `login` |
| `not_found` | Wrong name, keyspace, or database | `database_overview` lists what exists; names are case-sensitive |
| `timeout` | Hibernated database waking up, or network | Retry after a minute |
| `unsupported_query` on hybrid search | The collection lacks lexical or rerank | Search without `hybrid`, or create a collection with both |
| `confirmation_required` | A destructive operation | Expected: the agent should explain the impact and ask you |

## The server doesn't start, or tools are missing

- **Node.js 20+** has to be on the `PATH` your agent sees. GUI apps on macOS may not inherit your shell's `PATH` (a Node installed with nvm, for example). Install Node system-wide, or put its absolute path in the server entry's `command`.
- **First start is slow.** `npx` downloads the package once, and later starts use the cache.
- **Windows.** Entries must launch through `cmd /c npx …`; `init` writes them that way.
- **No write tools.** The server is in read-only mode (`connection_status` reports `readOnly`), or it's a hosted connection without write access.
- **An old `astra-widgets` or `@datastax/astra-db-mcp` entry** still in your config causes duplicate tools. `init` offers to replace it, and `doctor` reports it.

## Credentials aren't picked up

- `doctor` and `connection_status` list every file consulted. The dotenv search starts in the project directory (`CLAUDE_PROJECT_DIR` in Claude Code, `${workspaceFolder}` in VS Code, otherwise the server's working directory) and stops at the git root.
- Some agents start MCP servers from your home directory rather than the project, as Claude Desktop does. Use `login --global`, or set `ASTRA_MCP_PROJECT_DIR` in the server entry.
- A variable exported in your shell only reaches agents started from that shell. `.env` and `login --global` avoid this.
- The first source wins, per value. A stale `ASTRA_DB_API_ENDPOINT` in your environment beats a fresh `.env`; `connection_status` shows the winner.

## The credential guard blocked a write

The agent tried to put an `AstraCS:` token into a file. Read it from the environment (`ASTRA_DB_APPLICATION_TOKEN`) instead. Writing to a git-ignored `.env` is allowed; a plain `.env` that git doesn't ignore prompts first. See [security.md](security.md).

## Views don't render

MCP Apps views need a host that supports them. In other hosts the tools still return the data as text, and you can ask for a standalone page (`emit: "html_file"`, local server only). In Claude Code, `/astra-db:overview` and the other shortcuts pick the best option for the host.

## Still stuck

Open an issue with `npx -y @erichare/astra-mcp doctor --json` output attached. It contains no secrets, but check it before posting anyway.
