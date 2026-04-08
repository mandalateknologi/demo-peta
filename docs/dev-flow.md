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
ANALYZE + REGISTER + PLAN  →  TASKS  →  IMPLEMENT
          1                      2            3
```

The `feature-analysis` skill handles Steps 1 automatically — it analyzes, registers, and generates the plan file in one pass.

| #   | Step          | Artifact                                                        |
| --- | ------------- | --------------------------------------------------------------- |
| 1   | **Analyze**   | Plan file (`docs/plans/PLAN_FEAT_XXX_P01.md`) + FEATURES.md row |
| 2   | **Tasks**     | Task file (`docs/tasks/TASK_FEAT_XXX_NAME.md`)                  |
| 3   | **Implement** | Code + FEATURES.md status → `Done`                              |

---

## Step 1 — Analyze (+ Register + Plan)

**Run the `feature-analysis` skill** on the proposed idea.

### User information prompt

Before analysis begins, the skill prompts for:

- **Name** — who is requesting or analyzing this feature
- **Reason** — why this feature is needed (business / technical justification)

### Analysis

The skill evaluates the feature across 8 sections:

- **Feature description** — what it does and the problem it solves
- **Use cases** — practical scenarios and user roles
- **Project philosophy fit** — data-layer architecture, frontend-only SPA, map-centric UI
- **Integration approach** — new layer, component, state, service, or config
- **API / integration proposal** — implementation details following project conventions
- **Compatibility** — themes, mobile, time filter, clustering, popups
- **Performance impact** — bundle size, render cost, network requests
- **Final recommendation** — verdict with justification

### Verdict → Automatic Actions

> **Implement** → auto-registers in `docs/features/FEATURES.md` (Status: `Approved`) and generates `docs/plans/PLAN_FEAT_XXX_P01.md`
> **Defer** → registers with Status `Proposed`, no plan file generated
> **Reject** → not registered; rationale provided

### Plan revisions

If the plan needs revisiting, create `PLAN_FEAT_XXX_P02.md`, `P03.md`, etc. Only the **latest revision** is active.

---

## Step 2 — Tasks

**Run the `plan-to-tasks` skill** to convert the plan into a structured task file.

### Prerequisite

The user **MUST** attach the plan file (e.g., `docs/plans/PLAN_FEAT_013_P01.md`) before running this skill. The skill will refuse to proceed without it.

### Output

```
docs/tasks/TASK_FEAT_XXX_NAME.md
docs/tasks/TASK_BUG_XXX_NAME.md
```

### Task file header (required)

```markdown
# Feature Name — Implementation Tasks

> **Tracking**: FEAT-XXX
> **Project**: Peta Bencana — context
> **Feature**: one-line description
> **Plan File**: PLAN_FEAT_XXX_P01.md
> **Status**: Planning Phase
```

### Assigned To

Every task includes an **Assigned To** field. Initially set to `[To be assigned]`. Engineers **must** claim tasks by writing their name before starting work.

```markdown
**Assigned To**: [To be assigned] ← initial state
**Assigned To**: Jane Doe ← after claiming
```

After saving, update FEATURES.md: set **Status** → `In Progress`.

---

## Step 3 — Implement

**Work through the task file phase by phase.**

### Claiming tasks

1. Open the task file in `docs/tasks/`
2. Find a task in your assignment area
3. Replace `[To be assigned]` with your name in the **Assigned To** field
4. Set the task **Status** to `🔄 In Progress`
5. Complete the work, then set status to `✅ Completed`

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
Plan filename            → PLAN_FEAT_012_P01.md
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
| `PLAN_FEAT_001_P01.md`  | `PLAN_BUG_001_P01.md`           |
| `TASK_FEAT_001_NAME.md` | `TASK_BUG_001_NAME.md`          |
| Status: Proposed → Done | Status: Proposed → Done         |

Bugs can be **skipped past Step 1** (analysis) when the issue is already confirmed — register directly in FEATURES.md with status `Approved`.

---

## Agent Mode / Plan Mode Parity

Both the `feature-analysis` and `plan-to-tasks` skills produce **identical structured output** regardless of whether invoked from:

- **Agent Mode** (Copilot chat with tool access)
- **Plan Mode** (Copilot plan view)

The plan file and task file are the canonical artifacts, not the conversation.

---

## Folder Structure

```
docs/
  features/FEATURES.md                   # Registry — single source of truth
  plans/PLAN_FEAT_XXX_P<NN>.md           # Plan files (feature-analysis output)
  tasks/TASK_FEAT_XXX_NAME.md            # Task breakdowns (plan-to-tasks output)
```

---

## Quick Reference

```
1  feature-analysis skill  →  Prompts for Name + Reason
                           →  Implement / Defer / Reject verdict
                           →  Auto-registers in FEATURES.md + generates plan file
2  plan-to-tasks skill     →  MUST attach plan file
                           →  TASK_FEAT_XXX_NAME.md in docs/tasks/
3  Implementation          →  Claim tasks (Assigned To), code, FEATURES.md → Done
```

### Key files

| File                                                           | Purpose                           |
| -------------------------------------------------------------- | --------------------------------- |
| `docs/features/FEATURES.md`                                    | Registry — single source of truth |
| `docs/plans/PLAN_FEAT_XXX_P<NN>.md`                            | Plan file (analysis output)       |
| `docs/tasks/TASK_FEAT_XXX_NAME.md`                             | Phased task breakdown             |
| `.github/skills/feature-analysis/SKILL.md`                     | Analysis + plan generation        |
| `.github/skills/feature-analysis/references/_TEMPLATE_PLAN.md` | Plan file template                |
| `.github/skills/plan-to-tasks/SKILL.md`                        | Task generation procedure         |
| `.github/skills/plan-to-tasks/references/_TEMPLATE_TASKS.md`   | Task file template                |
