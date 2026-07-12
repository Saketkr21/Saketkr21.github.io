#!/usr/bin/env python3
"""
Publish a Markdown post to whiz.pub via the REST API.

Bypasses the `whiz` CLI (which has been returning 405 in the v0.1.0 build).
Uses only Python stdlib — no dependencies required.

USAGE:
    # 1. Get your API key from https://app.whiz.pub/settings
    export WHIZ_API_KEY="sk_your_api_key_here"

    # 2. Publish a post
    python3 scripts/publish-to-whiz.py blogs/2026-07-05-dbt-polyglot-launch.md

    # 3. Optional: use draft status by adding `status: draft` in frontmatter
    #    Same command updates existing posts (upsert-by-slug).

The script parses YAML frontmatter (title / slug / tags / summary / status /
featured_image / pinned / date) and sends the Markdown body as `content`.
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

API_BASE = os.environ.get("WHIZ_API_BASE", "https://api.whiz.pub").rstrip("/")
POSTS_ENDPOINT = f"{API_BASE}/v1/posts"


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Split a markdown string into (frontmatter_dict, body).

    Frontmatter is expected between two `---` fences at the start of the file.
    Minimal YAML parser — supports strings, quoted strings, booleans, and
    inline arrays (`tags: [a, b, c]`). Multi-line YAML is not supported;
    keep frontmatter fields on one line.
    """
    fm_pattern = re.compile(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", re.DOTALL)
    m = fm_pattern.match(text)
    if not m:
        return {}, text.strip()

    fm_raw, body = m.group(1), m.group(2)
    fm: dict = {}
    for raw_line in fm_raw.splitlines():
        line = raw_line.rstrip()
        if not line or line.strip().startswith("#") or ":" not in line:
            continue
        key, _, val = line.partition(":")
        key = key.strip()
        val = val.strip()

        # Inline arrays
        if val.startswith("[") and val.endswith("]"):
            inner = val[1:-1]
            fm[key] = [x.strip().strip("\"'") for x in inner.split(",") if x.strip()]
        # Quoted strings
        elif (val.startswith('"') and val.endswith('"')) or (
            val.startswith("'") and val.endswith("'")
        ):
            fm[key] = val[1:-1]
        # Booleans
        elif val.lower() in {"true", "false"}:
            fm[key] = val.lower() == "true"
        # Bare value (string)
        else:
            fm[key] = val
    return fm, body.strip()


def slugify(title: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", title.lower())
    slug = re.sub(r"[-\s]+", "-", slug).strip("-")
    return slug


def build_payload(fm: dict, body: str) -> dict:
    if not fm.get("title"):
        sys.exit("✗ Frontmatter missing required field: title")

    payload: dict = {
        "title": fm["title"],
        "slug": fm.get("slug") or slugify(fm["title"]),
        "content": body,
        "status": fm.get("status", "published"),
    }

    if fm.get("tags"):
        payload["tags"] = fm["tags"]
    if fm.get("summary"):
        payload["summary"] = fm["summary"]
    if fm.get("featured_image"):
        payload["featured_image"] = fm["featured_image"]
    if fm.get("pinned"):
        payload["pinned"] = bool(fm["pinned"])
    if fm.get("date"):
        payload["date"] = fm["date"]

    return payload


def publish(md_path: Path, api_key: str) -> None:
    text = md_path.read_text(encoding="utf-8")
    fm, body = parse_frontmatter(text)
    payload = build_payload(fm, body)

    print(f"→ POST {POSTS_ENDPOINT}", file=sys.stderr)
    print(f"  title  : {payload['title']}", file=sys.stderr)
    print(f"  slug   : {payload['slug']}", file=sys.stderr)
    print(f"  status : {payload['status']}", file=sys.stderr)
    print(f"  tags   : {payload.get('tags', [])}", file=sys.stderr)
    print(f"  body   : {len(body):,} chars", file=sys.stderr)
    print("", file=sys.stderr)

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        POSTS_ENDPOINT,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "saketkr21-publish/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp_body = resp.read().decode("utf-8", errors="replace")
            try:
                result = json.loads(resp_body)
            except json.JSONDecodeError:
                result = {"raw": resp_body}

            print(json.dumps(result, indent=2))

            # Derive live URL from response if possible
            slug = None
            if isinstance(result, dict):
                if "post" in result and isinstance(result["post"], dict):
                    slug = result["post"].get("slug")
                elif "slug" in result:
                    slug = result["slug"]
            slug = slug or payload["slug"]

            print("", file=sys.stderr)
            print(f"✓ Published: https://saket.whiz.pub/{slug}", file=sys.stderr)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        print(f"✗ API error {e.code} {e.reason}", file=sys.stderr)
        print(f"  URL: {POSTS_ENDPOINT}", file=sys.stderr)
        print(f"  Response body:\n{err_body}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        sys.exit(f"✗ Network error: {e.reason}")


def main() -> None:
    if len(sys.argv) != 2 or sys.argv[1] in {"-h", "--help"}:
        print(__doc__, file=sys.stderr)
        sys.exit(0 if len(sys.argv) == 2 else 1)

    api_key = os.environ.get("WHIZ_API_KEY")
    if not api_key:
        sys.exit(
            "✗ Set WHIZ_API_KEY environment variable.\n"
            "  Get your key from https://app.whiz.pub/settings"
        )

    md_path = Path(sys.argv[1])
    if not md_path.exists():
        sys.exit(f"✗ File not found: {md_path}")

    publish(md_path, api_key)


if __name__ == "__main__":
    main()
