# Blogs

Source-of-truth Markdown for posts published to [saket.whiz.pub](https://saket.whiz.pub).

The whiz.pub subdomain is the *rendered* output; this folder is where the drafts live and get version-controlled alongside the portfolio.

---

## File convention

- Filename: `YYYY-MM-DD-slug.md` (chronological, easy to sort).
- YAML frontmatter at the top with `title`, `slug`, `summary`, `tags`, `status`.
- Markdown body below.
- **The `slug` in frontmatter becomes the URL** on whiz.pub — `https://saket.whiz.pub/<slug>`.

Example:

```yaml
---
title: A dbt project. Snowflake to Spark. Zero rewrites.
slug: dbt-polyglot-launch
summary: How I built dbt-polyglot — a compile-time SQL-dialect transpiler…
tags: [dbt, snowflake, spark, iceberg, data-engineering, open-source]
status: published
---

# A dbt project. Snowflake to Spark. Zero rewrites.

...body markdown...
```

Frontmatter field reference: <https://docs.whiz.pub/cli#write>.

---

## Publishing to whiz.pub

Use the Python script at [`scripts/publish-to-whiz.py`](../scripts/publish-to-whiz.py). It calls whiz.pub's REST API directly — zero dependencies, works on macOS / Linux / any Python 3.9+.

### One-time setup

Get your API key from <https://app.whiz.pub/settings> (log in → **API Key** section), then export it:

```bash
export WHIZ_API_KEY="sk_your_key_here"
# Optional: add to ~/.zshrc / ~/.bashrc so it persists across sessions
```

### Publish a new post

```bash
# From the portfolio repo root
python3 scripts/publish-to-whiz.py blogs/2026-07-05-dbt-polyglot-launch.md
```

The script reads the frontmatter, POSTs to `https://api.whiz.pub/v1/posts`, and prints the response plus the live URL.

- `status: published` → live immediately
- `status: draft` → uploaded but unlisted

### Update an existing post

Same command, same file. **`POST /v1/posts` is upsert-by-slug** — running it again for the same `slug` updates the post in place. Edit the markdown, re-run the command, refresh the browser.

```bash
python3 scripts/publish-to-whiz.py blogs/2026-07-05-dbt-polyglot-launch.md
```

### Raw curl alternative

For a quick test or a CI script, hit the API directly:

```bash
curl -sS -X POST https://api.whiz.pub/v1/posts \
  -H "Authorization: Bearer $WHIZ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "A dbt project. Snowflake to Spark. Zero rewrites.",
    "slug": "dbt-polyglot-launch",
    "content": "# ...full markdown body here...",
    "tags": ["dbt", "snowflake", "spark"],
    "summary": "How I built dbt-polyglot…",
    "status": "published"
  }'
```

Docs: <https://docs.whiz.pub/api>.

---

## Workflow

1. Draft in `blogs/YYYY-MM-DD-slug.md`.
2. `git commit` + push — post is version-controlled and appears in the portfolio repo.
3. `python3 scripts/publish-to-whiz.py blogs/…md` — goes live at `https://saket.whiz.pub/<slug>`.
4. Portfolio homepage's `BlogPreview.astro` fetches the whiz.pub RSS at build-time and shows the latest posts inline — refreshes on next Cloudflare Pages deploy.

One source of truth for the writing, two surfaces (whiz.pub + portfolio homepage), zero manual sync.

---

## Post index

| Date | Slug | Title | Status |
|---|---|---|---|
| 2026-07-05 | `dbt-polyglot-launch` | A dbt project. Snowflake to Spark. Zero rewrites. | Published |
| 2026-07-05 | `lakehouse-lab` | 58 broken pipelines you can fix on your laptop. | Draft |
