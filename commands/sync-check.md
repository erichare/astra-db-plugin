---
description: "Maintainer: check whether the bundled skill content is current with upstream astra-toolkit-skill"
---

Check whether this plugin's bundled skill content is up to date with its upstream source (sl-at-ibm/astra-toolkit-skill). This is a maintainer-facing command.

## Compare local and upstream

1. Read `sync-manifest.json` at the plugin root (`${CLAUDE_PLUGIN_ROOT}/sync-manifest.json` when installed, or the repository root in a development checkout). Report the recorded `upstream_sha` and `synced_at`.
2. Fetch the current upstream HEAD: `git ls-remote https://github.com/sl-at-ibm/astra-toolkit-skill.git HEAD`.
3. Compare the two SHAs:
   - **Match** → report "up to date", including how long ago the last sync ran.
   - **Mismatch** → report both SHAs, then list the changed upstream files via `gh api repos/sl-at-ibm/astra-toolkit-skill/compare/<local>...<upstream> --jq '.files[].filename'`. If `gh` is unavailable or the API call fails, report the SHA mismatch without the file list and say why.

## Refresh (development checkouts only)

4. If this is a development checkout of the plugin repository (a `scripts/` directory is present), offer to run the refresh: `python3 scripts/sync_upstream.py && python3 scripts/build_layouts.py`, then show `git status` so the maintainer can review and commit. If this is an installed plugin (no `scripts/` directory), tell the user updates arrive through plugin updates and nothing needs doing locally.
