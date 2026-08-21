# Changelog

## Unreleased

- **Feature parity across harnesses.** IBM Bob now gets the full bundle: `/astra-setup`, `/astra-doctor`, `/astra-data-model-review` slash commands, three custom modes (`astra-reviewer`, `astra-data-modeler`, `astra-migration-helper`) in `.bob/custom_modes.yaml`, the Astra DB MCP server in `.bob/mcp.json`, and a credential-hygiene rule. OpenAI Codex / ChatGPT gets the same commands and agents as `$astra-*` skills.
- Codex installs headlessly: `codex plugin marketplace add erichare/astra-db-plugin && codex plugin add astra-db@astra-db-marketplace` (also `install.sh codex-plugin`). The Codex plugin root is now the self-contained `codex/` directory.
- `install.sh bob` installs the whole Bob bundle and merges safely with existing `.bob/` config; new `--global` flag targets `~/.bob/`.
- Credential-guard hook now also matches Codex's `apply_patch` tool; SessionStart hook gains a status message.
- Releases pick the semver level from the conventional commit (`feat` → minor).

## 1.0.2 — 2026-08-21

- Content sync / maintenance release.

## 1.0.1 — 2026-08-21

- Content sync / maintenance release.

## 1.0.0 — 2026-08-20

- Initial release: astra-toolkit skill (synced from sl-at-ibm/astra-toolkit-skill), three commands (`setup`, `data-model-review`, `sync-check`), three agents (`astra-reviewer`, `astra-data-modeler`, `astra-migration-helper`), credential-guard and freshness hooks, bundled Astra DB MCP server, and layouts for Claude Code, Agent Skills harnesses (Codex), and IBM Bob.
