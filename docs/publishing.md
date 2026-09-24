# Publishing (maintainers)

One version number covers everything: the npm package, both plugin manifests, both marketplaces, the MCP Registry entry, and the Claude Desktop bundle.

## Cut a release

```bash
node scripts/bump-version.mjs minor        # or major, patch, or an exact 2.1.0
node scripts/check-versions.mjs            # all version locations agree
```

The bump script updates every manifest, the exact server pins in the Claude Code and Codex plugins, and `server/package-lock.json`. It also turns the `## Unreleased` section of `CHANGELOG.md` into `## X.Y.Z — <date>`, and that section becomes the GitHub Release notes. Commit the result.

Then run **Release** (`.github/workflows/release.yml`) in one of two ways:

- **From a branch, before merging** (Actions → Release → *Run workflow*). It publishes whatever version the manifests at that commit carry. This is the safe order: npm has the server before the marketplaces point at it. `prerelease` and `npm_tag` are optional inputs. GitHub only offers *Run workflow* for workflows that already exist on `main`, so this works from the release after 2.0.0 onwards.
- **From a tag:** `git tag v2.1.0 && git push origin v2.1.0`. The tag must match the manifests. A tag build uses the workflow file from the tagged commit, so this also works on a branch that isn't merged yet (that's how 2.0.0 ships). Merge that branch with a merge commit so the tagged commit ends up on `main`.

The workflow:

1. runs the whole CI suite
2. publishes `@erichare/astra-mcp` to npm with provenance, skipping versions that already exist; pre-release versions (`2.1.0-rc.1`) go to the `next` dist-tag, never `latest`
3. installs the published version with `npx` as a smoke test
4. publishes `server/server.json` to the MCP Registry (`io.github.erichare/astra-mcp`)
5. creates the GitHub Release `vX.Y.Z` with `astra-db-X.Y.Z.mcpb`, a stable `astra-db.mcpb` for `releases/latest/download/`, and `astra-db-bob.zip`

Merge after it succeeds. Claude Code and Codex users get the new version through their plugin marketplaces.

## One-time setup

**npm trusted publishing.** npm can only trust a package that already exists, so the very first publish uses a token:

1. Create a GitHub environment named `npm` (*Settings → Environments*). Required reviewers are a good idea. If you restrict its deployment branches and tags, allow tags matching `v*`.
2. On npmjs.com, create a granular access token (*Access Tokens → Generate New Token → Granular*): read and write on the `@erichare` scope, a 1-day expiry, and *Bypass two-factor authentication* if your account requires 2FA for writes. Store it as the environment secret `NPM_TOKEN`, either in the GitHub UI or with `gh secret set NPM_TOKEN --env npm --repo erichare/astra-db-plugin`, which prompts for it. Never paste it into a chat or a file.
3. Run the release (for 2.0.0: push the tag). The token publishes, and provenance is still signed because the job has `id-token: write`.
4. On npmjs.com, open the package's *Settings → Trusted publishing*, add GitHub Actions with user `erichare`, repository `astra-db-plugin`, workflow `release.yml`, and environment `npm`. Then set publishing access to require 2FA and disallow tokens.
5. Delete the npm token and the `NPM_TOKEN` secret. From then on, the job authenticates with OIDC.

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
