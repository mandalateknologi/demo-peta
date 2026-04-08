---
marp: true
theme: default
paginate: true
style: |
  :root {
    --color-primary: #0ea5e9;
    --color-accent:  #f59e0b;
    --color-bug:     #ef4444;
    --color-feat:    #10b981;
    --color-muted:   #64748b;
    font-family: 'Segoe UI', system-ui, sans-serif;
  }
  section {
    background: #0f172a;
    color: #e2e8f0;
    padding: 56px 72px;
  }
  h1 { color: var(--color-primary); font-size: 2.4rem; margin-bottom: 0.25em; }
  h2 { color: var(--color-primary); font-size: 1.8rem; border-bottom: 2px solid var(--color-primary); padding-bottom: 0.25em; }
  h3 { color: var(--color-accent); font-size: 1.2rem; margin: 0.5em 0 0.25em; }
  p, li { font-size: 1.05rem; line-height: 1.7; color: #cbd5e1; }
  code { background: #1e293b; color: var(--color-accent); padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.95em; }
  pre { background: #1e293b; padding: 1em 1.4em; border-radius: 8px; border-left: 4px solid var(--color-primary); }
  pre code { background: none; color: #94a3b8; font-size: 0.9rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
  th { background: #1e293b; color: var(--color-primary); padding: 0.5em 1em; text-align: left; }
  td { padding: 0.5em 1em; border-bottom: 1px solid #1e293b; }
  .feat  { color: var(--color-feat); font-weight: 700; }
  .bug   { color: var(--color-bug);  font-weight: 700; }
  .muted { color: var(--color-muted); font-size: 0.9rem; }
  .badge-feat { background: #064e3b; color: #34d399; padding: 0.15em 0.6em; border-radius: 99px; font-size: 0.85rem; font-weight: 700; }
  .badge-bug  { background: #450a0a; color: #f87171; padding: 0.15em 0.6em; border-radius: 99px; font-size: 0.85rem; font-weight: 700; }
  .step-box { background: #1e293b; border-left: 4px solid var(--color-primary); padding: 0.6em 1.2em; border-radius: 0 8px 8px 0; margin: 0.4em 0; }
  .arrow { color: var(--color-primary); font-size: 1.4rem; text-align: center; line-height: 1; }
  footer { color: #334155; font-size: 0.8rem; }
---

<!-- Title slide -->

# Peta Bencana

## Development Flow

A structured workflow for proposing, tracking, planning, and implementing features and bug fixes.

---

## Overview

```
ANALYZE  →  REGISTER  →  PLAN  →  TASKS  →  IMPLEMENT
   1            2           3        4            5
```

Each step produces a concrete artifact linked by a unique tracking number:

| #   | Step          | Artifact                         |
| --- | ------------- | -------------------------------- |
| 1   | **Analyze**   | Feature analysis document        |
| 2   | **Register**  | Row in `docs/plans/FEATURES.md`  |
| 3   | **Plan**      | Copilot plan titled `[FEAT-XXX]` |
| 4   | **Tasks**     | `TASK_FEAT_XXX_NAME.md`          |
| 5   | **Implement** | Code + FEATURES.md status update |

---

## Step 1 — Analyze

**Run the `feature-analysis` skill** on the proposed idea.

The skill evaluates:

- **Feature description** — what it does and the problem it solves
- **Project philosophy fit** — data-layer architecture, frontend-only SPA, map-centric UI
- **Integration approach** — new layer, component, state, service, or config
- **Compatibility** — themes, mobile, time filter, clustering, popups
- **Performance impact** — bundle size, render cost, network requests

### Verdict

> **Implement** → proceed to Step 2
> **Defer** → register with status `Proposed` and revisit later
> **Reject** → do not register; add rationale

---

## Step 2 — Register

**Add the item to `docs/plans/FEATURES.md`.**

Assign the next available number:

- <span class="badge-feat">FEAT-001</span> for new features
- <span class="badge-bug">BUG-001</span> for bugs and regressions

### Table row format

```markdown
| FEAT-XXX | Short Title | One-line description | Priority | Proposed | — | YYYY-MM-DD |
```

### Status at registration

`Proposed` → `Approved` → `In Progress` → `Done`

_Update the status column in FEATURES.md at each step._

---

## Step 3 — Plan

**Create a Copilot plan** for the registered item.

### Naming rule

Plan documents and chat sessions must include the tracking number in the title:

```
## Plan: [Title] [FEAT-XXX]
## Plan: [Title] [BUG-XXX]
```

### Plan content (standard Copilot planning)

- Describe the goal and constraints
- List files to create / modify
- Note architectural decisions and risks
- Identify phases and rough time estimates

The plan becomes the input to Step 4.

---

## Step 4 — Tasks

**Run the `plan-to-tasks` skill** to convert the plan into a structured task file.

### Output filename

```
docs/plans/TASK_FEAT_XXX_NAME.md
docs/plans/TASK_BUG_XXX_NAME.md
```

### Task file header (required)

```markdown
# Feature Name — Implementation Tasks

> **Tracking**: FEAT-XXX
> **Project**: Peta Bencana — context
> **Feature**: one-line description
> **Status**: Planning Phase
```

After saving, update FEATURES.md: set **Status** → `In Progress`, **Plan File** → task filename.

---

## Step 5 — Implement

**Work through the task file phase by phase.**

### Phase structure

| Phase | Theme                   |
| ----- | ----------------------- |
| A     | Core Types & Config     |
| B     | Services & Data         |
| C     | Components & UI         |
| D     | State & Context         |
| E     | Map Integration         |
| F     | Testing                 |
| G     | Documentation & Release |

### Done criteria

- All tasks marked complete
- `npm run build` and `npm run lint` pass
- Full regression suite verified
- FEATURES.md status updated to **`Done`**

---

## Tracking Number — The Thread

The tracking number (`FEAT-XXX` / `BUG-XXX`) appears in **every artifact**:

```
FEATURES.md row          → FEAT-012
Plan title               → ## Plan: Consolidate Layer Config [FEAT-012]
Task filename            → TASK_FEAT_012_LAYER_CONFIG.md
Task header              → > Tracking: FEAT-012
Commit / PR reference    → fix: consolidate icon maps [FEAT-012]
```

This makes it trivial to trace any piece of work back to its origin — and forward to its implementation.

---

## Bug Fixes — Same Flow

Bugs follow an identical flow with `BUG-XXX` numbers.

| Normal Feature          | Bug Fix                         |
| ----------------------- | ------------------------------- |
| `FEAT-001`              | `BUG-001`                       |
| Feature analysis skill  | Bug report / reproduction steps |
| `TASK_FEAT_001_NAME.md` | `TASK_BUG_001_NAME.md`          |
| Status: Proposed → Done | Status: Proposed → Done         |

Bugs can be **skipped past Step 1** (analysis) when the issue is already confirmed — register directly in Step 2 with status `Approved`.

---

## Quick Reference

```
1  feature-analysis skill  →  Implement / Defer / Reject verdict
2  docs/plans/FEATURES.md  →  FEAT-XXX or BUG-XXX row (Status: Proposed)
3  Copilot plan titled      →  ## Plan: Title [FEAT-XXX]
4  plan-to-tasks skill      →  TASK_FEAT_XXX_NAME.md (Status: In Progress)
5  Implementation           →  code merged, FEATURES.md → Done
```

### Key files

| File                                       | Purpose                           |
| ------------------------------------------ | --------------------------------- |
| `docs/plans/FEATURES.md`                   | Registry — single source of truth |
| `docs/plans/TASK_FEAT_XXX_NAME.md`         | Phased task breakdown             |
| `docs/plans/_TEMPLATE_TASKS.md`            | Template for task files           |
| `.github/skills/feature-analysis/SKILL.md` | Analysis procedure                |
| `.github/skills/plan-to-tasks/SKILL.md`    | Task generation procedure         |
