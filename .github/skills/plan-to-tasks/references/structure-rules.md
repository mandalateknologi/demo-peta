# Structure Rules Reference

Detailed rules for structuring task breakdown files.

## Phasing

Group related work into **Phases** labeled with uppercase letters:

| Letter | Typical Theme           | Examples                                                        |
| ------ | ----------------------- | --------------------------------------------------------------- |
| A      | Core Types & Config     | `types/index.ts` interfaces, `config/layers.ts` entries         |
| B      | Services & Data         | Loader functions, coordinate parsers, data file validation      |
| C      | Components & UI         | New React components, dialogs, sidebar panels, toolbar items    |
| D      | State & Context         | `AppState` extension, reducer actions, `AppContext.tsx` changes |
| E      | Map Integration         | MapLibre layer registration, popup logic, marker rendering      |
| F      | Testing                 | Unit, integration, regression                                   |
| G      | Documentation & Release | Docs, examples, CHANGELOG                                       |

Phases are flexible — use whatever letters and themes fit the feature. The last two phases should always be **Testing** and **Documentation**.

## Task IDs

Format: `{Phase}{Number}` — e.g., A1, A2, B1, C3.

## Task Format

Each task follows this structure:

```markdown
### Task {ID}: {Short Title} {Indicator}

**Priority**: Critical | High | Medium | Low
**Estimated time**: N hours (max 8 — split if larger)
**Dependencies**: Task X1, Task Y2 | None
**Status**: ⏳ Pending
**Assigned To**: [Name] | [To be assigned]

**Description**: What this task accomplishes in 2-3 sentences.

**Files to modify**:

- `src/services/dataLoader.ts` — Brief description of changes

**Changes required**:

(Code examples, pseudocode, or detailed prose describing the implementation)

**Constraints**:

- Any technical limitations or requirements

**Acceptance Criteria**:

- ✅ [Specific, testable criterion]
- ✅ [Another criterion]
- ✅ Test requirements: see Task F{N}

**After Implementation**: [To be filled after completion]
```

## Priority Definitions

| Priority | Meaning                                              |
| -------- | ---------------------------------------------------- |
| Critical | Blocks all downstream work; architectural foundation |
| High     | Blocks significant work; core functionality          |
| Medium   | Important but has workarounds; enhances quality      |
| Low      | Nice-to-have; polish, optimization, documentation    |

## Indicators

| Indicator | Meaning                                                |
| --------- | ------------------------------------------------------ |
| 🔴        | Critical Path — must complete in sequence              |
| 🟡        | Parallel — can work simultaneously with other 🟡 tasks |
| 🟢        | Post-Integration — starts after core components land   |

## Time Estimation Guidelines

| Complexity | Hours | Examples                                           |
| ---------- | ----- | -------------------------------------------------- |
| Trivial    | 1-2   | Add enum entry, update whitelist, add import       |
| Simple     | 2-4   | New type/interface, simple loader, config entry    |
| Medium     | 4-6   | Full loader with parsing, new component, map layer |
| Complex    | 6-8   | Multi-file integration, complex test suite         |
| Too Large  | >8    | **Must split** into subtasks                       |

## Dependency Notation

In the Task Assignment Guide, use arrow notation for critical path:

```
A1 (types) → A2 (config entry) → B1 (loader function) → E1 (map layer) → F1 (tests)
```

For parallel work, use bullet lists:

```
- **B1** and **C1** — loader and component can develop in parallel
- **D1** can start once **A1** is done — parallel with B1/C1
```

## Assigned To

Every task includes an **Assigned To** field. When a task file is first generated, all tasks are set to `[To be assigned]`. Engineers **must** claim tasks by replacing this with their name before beginning work.

```markdown
**Assigned To**: [To be assigned] ← initial state
**Assigned To**: Jane Doe ← after claiming
```

## Issue/Bottleneck Table Format

```markdown
| ID  | Severity | Location                     | Description                              |
| --- | -------- | ---------------------------- | ---------------------------------------- |
| B-1 | High     | `src/config/layers.ts`       | New layer not registered in config       |
| B-2 | Medium   | `src/services/dataLoader.ts` | Loader not added to `loadAllData()` list |
```

Severity values: Critical, High, Medium, Low, Info.

## Conflict Analysis Table Format

```markdown
| Area                         | Risk   | Mitigation                              |
| ---------------------------- | ------ | --------------------------------------- |
| `config/layers.ts` structure | Low    | Simple object addition, no merge risk   |
| Active TASK_X work           | Medium | Coordinate merge order with that branch |
```
