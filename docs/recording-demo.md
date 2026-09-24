# Recording the demo

Two short clips make the README: the terminal setup, and an agent using the tools with interactive views. Record against a throwaway database, and never show a token on screen.

## 1. Seed a demo database

Create a database in the Astra console (any region), then:

```bash
npx -y @erichare/astra-mcp login --global      # hidden token prompt; pick the demo database
cd server && ASTRA_DB_APPLICATION_TOKEN=… ASTRA_DB_API_ENDPOINT=… npm run seed
```

`npm run seed` creates `astra_plugin_demo`, a vectorize collection with lexical search and reranking, holding about 50 articles, so every view has realistic data. It's idempotent. Set `ASTRA_DEMO_COLLECTION` to use another name.

## 2. Terminal clip (vhs)

[vhs](https://github.com/charmbracelet/vhs) replays [`demo.tape`](demo.tape): `init --dry-run` for three agents, then `doctor`.

```bash
vhs docs/demo.tape          # writes assets/demo.gif
```

Because it's a dry run, nothing on the recording machine changes, and `doctor` masks the token.

## 3. Agent clip

In Claude Desktop, or claude.ai with the hosted connector, at a window about 1280×800:

1. "What's in my Astra database?" shows the overview view.
2. Click `astra_plugin_demo` for the collection view, then *Browse documents* for the explorer.
3. "Find articles about hybrid search with reranking" shows ranked results; switch to *Map*.
4. "Write a Python script that searches this collection for the top 5 matches of a query." The agent calls `code_examples` and writes the file.

Keep each clip under 30 seconds, and trim loading pauses. Export as GIF (under 5 MB) or MP4 for the README.

## Static screenshots

The view screenshots in `assets/widgets/` come from the automated UI harness, which renders every view in light and dark:

```bash
cd server && npm run build:ui && npm run test:ui -- --screenshots ../assets/widgets
```
