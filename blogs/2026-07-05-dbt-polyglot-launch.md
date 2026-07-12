---
title: A dbt project. Snowflake to Spark. Zero rewrites.
slug: dbt-polyglot-launch
summary: How I built dbt-polyglot — a compile-time SQL-dialect transpiler that lets you migrate a dbt project from Snowflake to Spark without editing a single .sql file.
tags: [dbt, snowflake, spark, iceberg, data-engineering, open-source]
status: published
---

# A dbt project. Snowflake to Spark. Zero rewrites.

**How I built `dbt-polyglot` — and why the dbt *compile phase* is the right seam for cross-warehouse SQL translation.**

---

## The problem

I've been migrating a sizeable dbt project off Snowflake and onto a fully open-source lakehouse — Apache Iceberg on S3, Spark Thrift compute, Project Nessie catalog, Airflow 3. Real production data. Hundreds of dbt models. Zero-downtime cutover.

Day one, I pointed `dbt-spark` at a Spark cluster and ran `dbt build`.

```
[PARSE_SYNTAX_ERROR] Syntax error at or near 'QUALIFY'
```

Spark has no `QUALIFY`. It also has no `IFF`. It rejects `col::int` casts. It won't accept `DATEADD('day', 1, ts)`. Snowflake sorts NULLs one way; Spark the opposite. `NVL`, `TRY_CAST`, `LATERAL FLATTEN`, `VARIANT` — dozens of small dialect fractures.

Multiply that across a large project. Every model breaks. Every fix is different.

The obvious options are all bad:

1. **Rewrite every model.** Weeks of tedious work, high risk of subtle bugs, and it forks the codebase — analytics engineers keep writing Snowflake SQL upstream, the migration team maintains Spark SQL downstream, drift starts on day one.
2. **Maintain two versions per model.** Doubles the surface area. Nobody syncs them. Analytics engineers hate you.
3. **Wait for dbt-core to solve it.** It won't. Dialects are the adapter's problem, not dbt's.

