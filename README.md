# Astra DB Plugin

![skillsaw grade](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Ferichare%2Fastra-db-plugin%2Fmain%2F.skillsaw-badge.json)

First-class agent tooling for [Astra DB](https://astra.datastax.com) (DataStax / IBM) and HCD, packaged for **Claude Code**, **OpenAI Codex**, and **IBM Bob** from a single continuously synced content tree.

The skill content is synchronized from [sl-at-ibm/astra-toolkit-skill](https://github.com/sl-at-ibm/astra-toolkit-skill) by Stefano Lottini (IBM / DataStax): progressive-disclosure instructions covering the Astra CLI, application architecture patterns, data modeling for Collections and Tables, and roughly 340 documentation-derived Data API snippets per client language (Python, TypeScript, Java, C#, Go — about 1,660 example files). The skill is self-sufficient by design: the agent gets every Data API detail right without web lookups.

## What's inside

| Component | Details |
| --- | --- |
| **Skill** `astra-toolkit` | `SKILL.md` entry point; per-topic instruction files loaded on demand; `clients/<language>/examples/` snippet library |
| **Commands** | `/astra-db:setup` (CLI install, token, `.env`), `/astra-db:doctor` (setup diagnostics), `/astra-db:data-model-review`, `/astra-db:sync-check` (maintainer) |
| **Agents** | `astra-reviewer` (Data API usage review), `astra-data-modeler` (schema design), `astra-migration-helper` (staged migration plans) |
| **MCP server** | [`@datastax/astra-db-mcp`](https://github.com/datastax/astra-db-mcp) wired via `.mcp.json` for live database operations |
| **Hooks** | Credential guard (blocks hardcoded `AstraCS:` tokens); daily upstream-freshness notice |

## Install

### Claude Code

```
/plugin marketplace add erichare/astra-db-plugin
/plugin install astra-db@astra-db-marketplace
```

### OpenAI Codex and other Agent Skills harnesses

The canonical skill lives at `skills/astra-toolkit/` in the standard [Agent Skills](https://agentskills.io) layout:

```
npx skills add erichare/astra-db-plugin
```

or copy `skills/astra-toolkit/` into your harness's skills directory (for Codex: `~/.codex/skills/` globally, or your project's skills directory).

### IBM Bob

This repository ships the Bob layout directly — clone it and Bob discovers `.bob/skills/astra-toolkit/`, exactly as with the upstream repository. Alternatively, copy `.bob/skills/astra-toolkit/` into your project's `.bob/skills/`.

## Live database tools (MCP)

The bundled MCP server activates when these environment variables are set:

- `ASTRA_DB_APPLICATION_TOKEN` — a Database Administrator token
- `ASTRA_DB_API_ENDPOINT` — your database's Data API endpoint

Run `/astra-db:setup` to install the Astra CLI and generate a `.env` containing both. The skill content works with no credentials at all — the MCP server is optional.

## Maintainers

Content flow: `sl-at-ibm/astra-toolkit-skill` → `scripts/sync_upstream.py` → `skills/astra-toolkit/` (canonical) → `scripts/build_layouts.py` → `.bob/skills/astra-toolkit/` (generated, committed).

- **Sync**: `.github/workflows/sync.yml` runs weekly and opens a PR when upstream changed (`sync-manifest.json` records the upstream SHA). Manual refresh: `python3 scripts/sync_upstream.py && python3 scripts/build_layouts.py`.
- **Content is verbatim** with one deliberate exception: `DESCRIPTION_OVERRIDES` in `scripts/sync_upstream.py` patches the skill's frontmatter description with routing trigger phrasing (proposed upstream; the override is deleted once adopted).
- **CI** (`.github/workflows/ci.yml`): skillsaw `--strict` plus an A+ grade gate, layout parity, Python/TypeScript snippet syntax checks, the pytest suite (sync/build/release scripts, both hooks, and skill-content integrity — 90% coverage gate on `scripts/`), and `claude plugin validate`. Run locally with `pytest tests/`.
- **Evals** (`evals/`): three `claude plugin eval` cases (Python vector collection, TypeScript filtered find, Collections-vs-Tables reasoning) with `file_exists`, `tool_used: Skill`, and LLM rubric graders. `plugin eval` is early-access; run `claude plugin eval . --no-publish` once enabled for the account.
- **Releases** (`.github/workflows/release.yml`): merges touching plugin content auto-bump the patch version, tag, and update the changelog. Use `scripts/bump_version.py minor|major` manually for larger changes.

## License and provenance

The packaging in this repository (scripts, commands, agents, hooks, workflows) is licensed under [Apache-2.0](LICENSE). Bundled skill content originates from [sl-at-ibm/astra-toolkit-skill](https://github.com/sl-at-ibm/astra-toolkit-skill) and derives from the [DataStax documentation](https://docs.datastax.com); see [NOTICE](NOTICE) for details. This distribution is maintained in coordination with the upstream author.
