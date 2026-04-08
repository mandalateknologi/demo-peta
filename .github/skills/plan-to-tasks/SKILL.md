---
name: plan-to-tasks
description: "Convert planning notes, feature requirements, or design documents into structured TASK_*.md files. Use when: breaking down features into implementation tasks, converting agent planner output to task files, creating phased task breakdowns, generating task metadata with dependencies and critical paths."
argument-hint: "Provide or reference a planning document, feature spec, or design notes to convert"
---

# Plan-to-Tasks Converter

Convert planning input into a structured task breakdown file following the project's `_TEMPLATE_TASKS.md` format.

## When to Use

- You have planning notes, a feature spec, or design document to break into tasks
- Agent Planner produced output that needs to become a trackable task file
- You need a phased implementation plan with dependencies, priorities, and acceptance criteria
- You want to convert informal requirements into file-level, actionable work items

## Procedure

### Step 1: Load the Template

Read `docs/plans/_TEMPLATE_TASKS.md` to internalize the exact structure and conventions. This is the canonical reference for output format.

### Step 2: Load the Project Context

Read `.github/copilot-instructions.md` for architecture context (layer config structure, loader pattern, component conventions, state shape, Tailwind/Radix UI usage). This ensures tasks reference the correct files, modules, and patterns.

### Step 3: Gather Input

Accept the user's planning input from one of:

- An attached file or pasted text
- A referenced document in the workspace (e.g., a file in `docs/plans/`)
- A conversation history containing feature analysis or design decisions

**Tracking number**: Identify the `FEAT-XXX` or `BUG-XXX` number for this work. Either:

- The user provides it directly
- Look it up in `docs/plans/FEATURES.md` by matching the feature/bug title
- If no tracking number exists yet, ask the user to register the item in `docs/plans/FEATURES.md` first (or assign the next available number and register it)

If the input is ambiguous or incomplete, ask the user to clarify:

- What is the feature name / scope?
- What is the tracking number (`FEAT-XXX` or `BUG-XXX`)?
- Are there known files to modify?
- Any hard constraints (timeline, compatibility, dependencies on other work)?

### Step 4: Analyze the Codebase

Before writing tasks, explore the codebase to determine:

- **Existing files** that will be modified (use search to find exact paths and line numbers)
- **Patterns to follow** (find analogous implementations — e.g., if adding a new data layer, look at how existing loaders are structured in `services/dataLoader.ts` and how layers are registered in `config/layers.ts`)
- **Test file locations** and naming conventions
- **Potential conflicts** with in-progress or recent work (check `docs/plans/TASK_*.md` for active tasks)

### Step 5: Structure the Task File

Apply the structure rules from [references/structure-rules.md](./references/structure-rules.md).

**Output file**: `docs/plans/TASK_FEAT_XXX_[NAME].md` or `docs/plans/TASK_BUG_XXX_[NAME].md` where `XXX` is the tracking number and `[NAME]` is uppercase, matching the feature (e.g., `TASK_FEAT_001_CUSTOM_DATA.md`, `TASK_BUG_003_ICON_CHECK.md`).

### Step 6: Write All Required Sections

The output file MUST contain every section below. Do not skip any — mark as N/A if truly not applicable.

#### Header Block

```markdown
# [Feature Name] — Implementation Tasks

> **Tracking**: FEAT-XXX (or BUG-XXX)
> **Project**: Peta Bencana — [Feature Context]
> **Feature**: [One-line description]
> **Timeline**: [X weeks] (Estimated)
> **Team**: [N developers]
> **Status**: Planning Phase
```

#### Progress Summary

All subsections (Completed, In Progress, Pending) with initial state: everything under **Pending**, grouped by phase.

#### Metrics

Measurable targets: test count, coverage, regression baseline, new/modified file counts.

#### Issue / Bottleneck Summary

Table with columns: ID, Severity (Critical/High/Medium/Low/Info), Location, Description.
Extract from the planning input: bugs, vulnerabilities, risks, blockers, design tensions.

#### Architectural Decisions

Table with columns: Decision, Choice, Rationale.

#### Conflict Analysis

Table with columns: Area, Risk, Mitigation.
Cross-reference with existing `TASK_*.md` files and recent codebase changes.

#### Task Assignment Guide

Three sections with task ID lists:

- 🔴 **Critical Path** — sequential dependency chain (use `→` arrows)
- 🟡 **Parallel Work** — independent tasks that can proceed simultaneously
- 🟢 **Post-Integration** — tasks that only start after core is merged

#### Phases & Tasks

Each phase and task following the format in [references/structure-rules.md](./references/structure-rules.md).

#### Testing Checklist

Checkboxes for unit, integration, validation, and manual tests.

#### Definition of Done

Standard completion criteria checklist.

### Step 7: Validate

Before saving, verify:

- [ ] Every task names **exact files** to modify/create (no vague "update the codebase")
- [ ] Every task has **acceptance criteria** as checkboxes (`- ✅ [criterion]`)
- [ ] No task exceeds **8 hours** — split larger work into subtasks
- [ ] **Dependencies** between tasks are explicit and form a valid DAG
- [ ] A **Testing phase** exists that validates all earlier phases
- [ ] A **Documentation phase** is the final phase
- [ ] The last task is **Full Regression Suite Verification**
- [ ] All statuses are **⏳ Pending**
- [ ] "After Implementation" sections say `[To be filled after completion]`
- [ ] Issue/Bottleneck table has at least one entry (or explicit N/A)

### Step 8: Save & Update Registry

1. Write the file to `docs/plans/TASK_FEAT_XXX_[NAME].md` (or `TASK_BUG_XXX_[NAME].md`).
2. Update `docs/plans/FEATURES.md`: set the matching entry's **Status** to `In Progress` and **Plan File** to the task filename.

## Anti-patterns

- **Vague tasks**: "Implement the feature" — always specify files, functions, and code patterns
- **Missing testing phase**: Every task file must validate its own work
- **Monolithic tasks**: >8 hours means the task should be split
- **Orphan tasks**: Tasks with no dependencies or dependents may be misplaced
- **Copy-paste from template**: The template has example content — replace ALL of it with real content
