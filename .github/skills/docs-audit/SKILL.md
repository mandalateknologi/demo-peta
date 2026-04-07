---
name: docs-audit
description: "Audit documentation against the actual Peta Bencana codebase for accuracy. Use when: verifying docs match real types, functions, and layer configs; finding misleading claims in guides; scanning for hallucinated interfaces, functions, or imports; cross-referencing code examples with src/; generating a dated adjustment plan. Handles single docs or full docs/ sweep."
argument-hint: "Path to doc file (e.g. DEVELOPMENT.md) or 'all' for full sweep of docs/"
---

# Documentation Accuracy Audit

Comprehensively scan target documentation and cross-reference every factual claim against the actual codebase, then produce an adjustment plan to fix discrepancies.

## When to Use

- Users report misleading or incorrect documentation
- After a major refactor that may have invalidated doc claims
- Before a release, to ensure all guides are accurate
- When AI-generated docs may contain hallucinated interfaces, functions, or behaviors
- Periodic documentation health checks

## Input

The user provides either:

- A **specific doc path** (e.g., `DEVELOPMENT.md`, `README.md`)
- `"all"` to scan every `.md` file in `docs/`

If no input is provided, ask the user which doc to audit.

## Procedure

### Phase 1 — Claim Extraction

Read the target doc(s) and extract every verifiable claim. Use the [claim categories reference](./references/claim-categories.md) to classify each claim.

**Extract these claim types:**

| Category                      | What to look for                                                                | How to verify                                         |
| ----------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Import paths**              | `import { X } from '../path'`, `import X from 'package'`                        | File exists in `src/`; symbol exported from that path |
| **Interface/type names**      | `DataPoint`, `LayerConfig`, `TimeRange`, `AppState`, `PopupField`               | Interface/type defined in `src/types/index.ts`        |
| **Function signatures**       | `loadAllData()`, `parseGeoJSONCoord(feature)`, `filterByTime(points, range)`    | Function exists with matching params                  |
| **Component names**           | `MapContainer`, `Sidebar`, `Toolbar`, `TimeFilter`                              | Component defined in `src/components/`                |
| **State shape claims**        | `state.visibleLayers`, `state.timeRange`, `state.theme`                         | Field exists on `AppState` in `AppContext.tsx`        |
| **Reducer action types**      | `TOGGLE_LAYER`, `SET_TIME_RANGE`, `SET_THEME`                                   | Action type in reducer switch in `AppContext.tsx`     |
| **Layer config fields**       | Layer IDs like `hotspot`, `gempa-global`; colors; marker types; default visible | Verified against `config/layers.ts`                   |
| **Data file claims**          | JSON file names in `public/data/`, data shape descriptions                      | `file_search` in `public/data/`                       |
| **npm script claims**         | `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`               | Verified against `package.json` scripts               |
| **Package/dependency claims** | Version numbers, package names (e.g., "MapLibre GL JS v5")                      | Verified against `package.json`                       |
| **Behavioral claims**         | "fails silently", "clusters enabled", "dark mode via .dark class"               | Code actually does this                               |
| **File/path references**      | References to other docs, example files, source paths                           | Files exist at stated paths                           |
| **Tailwind/styling claims**   | Class names, theme switching mechanism, `dark:` variants                        | Verified in component files and `index.css`           |
| **Hook usage claims**         | `useAppContext()`, `useState`, `useCallback`, `useEffect`                       | Hook exists and is used as described                  |

### Phase 2 — Codebase Verification

For each extracted claim, verify it against the actual source code. Use this verification strategy:

#### Step 2a — Map source files

Identify which source files are relevant to the doc's topic:

```
# Core modules to always check
src/types/index.ts          # All shared interfaces and types
src/config/layers.ts        # Layer definitions (single source of truth)
src/context/AppContext.tsx  # Global state: AppState, reducer, actions
package.json                # Dependencies, npm scripts

# Topic-specific (based on doc content)
src/services/dataLoader.ts       # Loader functions, loadAllData(), filterByTime()
src/services/coordinateParser.ts # Parser functions, makePoint()
src/components/**/*.tsx          # React components
src/lib/utils.ts                 # cn() utility
public/data/                     # JSON data files
```

#### Step 2b — Verify each claim

For each claim, search the codebase:

1. **Import claims** → Check if the module path exists and the symbol is exported from that file
2. **Interface/type claims** → `grep_search` for `interface Name` or `type Name =` in `src/types/index.ts`
3. **Function claims** → Read the file and check function signatures, parameter names, defaults
4. **Component claims** → `grep_search` for `function ComponentName` or `const ComponentName` in `src/components/`
5. **State shape claims** → Read `AppContext.tsx` and verify field names on `AppState`
6. **Layer config claims** → Read `config/layers.ts` and verify layer IDs, colors, marker types
7. **Data file claims** → `file_search` in `public/data/` to confirm file existence
8. **npm script claims** → Check `scripts` in `package.json`
9. **Behavioral claims** → Read the implementation to confirm behavior (e.g., "fails silently" → check for try/catch and empty array returns)

