# Publishing (maintainers)

One version number covers everything: the npm package, both plugin manifests, both marketplaces, the MCP Registry entry, and the Claude Desktop bundle.

## Cut a release

```bash
node scripts/bump-version.mjs minor        # or major, patch, or an exact 2.1.0
node scripts/check-versions.mjs            # all version locations agree
```

The bump script updates every manifest, the exact server pins in the Claude Code and Codex plugins, and `server/package-lock.json`. It also turns the `## Unreleased` section of `CHANGELOG.md` into `## X.Y.Z — <date>`, and that section becomes the GitHub Release notes. Commit the result.

Then run **Release** (`.github/workflows/release.yml`) in one of two ways:

- **From a branch, before merging** (Actions → Release → *Run workflow*). It publishes whatever version the manifests at that commit carry. This is the safe order: npm has the server before the marketplaces point at it. `prerelease` and `npm_tag` are optional inputs.
- **From a tag:** `git tag v2.1.0 && git push origin v2.1.0`. The tag must match the manifests.

The workflow:

1. runs the whole CI suite
2. publishes `@erichare/astra-mcp` to npm with provenance, skipping versions that already exist; pre-release versions (`2.1.0-rc.1`) go to the `next` dist-tag, never `latest`
3. installs the published version with `npx` as a smoke test
4. publishes `server/server.json` to the MCP Registry (`io.github.erichare/astra-mcp`)
5. creates the GitHub Release `vX.Y.Z` with `astra-db-X.Y.Z.mcpb`, a stable `astra-db.mcpb` for `releases/latest/download/`, and `astra-db-bob.zip`

Merge after it succeeds. Claude Code and Codex users get the new version through their plugin marketplaces.

## One-time setup

**npm trusted publishing.** npm can only trust a package that already exists, so the very first publish uses a token:

1. Create a GitHub environment named `npm` (*Settings → Environments*). Required reviewers are a good idea.
2. Add a granular npm access token with publish rights for `@erichare/astra-mcp` as the environment secret `NPM_TOKEN`, then run the release.
3. On npmjs.com, open the package's settings, add a trusted publisher (GitHub Actions, repository `erichare/astra-db-plugin`, workflow `release.yml`, environment `npm`), and disallow token publishing.
4. Delete the `NPM_TOKEN` secret. From then on, the job authenticates with OIDC and signs provenance automatically.

**MCP Registry.** Nothing to set up: `mcp-publisher login github-oidc` proves ownership of the `io.github.erichare/*` namespace from the workflow's OIDC token. The registry checks that `server.json`'s `name` matches `mcpName` in `server/package.json`.

**Hosted server.** See [hosted.md](hosted.md#self-hosting-on-vercel). Vercel deploys `server/` on its own; the release workflow doesn't touch it.

## Directories

| Where | What to submit |
| --- | --- |
| Claude Code plugin directory | The marketplace `erichare/astra-db-plugin` (plugin `astra-db`) |
| Anthropic connectors directory | The hosted URL, with [privacy.md](privacy.md) as the privacy policy |
| Smithery | `server/smithery.yaml` (local stdio via npm), or the hosted URL |
| Docker MCP Catalog | `server/Dockerfile`, built from the repository root |
| Cursor and VS Code | The install links in the README |

## Before the first 2.x release

- Confirm the licensing of the vendored `astra-toolkit` examples with the upstream author. They ship inside the npm package and the `.mcpb` for the `code_examples` tool. See [NOTICE](../NOTICE).
- Smoke-test on Windows, and in Codex and Bob, on a real database.
