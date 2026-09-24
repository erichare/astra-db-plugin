# IBM Bob

Bob gets the full feature set, built from the same skills as every other agent: the knowledge skills, slash commands, three custom modes, a credential rule, lifecycle hooks, and the MCP server.

## Install

```bash
npx -y @erichare/astra-mcp init --agents bob             # for every project: ~/.bob/
npx -y @erichare/astra-mcp init --agents bob --project   # this project only: ./.bob/
```

Then connect a database with `npx -y @erichare/astra-mcp login` (or `login --global`). Each GitHub Release also carries `astra-db-bob.zip`, a project-level `.bob/` bundle you can unzip into a repository; `npx -y @erichare/astra-mcp bob-bundle --out astra-db-bob.zip` builds the same zip locally.

## What gets installed

| | Project (`.bob/`) | Global (`~/.bob/`) |
| --- | --- | --- |
| Knowledge skills `astra-toolkit`, `astra-widgets` | `skills/` | `skills/` |
| Commands `/astra-setup`, `/astra-doctor`, `/astra-data-model-review`, `/astra-overview`, `/astra-collection`, `/astra-explore`, `/astra-similar` | `commands/` | `commands/` |
| Modes *Astra Reviewer*, *Astra Data Modeler*, *Astra Migration Helper* (groups `read`, `command`, `mcp`) | `custom_modes.yaml` | `settings/custom_modes.yaml` |
| MCP server `astra-db`, with read tools in `alwaysAllow` | `mcp.json` | the existing MCP settings file, else `settings/mcp.json` |
| Rule `astra-db.md`: env credentials, no tokens in chat or files, confirm destructive changes | `rules/` | `rules/` |
| Hooks: credential guard (`PreToolUse`) and connection summary (`SessionStart`) | `hooks/astra-db/` + `settings.json` | `hooks/astra-db/` + `settings/settings.json` |

The installer merges with what's already there. Modes go between `# astra-db:begin` and `# astra-db:end` markers, JSON files are edited in place with comments preserved, and the first change to each existing file leaves a `.bak-astra` backup. Everything written is recorded in `astra-db.manifest.json`.

## Update and remove

Run `init --agents bob` again to update. `npx -y @erichare/astra-mcp uninstall --agents bob` (add `--project` for `.bob/`) removes exactly what the manifest lists, takes out the marked modes block and the `astra-db` MCP and hook entries, and leaves the rest of your configuration alone.

## Notes

- Skills and links are rewritten for Bob's layout. A link to another skill becomes `.bob/skills/…`, a workflow reference becomes its `/astra-*` command, and a persona reference becomes the mode.
- The hooks run with `--host=bob` and block by exiting with status 2, with the reason on stderr.
- Bob's hook support is recent. If your Bob version ignores `settings.json` hooks, the rule still carries the same guidance.
