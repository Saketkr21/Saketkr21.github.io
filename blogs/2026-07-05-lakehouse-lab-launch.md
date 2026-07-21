---
title: break your pipeline (before prod does it for you)
slug: lakehouse-lab
summary: 58 broken pipelines, one laptop, zero cloud bill. the DE curriculum for people who've never been on-call yet.
tags: [spark, iceberg, kafka, debezium, dbt, airflow, data-engineering, open-source]
status: published
---

# break your pipeline (before prod does it for you)

### 58 broken pipelines, one laptop, zero cloud bill.

---

## TL;DR

you know what your Spark job is *supposed* to look like. you don't know what it looks like when it breaks. that's the tutorial gap.

i built **[`lakehouse-lab`](https://github.com/Saketkr21/lakehouse-lab)** — **58 pipelines designed to break in specific, named ways.** break them on your laptop. watch them fail in the same UIs you'd have in prod. fix them. prove it in numbers.

**stack:** Spark 4.0 · Iceberg · Delta · Hudi · Kafka · Debezium · dbt · Airflow · Nessie · Polaris · Prometheus · Grafana — all local, all Dockerized.

runs on 8 GB RAM. no AWS account. Apache 2.0. star it if it helps.

---

## the 2 AM thing

it's 2 AM. your dbt job has been failing for forty minutes.

`EXPLAIN` looks fine. Spark UI shows one executor at 100%, eleven others sitting idle. Twitter's no help. Stack Overflow's got a 2019 answer that doesn't quite fit.

two hours later you piece it together: **skewed join.** one key holds 92% of the rows.

but nobody told you this was a *specific named thing*. you just knew "the job was slow." you didn't know the Spark UI's Event Timeline shows *that exact shape*. you didn't know AQE has a skew-join splitter that would've handled it in one config change.

you learned it the way most of us do: at 4 AM. on-call. team lead asleep.

**that's the gap.** every DE tutorial teaches you the happy path. what's missing is the *middle chapter* of the actual job — the failure modes, the UIs you can't read yet, the runbooks that don't exist.

---

## the fix

**58 pipelines. designed to break. that's the point.**

each one meets you where a real prod failure mode would — at small scale, on your laptop, *before* it meets you at 2 AM.

every module is 20–45 minutes. same loop every time:

| step | what happens |
|---|---|
| **break** | run a pipeline in a way that reproduces a real prod pathology |
| **detect** | find the symptom in the same UI you'd have in prod — Spark UI, Kafka UI, dbt logs, Iceberg metadata |
| **fix** | apply a targeted change — config knob, code rewrite, partition strategy |
| **prove** | rerun. compare before/after in a `metrics_diff` table. numbers, not vibes. |

that last step is the whole point. "this is faster now" isn't good enough — the module shows you *shuffle bytes before vs after, task time p99 before vs after, data file count before vs after*. you leave with receipts.

---

## what one module actually feels like — SPK-1 (Data Skew)

ninety seconds of setup. `datagen` synthesizes a skewed dataset — 90% of rows share one key. you run the join.

**the Spark UI shows exactly what you saw at 2 AM.** one long task. eleven short ones. Event Timeline: a bar that stretches to the right like it's mocking you.

then three named fixes, in sequence:

- **broadcast the small side** → shuffle vanishes.
- **AQE skew-join on** → runtime skew-detection splits the hot partition. the logs *literally* say it split.
- **salt the hot key manually** → compare with AQE. understand why the automatic path is usually better.

30 minutes. three named remedies for one production symptom. measurable before/after in every step. you'll recognize the pattern *by shape* the next time you see it in real prod.

**every one of the 58 modules is that shape.**

---

## what's inside — 7 phases, 58 modules

| phase | track | modules | what you learn to spot |
|---|---|---|---|
| **1** | spark performance | `SPK-1..10` | skew · OOM (executor + driver) · spill · joins · AQE · pruning · caching · shuffle |
| **2** | iceberg lakehouse | `LAK-1..10` | small files · snapshot growth · orphans · manifest bloat · schema evo · MERGE · time travel |
| **2.5** | modern catalogs | `CAT-1..5` | nessie REST + git-like branching · polaris RBAC · cross-catalog federation |
| **2.6** | hudi | `LAK-11..12` | CoW vs MoR write amp · `.hoodie/` timeline |
| **3** | kafka + streaming | `KAF-1..6` + `STR-1..3` | hot partitions · consumer lag · rebalance storms · retention · poison pills · watermarks · checkpoints |
| **4** | debezium CDC | `CDC-1..9` | postgres → kafka → spark → iceberg. WAL slot growth, schema evo, MERGE upserts |
| **5** | dbt quality | `DBT-1..10` | incrementals · late-arriving · SCD2 · quarantine · contracts · Great Expectations |
| **6** | airflow | `AF-1..10` | Airflow 3 execution model · idempotency · dynamic mapping · Assets |
| **7** | capstone | `CAP-1..4` | e2e pipeline · **8-card on-call sim** · Prometheus + Grafana observability · full learning path |

every module: verified end-to-end. every code cell: Connect-safe. every teardown: `make clean` and it's gone.

---

## laptop-safe (like, actually)

**$0 cloud bill. no AWS. no provisioning. no "we'll bill you if you leave it running."**

**prereqs:**
- 8 GB RAM (base stack)
- 16 GB comfortable (with CDC + monitoring add-ons)
- Docker Desktop + `uv`. that's it.

**two Docker profiles — dial your pain level:**
- `make up` → tuned ~3 GB Spark cluster. fine for most modules.
- `make up-constrained` → deliberately smaller ~2 GB. **OOM and spill are real events, not simulations.** when the module tells you to break the executor, you actually break it.

five containers in the base. opt-in stacks stack on top:
- `make catalogs-up` → Nessie + Polaris + Nimtable UI
- `make cdc-up` → Postgres + Debezium
- `make superset-up` → SQL explorer over Spark Thrift
- `make monitoring-up` → **Prometheus + Grafana + live dashboards.** watch Kafka consumer lag climb, watch a Postgres replication slot grow — all live, all in your browser.

`make clean` wipes it. no state left behind.

---

## the flagship — CAP-2 (Incident Simulator)

if you only do one thing here, do this.

**8 cards. each one is a real on-call scenario hitting you the way it hits you:**

- stale mart at 8 AM
- CDC feed that silently stopped
- partitioned table 20× slower to read out of nowhere
- kafka consumer 4M messages behind
- and 4 more

you get a runbook shell. diagnose with only the tools available in the sandbox — same UIs you'd have in prod. fix it. compare your postmortem to the module's own — did you find the *actual* root cause or just a plausible one?

**closest thing to on-call practice without the on-call.**

prepping for a DE interview? do CAP-2 first. every card is a real production war story — the cards double as elite system-design and diagnostic-reasoning practice.

---

## who this is for

- **junior / mid DEs** → see prod failure modes without prod risk. fix them 58 times before your career forces you to.
- **interview prep** → incident cards are on-call practice + system-design practice at once.
- **team leads doing onboarding** → pick 5 modules, run them as a half-day. team walks out having *actually seen* a shuffle spill, a broken CDC feed, an orphan-file mistake.
- **career switchers into DE** → shortest path from "i know python" to "i can debug a Spark job."
- **anyone reading a Spark/Iceberg/Kafka book** → empirical modules to run alongside the theory.

---

## try it (5 min to first module)

```bash
git clone https://github.com/Saketkr21/lakehouse-lab
cd lakehouse-lab
uv sync
make up
make jupyter
```

open http://localhost:8888. pick a module. run it. see something break.

start ordered? → [`docs/LEARNING_PATH.md`](https://github.com/Saketkr21/lakehouse-lab/blob/main/docs/LEARNING_PATH.md) has the curated route with time estimates and "what you can diagnose after this."

ships with the repo:
- [`spark-ui-guide.md`](https://github.com/Saketkr21/lakehouse-lab/blob/main/docs/spark-ui-guide.md) → symptom → which UI tab
- [`troubleshooting.md`](https://github.com/Saketkr21/lakehouse-lab/blob/main/docs/troubleshooting.md) → symptom → cause → fix
- [`CATALOG_FORMAT_MATRIX.md`](https://github.com/Saketkr21/lakehouse-lab/blob/main/docs/CATALOG_FORMAT_MATRIX.md) → honest what-works-where grid for catalogs × formats

**Apache 2.0.** fork it. teach with it. remix it for your team.

---

## the ask

**pick one. tonight.**

- `SPK-1` if you've ever stared at a Spark job that wouldn't finish
- `CAP-2` if you're prepping for interviews or on-call anxiety hits different
- `CDC-5` if you've ever asked "why did the postgres slot eat all my disk"
- `LAK-2` if your Iceberg reads get slower every week

then:

1. **[star the repo](https://github.com/Saketkr21/lakehouse-lab)** — if a module saves you an incident someday
2. **[open an issue](https://github.com/Saketkr21/lakehouse-lab/issues)** — if anything's confusing, missing, or wrong. name the module + what you saw.
3. **send it to a teammate** — the one about to hit their first shuffle skew

got a failure mode i haven't covered? — Delta conflict resolution, Kafka Streams state stores, Airflow deferrable ops, GE reference suites? PRs welcome. same Break → Detect → Fix → Prove shape.


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

*writing about lakehouses, dbt patterns, and the plumbing that makes data platforms feel boring. the shortest path from "i've read the docs" to "i've broken it and fixed it" — that's what this repo is.*

*[portfolio](https://saketkumar.pages.dev) · [linkedin](https://linkedin.com/in/saketkr21) · [github](https://github.com/Saketkr21)*
