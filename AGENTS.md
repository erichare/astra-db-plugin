# AGENTS.md

Guidance for coding agents working on this repository. Humans: see [CONTRIBUTING.md](CONTRIBUTING.md).

## What this is

Astra DB for coding agents, from one source tree:

- `server/` is the npm package `@erichare/astra-mcp`: the MCP server (stdio and hosted HTTP), the setup CLI (`init`, `login`, `doctor`, `uninstall`, `bob-bundle`), and the MCP Apps UI. TypeScript, MCP SDK v2, `@modelcontextprotocol/ext-apps`, `@datastax/astra-db-ts`. It's bundled by esbuild into one dependency-free `dist/cli.js`.
- `skills/` holds every skill. Claude Code and Codex load it directly; the Bob bundle is generated from it ([`server/src/cli/bob.ts`](server/src/cli/bob.ts)).
- `hooks/` holds dependency-free Node ESM hooks, shared by Claude Code, Codex, and Bob.
- `.claude-plugin/` and `.codex-plugin/` are the plugin manifests; [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json) is the Codex marketplace.
- `evals/` holds `claude plugin eval` cases. `evals/mocks/astra-db/` is generated.
- `scripts/` holds repository tooling (versions, example codemod, indexes, checks); `tests/` has its `node --test` suite.

## Commands

```bash
cd server
npm ci
npm run check          # Biome lint (the formatter is off; match the surrounding style)
npm run typecheck
npm test               # vitest: unit, tools, HTTP/OAuth, CLI, UI views, eval-mock freshness
npm run build          # UI → src/generated, assets.json, dist/cli.js
npm run test:e2e       # stdio smoke test against dist/cli.js (needs build)
npm run test:ui        # the app shell in Chromium through the official AppBridge (needs build:ui)

cd ..
node --test tests/*.test.mjs                  # hooks, manifests, skills, markdown links, scripts
node scripts/check-versions.mjs
node scripts/codemod-examples.mjs --check     # examples read env vars, no placeholders
node scripts/build-examples-index.mjs --check # clients/<lang>/INDEX.md up to date
claude plugin validate . --strict
skillsaw lint . --strict                      # must stay at grade A+
```

## Rules

- **Never put a real token anywhere.** Tests use obviously fake `AstraCS:` strings. The credential-guard hook exists for this.
- **Don't commit generated files**: `server/dist/`, `server/src/generated/`, `THIRD_PARTY_NOTICES.md`. The exception is `evals/mocks/astra-db/`: regenerate it with `UPDATE_EVAL_MOCKS=1 npx vitest run tests/evals` whenever tool output, descriptions, or schemas change. The test fails when it's stale.
- **Versions** move only through `node scripts/bump-version.mjs`, which updates every manifest and pin together.

## Conventions

- **Tools.** Inputs and outputs live in [`server/src/server/schemas.ts`](server/src/server/schemas.ts), registration and descriptions in `tools.ts`, and summaries in `summaries.ts`. A tool gets one `z.object` output schema. Errors are `AstraMcpError` codes ([`server/src/astra/errors.ts`](server/src/astra/errors.ts)), never thrown out of a handler. Keep [`docs/tools.md`](docs/tools.md) in sync.
- **Destructive operations** go through `requireConfirmation` ([`server/src/server/confirm.ts`](server/src/server/confirm.ts)). Don't add a path that deletes data without it.
- **Server instructions** (`instructions.ts`) stay under about 1,800 characters, because hosts truncate at 2,048.
- **Skills.** The frontmatter `description` says what the skill does and when to use it. Shortcut skills set `disable-model-invocation: true` plus `agents/openai.yaml` with `allow_implicit_invocation: false`. Personas carry `metadata.kind: persona` and `bob-*` keys. Link between skills with relative paths (`../astra-toolkit/…`).
- **Vendored content.** `skills/astra-toolkit/` comes from upstream (see NOTICE). Change examples only through [`scripts/codemod-examples.mjs`](scripts/codemod-examples.mjs), and record other modifications in NOTICE.
- **Credentials resolve per call** ([`server/src/credentials/resolver.ts`](server/src/credentials/resolver.ts)). Don't cache them across calls in a way that would make `login` need a restart.
- **Commits** follow Conventional Commits (`feat(server): …`, `fix(hooks): …`, `docs: …`).
