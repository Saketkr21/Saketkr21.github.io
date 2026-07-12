---
title: 58 broken pipelines you can fix on your laptop
slug: lakehouse-lab
summary: A production-challenges Data Engineering curriculum. Break Spark, Iceberg, Kafka, Debezium, dbt, and Airflow at small scale, watch them fail in the UI, and fix them — 58 modules, laptop-safe.
tags: [spark, iceberg, kafka, debezium, dbt, airflow, data-engineering, open-source]
status: published
---

# 58 broken pipelines you can fix on your laptop

**Every DE tutorial teaches you what *works*. [`lakehouse-lab`](https://github.com/Saketkr21/lakehouse-lab) is built to teach you what *breaks* — and how to fix it.**

---

## The gap

There's a specific hole in most data-engineering learning material.

You can find great tutorials for spinning up Spark, running your first dbt model, or streaming from Kafka. What's missing is the entire middle chapter of the actual job: **things breaking**. Skewed joins that hang for hours. Executor OOM on a shuffle. A Kafka consumer that quietly falls behind. An Iceberg table that accumulates orphan files until reads slow to a crawl. A Debezium slot that never releases WAL. A dbt incremental model that silently miscalculates on late-arriving data.

You don't learn to spot these until they happen in production. And when they do, you're scared, on-call, and Googling.

I built `lakehouse-lab` as **58 pipelines designed to break in specific, diagnostic ways** — so you can meet these failure modes at small scale, on your laptop, before they meet you in production.

---

## The shape: Break → Detect → Fix → Prove

Every module follows one loop:

1. **Break.** Run a pipeline in a way that reproduces a real-world pathology.
2. **Detect.** Find the symptom in the Spark UI, Kafka UI, Iceberg metadata, or dbt logs — the same tools you'd have in prod.
3. **Fix.** Apply a targeted change (a config knob, a code rewrite, a partitioning strategy).
4. **Prove.** Rerun. Compare metrics before/after. Watch the pathology disappear in the UI.

Each module is 20-45 minutes. Every one has a `metrics_diff` table showing the actual improvement, not a hand-wave.

---

## Laptop-safe by design

The whole thing runs on a laptop. No cloud bill.

Two Docker profiles:

- **`make up`** — a tuned ~3 GB Spark cluster. Comfortable for most modules.
- **`make up-constrained`** — a deliberately smaller ~2 GB cluster. **This is the interesting one.** OOM and spill become *real events*, not hypotheticals. When the module asks you to break the executor, you actually break it — not simulate it.

A shared `common/` toolkit provides the primitives:

- `datagen` — synthesizes skewed and wide data on the fly (no giant files stored on disk).
- `metrics_diff` — dumps before/after query metrics into a comparable table.
- `iceberg_meta` — table health snapshots (data-file count, snapshots, manifests, orphans).
- `profiles` — flip tuned vs constrained per-notebook via `common.profiles.apply_profile()`.
- `spark_session` — Spark Connect helper with a `reconnect()` path when things wedge.

---

## The seven phases

**Phase 1 — Spark performance pathologies** (`SPK-1..SPK-10`). Skew is the flagship. Then executor OOM, driver OOM, spill, join strategies, AQE, partition pruning, caching failures, shuffle mechanics, internals. Each pathology has a specific Spark UI signature — you learn to recognize them *by shape*.

**Phase 2 — Iceberg lakehouse correctness** (`LAK-1..LAK-10`). Formats, the small-files problem, snapshot management, orphan cleanup, manifest hygiene, schema evolution, partitioning strategy, `MERGE INTO`, time travel, Iceberg internals. The stuff that separates "using Iceberg" from "operating an Iceberg lakehouse."

**Phase 3 — Kafka + Structured Streaming** (`KAF-1..6`, `STR-1..3`). Hot partitions, consumer lag, rebalance storms, retention vs compaction, delivery semantics, poison pills and dead-letter queues. Then streaming-specific: watermarking, checkpoints, backpressure. All laptop-scale but with real semantics.

**Phase 4 — Debezium CDC end-to-end** (`CDC-1..CDC-9`). Postgres → Debezium → Kafka → Spark → Iceberg. Logical replication basics, connector bring-up, snapshot modes, event envelope shape, the classic WAL/slot growth failure, deletes with replica identity, streaming `MERGE` into Iceberg, mid-stream schema evolution, and a failure-mode tour.

**Phase 5 — dbt quality with Great Expectations** (`DBT-1..DBT-10`). Materializations, incremental strategies including late-arriving lookback, SCD2 snapshots, schema-change tolerance, testing layering, quarantine tables, `dbt-expectations` + `Great Expectations`, sources / freshness / contracts / exposures, macros, slim-CI setup.

**Phase 6 — Airflow** (`AF-1..AF-10`). Idempotency, the execution model, catchup and backfill, retries/SLA, sensor modes, trigger rules and branching, dynamic mapping, XCom limits, assets / data-aware scheduling in Airflow 3, and a full dbt + Spark end-to-end DAG.

**Phase 7 — Capstone.** End-to-end pipeline (`CAP-1`), an **incident simulator** with eight on-call cards (`CAP-2`), an observability track adding Prometheus + Grafana + exporters (`CAP-3`), and a suggested learning path across all 58 modules (`CAP-4`).

---

## Why the incident simulator matters

The incident simulator (`CAP-2`) is where I'd start if I could only do one module.

Eight cards. Each is an on-call scenario: a real symptom — a stale mart, a broken CDC feed, a partitioned table that's suddenly slow, a Kafka consumer that's fallen 4M messages behind. You get a runbook shell. You have to diagnose using the tools available in the sandbox — no cheating with logs from the future. Then you fix it.

This is the closest thing I've found to actually practicing on-call without waiting for pain to happen to you.

---

## How to use it

```bash
git clone https://github.com/Saketkr21/lakehouse-lab
cd lakehouse-lab
uv sync
make up               # or `make up-constrained` for OOM/spill modules
make jupyter
```

Open <http://localhost:8888>. Follow `docs/LEARNING_PATH.md` for the curated ordering — modules build on each other. Or jump around; each one is self-contained.

Guides that ship with the repo:

- `docs/spark-ui-guide.md` — symptom → which UI tab.
- `docs/troubleshooting.md` — symptom → cause → fix.
- `docs/CURRICULUM_BRIEF.md` — pedagogical rationale for each track.

---

## Who this is for

- **Junior / mid data engineers** who want to see production failure modes without production risk.
- **Interviewers and candidates** — the incident cards are excellent system-design and on-call practice material.
- **Team leads running onboarding** — pick five modules, run them as an offsite, and your team has actually *seen* a shuffle spill.

---

## What I'd love back

If you run through a module and something's confusing, missing, or wrong: **open an issue** at [github.com/Saketkr21/lakehouse-lab/issues](https://github.com/Saketkr21/lakehouse-lab/issues). Include which module, which symptom you saw, and what was unclear.

If you have a favorite failure mode I haven't covered — Delta Lake conflict resolution, Kafka Streams state stores, Airflow deferrable operators — a PR with a new module in Break → Detect → Fix → Prove format is very welcome.

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

*I write about lakehouses, dbt patterns, and the plumbing that makes data platforms feel boring. Portfolio: [saketkumar.pages.dev](https://saketkumar.pages.dev) · [LinkedIn](https://linkedin.com/in/saketkr21) · [GitHub](https://github.com/Saketkr21).*