I wanted the `.sql` files to stay unchanged, analytics engineers to keep writing Snowflake-flavored SQL (because that's what upstream still runs), and Spark to just... execute it correctly.

So I built the thing.

---

## `dbt-polyglot` in ten seconds

[`dbt-polyglot`](https://pypi.org/project/dbt-polyglot/) is a **compile-time SQL-dialect transpiler for dbt**. You declare two things in config:

```yaml
# dbt_project.yml
models:
  your_project:
    +transpile_from: snowflake     # dialect your models are WRITTEN in
    # +transpile_to: spark         # warehouse's dialect (default: spark)
```

`pip install dbt-polyglot`, drop those two lines in, point `dbt-spark` at a Spark cluster, `dbt build`.

Your Snowflake-authored models now run on Spark **unchanged**. Model `.sql` files are never touched. What lands in `target/compiled/` and what Spark actually receives is pure Spark SQL — no mixed-dialect strings, no separate output directory.

The engine is **N×N**: any `sqlglot` source dialect (`snowflake`, `bigquery`, `redshift`, `tsql`, `postgres`, `duckdb`, `databricks`, `presto`, `trino`, …) to any target. Spark is the first-class production-trusted path today.

## How it works, in one paragraph

At dbt's **compile phase**, `dbt-polyglot` wraps `dbt.compilation.Compiler._compile_code`. Every opted-in model's compiled SQL body goes through:

```
parse(read=transpile_from)  →  apply fix-ups (Spark target only)  →  generate(transpile_to, pretty=True)
```

[`sqlglot`](https://github.com/tobikodata/sqlglot) does the heavy AST transformation — you get the full breadth: `IFF`→`IF`, `NVL`→`COALESCE`, `::`→`CAST`, `DATEADD`→`DATE_ADD`, `QUALIFY`→windowed subquery, and dozens more. My contribution is a **Spark-specific correctness fix-up layer** that sits between parse and generate — because sqlglot's raw output is *usually* right but occasionally emits SQL that's valid in *its model of Spark* and rejected by *Spark's actual parser*.

## The fix-up that unlocked everything

Classic example: `x NOT IN (subquery)` in Snowflake. `sqlglot`'s canonicalizer rewrites it to `x <> ALL (subquery)` on the way out — the technically-correct quantified-comparison form. Spark's real parser rejects it. Silence, then failure.

My `SPARK_FIXUPS` registry catches this on the AST *before* Spark SQL is generated and rewrites it back to `NOT x IN (subquery)`.

That's the whole pattern: one small AST transform per real-world gap. Every rule is EXPLAIN-verified against actual Spark, easy to review, easy to test, easy to add. Dozens of dialect fractures collapse into a handful of maintained rules.

## The `NULLS LAST` story (sweat the small stuff)

Here's the kind of thing that keeps me up at night with production data.

**Snowflake and Spark have opposite default null ordering.** Snowflake sorts NULLs largest → last; Spark sorts them smallest → first. Translate a Snowflake `ORDER BY x` naively, and a `QUALIFY ROW_NUMBER() … = 1` top-N pick can silently choose a *different row* on Spark.

When translating cross-dialect, `sqlglot` correctly appends an explicit `… NULLS LAST` to **preserve Snowflake semantics**. This isn't cosmetic — it is semantically required, and stripping it would introduce a subtle correctness bug that would only show up when you actually looked at the data.

Details like this are the entire reason for a real fix-up layer versus "just run sqlglot and hope."

## Trust model: verified, or fails loud — never silently wrong

Production data doesn't get to be silently wrong. So `dbt-polyglot` has a strict invariant: **the model is either converted to valid Spark SQL, or it fails loudly with a clear error naming the model.** It never emits a subtly-wrong result from an un-converted construct.

If `sqlglot` can't parse a model as Snowflake, or produces empty/multi-statement output, the patch logs a WARNING (visible in the dbt run) and passes the **original SQL through unchanged**. Spark then either runs it (it was valid to begin with) or rejects it loudly — the failure surfaces, never hides.

To certify a whole repo *before* a heavy run, I use dbt's native validation:

```bash
dbt build --empty                     # build every model with 0 rows, DAG-ordered
dbt build --empty --select marts.*    # any dbt selector works
dbt show --limit 0 -s my_model        # read-only alternative
```

`--empty` executes each model's real SQL against Spark with zero input rows — moving no data — and fails loudly, naming the model, if the transpiled SQL is invalid. Because it builds in dependency order, there's no "upstream not built" ambiguity. That makes `dbt build --empty` a drop-in CI gate: it exits non-zero on the first invalid model.

## No-op guarantee

If `transpile_from` is unset, or equals `transpile_to` (you're already writing Spark SQL), the model is **never touched** — sqlglot is not even called and nothing is reformatted. Install the package, forget about it, and it becomes work only when you point it at a foreign dialect.

## Why compile-time, not at the adapter level

I looked at every layer before writing a line of code:

- **Custom materializations** — would fix one construct, not the language surface.
- **Preprocessing model files** — forks your source of truth, terrible ergonomics.
- **Fork `dbt-spark`** — upstream would rightly reject "translate arbitrary foreign SQL" as out of scope. And I don't want to maintain a fork.

The **dbt compile phase** is exactly the right seam: after Jinja is resolved, after `ref` and `source` are compiled, before materialization wraps the model in `CREATE TABLE AS`. One hook, applied to the compiled body. No mixed-dialect strings anywhere.

## Real usage

```sql
-- models/marts/latest_order.sql — written in Snowflake SQL, runs on Spark
{{ config(materialized='table', transpile_from='snowflake') }}

select *
from {{ ref('orders') }}
qualify row_number() over (partition by customer_id order by ordered_at desc) = 1
```

`dbt build` runs this against Spark. Correctly. Every time.

## Install (why `pip`, not `dbt deps`)

**`dbt deps` cannot install this — you must `pip install` it.** They do different things:

- **`dbt deps`** installs *dbt packages*: macros, models, seeds, tests. Pulls SQL/Jinja into `dbt_packages/`. Never runs Python.
- **`dbt-polyglot`** is a *Python package*. It works by monkey-patching a dbt-core function at runtime, and activates via a `.pth` file that Python executes on interpreter start-up. Only `pip` (or `uv`, `poetry`) can install it into the same env your dbt runs in.

```bash
pip install dbt-polyglot
pip install "dbt-spark[PyHive]"   # or whatever adapter you use
```

That's the whole setup. Two lines of shell, two lines of `dbt_project.yml`, done.

## What it is, what it isn't

**Spark is the first-class target.** The `SPARK_FIXUPS` correctness layer runs only when `transpile_to=spark`, and Spark is where the `dbt build --empty` validation story is tested. Any other target works best-effort — you get raw sqlglot output with no repair layer. Promoting another target to first-class is a bounded extension: add a `<TARGET>_FIXUPS` registry, key fix-up selection on `transpile_to`.

**It doesn't do:**

- **Adapter selection** — you still choose `dbt-spark`, `dbt-databricks`, whatever fits your Spark endpoint.
- **Catalog routing** — separate concern.
- **Migration of Snowflake-only features** that don't map to Spark at all (`LATERAL FLATTEN`, `VARIANT` / `OBJECT` deep semantics, `LISTAGG` variants). Those surface via the fail-loud WARNING and `dbt build --empty`, by design.

## Found a bug? Please open an issue.

`dbt-polyglot` is v0.1.1 on PyPI (Apache-2.0). It's early. There *will* be dialect constructs I haven't seen yet — a query that fails on your Spark cluster but shouldn't, an incorrect transpilation, a `sqlglot` gap the fix-up layer doesn't cover.

**If you hit one, please open a GitHub issue** at [github.com/Saketkr21/dbt-polyglot/issues](https://github.com/Saketkr21/dbt-polyglot/issues). To make it fixable in a follow-up release, include:

1. **A minimal reproducing SQL model** — the smallest `.sql` snippet that triggers the wrong behavior. Strip `ref()` / `source()` and use literal table names if needed.
2. **Your config** — `transpile_from`, `transpile_to`, and versions of `dbt-core`, your adapter (`dbt-spark` / `dbt-databricks` / …), and `sqlglot`.
3. **What you expected** — the correct output SQL, or "should run cleanly on Spark."
4. **What actually happens** — the exact error from Spark, or the wrong SQL from `target/compiled/`.
5. **Steps to reproduce locally** — ideally a tiny public repo I can `git clone` and `dbt build` against.

I read every issue and will genuinely try to ship a fix in the next release. **PRs are even more welcome** — adding a new fix-up is usually 10–30 lines in `fixups.py` plus a test case. The design is deliberately small so contributions stay reviewable.

## What's next

More fix-ups as they surface. Promoting a second first-class target (BigQuery? Databricks-native? tell me on the issue tracker which one hurts you most). Better docs. Broader test matrix across real warehouses.

If you're staring down a Snowflake → Spark migration and don't want to rewrite your models, [try it](https://pypi.org/project/dbt-polyglot/). Star the repo if it saved you time, and open an issue when it doesn't.

### ⭐⭐⭐ Star the repo if you find this useful. ⭐⭐⭐
<!-- ![Upvote Please](../public/upvote-pls.png) -->

<div style="text-align: center; margin: 1.5rem 0;">
  <img 
    src="https://raw.githubusercontent.com/Saketkr21/Saketkr21.github.io/main/public/upvote-pls.png"
    alt="Can you please upvote !!" 
    style="width: 100%; max-width: 320px; height: auto; display: inline-block; border-radius: 8px;" 
  />
</div>

---

*I'm a Senior Data Engineer working on open lakehouses and dbt tooling. I write about migration battle-scars, dbt patterns, and the plumbing that makes data platforms feel boring. Portfolio: [saketkumar.pages.dev](https://saketkumar.pages.dev) · [LinkedIn](https://linkedin.com/in/saketkr21) · [GitHub](https://github.com/Saketkr21).*