#### Step 2c — Classify each finding

| Status           | Meaning                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| **VERIFIED**     | Claim matches codebase exactly                                           |
| **INCORRECT**    | Claim contradicts codebase (wrong name, wrong signature, wrong behavior) |
| **MISSING**      | Claimed feature/class/method does not exist in codebase                  |
| **OUTDATED**     | Feature exists but API has changed (renamed, different params)           |
| **UNVERIFIABLE** | Cannot confirm or deny (e.g., performance claims, future roadmap)        |
| **MISLEADING**   | Technically true but presented in a way that would confuse users         |

### Phase 3 — Discrepancy Report

Produce a structured report of all findings. Group by severity:

```markdown
## Audit Summary

- **Doc:** <path>
- **Date:** <YYYY-MM-DD>
- **Total claims checked:** N
- **Verified:** N | **Incorrect:** N | **Missing:** N | **Outdated:** N | **Misleading:** N

## Critical Issues (INCORRECT / MISSING)

### [DISC-001] <Short title>

- **Location:** Line N of <doc path>
- **Doc says:** `<exact quote from doc>`
- **Reality:** `<what the code actually does>`
- **Evidence:** `<file path and line showing the truth>`
- **Impact:** <why this misleads users>

## Moderate Issues (OUTDATED / MISLEADING)

### [DISC-NNN] ...

## Minor / Cosmetic

### [DISC-NNN] ...
```

### Phase 4 — Adjustment Plan

Create a concrete, actionable adjustment plan. Save as `docs/<YYYY-MM-DD>_<DocName>_Doc_Adjustment_Plan.md` using the [plan template](./references/adjustment-plan-template.md).

For each discrepancy:

1. **Determine the correct fix** — Is the doc wrong, or is the code missing a feature the doc assumes?
   - **Doc wrong → fix the doc** (most common with AI-generated docs)
   - **Code incomplete → note as implementation gap** (rare; link to existing tasks/issues)

2. **Write the exact replacement text** — Show the before/after for each doc section

3. **Prioritize fixes:**
   - **P0 — Blocks users:** Incorrect import paths, wrong class names, non-existent methods
   - **P1 — Misleading:** Wrong parameter names/defaults, incorrect return types
   - **P2 — Cosmetic:** Version numbers, minor wording, style consistency

### Phase 5 — Apply Fixes (if requested)

If the user asks to apply fixes (not just audit):

1. Apply P0 fixes first using `replace_string_in_file`
2. Apply P1 fixes
3. Skip P2 unless explicitly requested
4. Re-verify each fix by reading the modified doc
5. Run `npm run build` and `npm run lint` to confirm code examples in the doc are consistent with the real codebase

## Output Artifacts

| Artifact            | Path                                                 | When                  |
| ------------------- | ---------------------------------------------------- | --------------------- |
| Discrepancy report  | `docs/<YYYY-MM-DD>_Doc_Audit_<DocName>.md`           | Always                |
| Adjustment plan     | `docs/<YYYY-MM-DD>_<DocName>_Doc_Adjustment_Plan.md` | Always                |
| Fixed documentation | Original doc path (modified in-place)                | Only if user requests |

## Quality Criteria

- Every code example in the doc has been syntax-checked against actual imports
- Every interface/type reference has been traced to a real definition in `src/types/index.ts`
- Every claimed function has been verified against the actual signature in `src/services/` or `src/context/`
- Every layer config claim (ID, color, marker type) has been verified against `config/layers.ts`
- No claim is marked VERIFIED without evidence from the codebase
- The adjustment plan includes exact before/after text for every fix

## Tips

- **Start with `src/types/index.ts`** — if `DataPoint`, `LayerConfig`, or `TimeRange` are described incorrectly, everything downstream is suspect
- **Cross-reference `config/layers.ts`** — all 8 layer definitions are the ground truth for layer IDs, colors, files, and popup fields
- **Watch for AI hallucination patterns:** plausible-sounding but non-existent hooks (e.g., `useLayerData()`), fabricated utility functions, wrong prop names on Radix UI primitives, result attributes copied from similar libraries
- **Check `package.json` for dependency version claims** — versions change; always verify the actual installed version
- **Use `grep_search` liberally** — faster than reading entire files
- **Batch verification** — group related claims (e.g., all `AppState` fields) and verify them together by reading the interface once

## References

- [Claim categories](./references/claim-categories.md)
- [Adjustment plan template](./references/adjustment-plan-template.md)
