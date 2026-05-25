# Family OS handoff

## How to run the current preview

From the `family-os` directory:

```bash
python3 -m http.server 4173 --bind 0.0.0.0 --directory preview
```

Open:

```text
http://localhost:4173/
```

## What to edit first

For fast product changes, edit:

```text
preview/index.html
```

For production React implementation, edit:

```text
src/
```

## Before continuing after a context reset

Read:

- `PROJECT_MEMORY.md`;
- `docs/ARCHITECTURE.md`;
- `docs/PRODUCT_NOTES.md`;
- `preview/index.html`.

Then continue with the preview first, because it contains the newest UX decisions.

## GitHub workflow

Recommended branch names:

- `main` for the current working version;
- `codex/feature-name` for larger future changes.

Before pushing, run at least:

```bash
git status --short --branch
```

If dependencies are installed, also run:

```bash
npm run build
```

