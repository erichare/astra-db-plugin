<div align="center">

# Astra DB Plugin

**Agent-native tooling for [Astra DB](https://astra.datastax.com) (DataStax / IBM) and HCD —<br>one continuously synced content tree, packaged natively for Claude Code, OpenAI Codex / ChatGPT, and IBM Bob.**

[![CI](https://github.com/erichare/astra-db-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/erichare/astra-db-plugin/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/erichare/astra-db-plugin?color=brightgreen)](https://github.com/erichare/astra-db-plugin/releases)
[![skillsaw grade](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Ferichare%2Fastra-db-plugin%2Fmain%2F.skillsaw-badge.json)](https://skillsaw.org/)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)

[![Install for Claude Code](https://img.shields.io/badge/Claude_Code-Install-D97757?style=for-the-badge&logo=claude&logoColor=white)](#claude-code)
[![Install for OpenAI Codex](https://img.shields.io/badge/OpenAI_Codex-Install-000000?style=for-the-badge&logo=openai&logoColor=white)](#openai-codex)
[![Install for IBM Bob](https://img.shields.io/badge/IBM_Bob-Install-0F62FE?style=for-the-badge&logo=ibm&logoColor=white)](#ibm-bob)
[![Install for any Agent Skills harness](https://img.shields.io/badge/Agent_Skills-Install-6B7280?style=for-the-badge)](#any-agent-skills-harness)

</div>

The skill content is synchronized from [sl-at-ibm/astra-toolkit-skill](https://github.com/sl-at-ibm/astra-toolkit-skill) by Stefano Lottini (IBM / DataStax): progressive-disclosure instructions covering the Astra CLI, application architecture patterns, data modeling for Collections and Tables, and roughly 340 documentation-derived Data API snippets per client language (Python, TypeScript, Java, C#, Go — about 1,660 example files). The skill is self-sufficient by design — the agent gets every Data API detail right without web lookups — and costs only ~420 always-on tokens: the snippet library loads on demand.

## Install

### Claude Code

One command in your terminal:

```bash
claude plugin marketplace add erichare/astra-db-plugin && claude plugin install astra-db@astra-db-marketplace
```

Or inside a Claude Code session:

```
/plugin marketplace add erichare/astra-db-plugin
/plugin install astra-db@astra-db-marketplace
```

You get the skill plus commands (`/astra-db:setup`, `/astra-db:doctor`, `/astra-db:data-model-review`, `/astra-db:sync-check`), three review/design agents, safety hooks, and the bundled MCP server.

### OpenAI Codex

**Native plugin** (recommended) — this repository ships a [Codex plugin manifest](.codex-plugin/plugin.json) and repo marketplace (`.agents/plugins/marketplace.json`) per the [OpenAI plugin spec](https://developers.openai.com/plugins/build/plugins):

```bash
codex plugin marketplace add erichare/astra-db-plugin
```

then run `/plugins` inside Codex (or open the Plugins tab in the ChatGPT app) and install **Astra DB**. The native plugin carries the skill, the bundled MCP server (`.mcp.codex.json`, active when `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT` are in your environment), and the lifecycle hooks.

**Skill-only fallback** — the canonical skill also ships in the standard [Agent Skills](https://agentskills.io) layout:

```bash
npx skills add erichare/astra-db-plugin
```

or, without Node:

```bash
curl -fsSL https://raw.githubusercontent.com/erichare/astra-db-plugin/main/install.sh | bash -s -- codex
```

which copies the skill into `~/.codex/skills/astra-toolkit` (set `CODEX_HOME` to override).

### IBM Bob

From your project root:

```bash
curl -fsSL https://raw.githubusercontent.com/erichare/astra-db-plugin/main/install.sh | bash -s -- bob
```

which installs `.bob/skills/astra-toolkit` — the same layout as the upstream repository, so cloning this repository into place works too.

### Any Agent Skills harness

Cursor, Gemini CLI, or anything else that reads the [agentskills.io](https://agentskills.io) layout:

```bash
curl -fsSL https://raw.githubusercontent.com/erichare/astra-db-plugin/main/install.sh | bash -s -- skills-dir <your-skills-directory>
```

From a cloned checkout, `./install.sh <target>` does the same without re-fetching.

## What's inside

| Component | Details |
| --- | --- |
| **Skill** `astra-toolkit` | `SKILL.md` entry point; per-topic instruction files loaded on demand; `clients/<language>/examples/` snippet library |
| **Commands** | `/astra-db:setup` (CLI install, token, `.env`), `/astra-db:doctor` (setup diagnostics), `/astra-db:data-model-review`, `/astra-db:sync-check` (maintainer) |
| **Agents** | `astra-reviewer` (Data API usage review), `astra-data-modeler` (schema design), `astra-migration-helper` (staged migration plans) |
| **MCP server** | [`@datastax/astra-db-mcp`](https://github.com/datastax/astra-db-mcp) wired via `.mcp.json` for live database operations |
| **Hooks** | Credential guard (blocks hardcoded `AstraCS:` tokens); daily upstream-freshness notice |

Claude Code gets every component. The native Codex/ChatGPT plugin gets the skill, MCP server, and hooks (commands and agents are Claude Code concepts). Bob and other Agent Skills harnesses get the full skill.

## Live database tools (MCP)

The bundled MCP server activates when these environment variables are set:

- `ASTRA_DB_APPLICATION_TOKEN` — a Database Administrator token
- `ASTRA_DB_API_ENDPOINT` — your database's Data API endpoint

Run `/astra-db:setup` to install the Astra CLI and generate a `.env` containing both. The skill content works with no credentials at all — the MCP server is optional.

## Maintainers

Content flow: `sl-at-ibm/astra-toolkit-skill` → `scripts/sync_upstream.py` → `skills/astra-toolkit/` (canonical) → `scripts/build_layouts.py` → `.bob/skills/astra-toolkit/` (generated, committed).

- **Sync**: `.github/workflows/sync.yml` runs weekly and opens a PR when upstream changed (`sync-manifest.json` records the upstream SHA). Manual refresh: `python3 scripts/sync_upstream.py && python3 scripts/build_layouts.py`.
- **Content is verbatim** with one deliberate exception: `DESCRIPTION_OVERRIDES` in `scripts/sync_upstream.py` patches the skill's frontmatter description with routing trigger phrasing (proposed upstream; the override is deleted once adopted).
- **CI** (`.github/workflows/ci.yml`): skillsaw `--strict` plus an A+ grade gate, layout parity, Python/TypeScript snippet syntax checks, the pytest suite (sync/build/release scripts, both hooks, the installer, and skill-content integrity — 90% coverage gate on `scripts/`), and `claude plugin validate`. Run locally with `pytest tests/`.
- **Evals** (`evals/`): three `claude plugin eval` cases (Python vector collection, TypeScript filtered find, Collections-vs-Tables reasoning) with `file_exists`, `tool_used: Skill`, and LLM rubric graders. `plugin eval` is early-access; run `claude plugin eval . --no-publish` once enabled for the account.
- **Releases** (`.github/workflows/release.yml`): merges touching plugin content auto-bump the patch version, tag, and update the changelog. Use `scripts/bump_version.py minor|major` manually for larger changes.

## License and provenance

The packaging in this repository (scripts, commands, agents, hooks, workflows) is licensed under [Apache-2.0](LICENSE). Bundled skill content originates from [sl-at-ibm/astra-toolkit-skill](https://github.com/sl-at-ibm/astra-toolkit-skill) and derives from the [DataStax documentation](https://docs.datastax.com); see [NOTICE](NOTICE) for details. This distribution is maintained in coordination with the upstream author. It is a community project, not an official DataStax, IBM, Anthropic, or OpenAI product; product names and logos identify the target platforms only.
