---
name: code-duplication-audit
description: "Scan codebase for duplicate or near-duplicate implementations and generate a consolidation report. Use when: finding redundant modules; identifying merge opportunities; auditing for copy-paste patterns; reviewing React component families for shared-base extraction; generating a dated optimization report with merge roadmap."
argument-hint: "Directory path to scan (e.g. 'src/components' or 'src/services') or 'all' for full codebase sweep"
---

# Code Duplication Audit

Systematically scan target source directories for duplicate or near-duplicate modules, components, and functions, then produce a comprehensive report with merge recommendations and estimated impact.

## When to Use

- After rapid feature expansion that may have spawned copy-paste loaders or components
- Before a major refactor to reduce maintenance surface
- When reviewing React component families that look suspiciously similar
- When multiple data loader functions follow the same fetch→parse pattern with little differentiation
- Periodic codebase hygiene audits
- When onboarding identifies modules that "do the same thing"

## Input

The user provides either:

- A **specific directory path** (e.g., `src/components`, `src/services`)
- `"all"` to scan every `.ts` and `.tsx` file under `src/`

If no input is provided, ask the user which directory to audit. Multiple comma-separated paths are accepted (e.g., `src/components, src/services`).

## Scope Rules

**Included:**

- All `.ts` and `.tsx` files under the target directory (recursive)
- Cross-directory comparisons when scanning `"all"` (e.g., utility in `lib/` duplicated in `services/`)

**Excluded:**

- `node_modules/` and `dist/` directories
- `.d.ts` declaration files (type-only, no implementation)
- `public/data/*.json` data files (source data, not code)
- Generated files, Vite config artifacts
- Files under 10 lines (too small to meaningfully deduplicate)

## Procedure

### Phase 1 — Scope & Inventory

Enumerate all TypeScript modules in the target path and build a structural inventory.

1. Use `file_search` with `**/*.{ts,tsx}` to find all TypeScript/React files in scope
2. For each file, use `read_file` (batch large reads) to extract:
   - **Exported functions** — name, parameter list, return type, line count
   - **React components** — name, props interface, hooks used, effects
   - **Interfaces/types** — name, fields
   - **Shared imports** — which packages and modules are imported
3. Build a **module map** table:

| File | Components | Functions | Interfaces | Total Lines | Key Imports |
| ---- | ---------- | --------- | ---------- | ----------- | ----------- |

4. Count totals: files scanned, components found, functions found, interfaces found

### Phase 2 — Structural Fingerprinting

Group modules by structural similarity to identify candidates for deeper analysis.

#### Step 2a — Component/Function Fingerprints

For each React component or exported function, create a fingerprint:

- Sorted list of hooks used (`useState`, `useEffect`, `useCallback`, `useRef`, etc.)
- Props interface field names
- Key imported symbols from external packages

#### Step 2b — Group by Similarity

Compare fingerprints pairwise within the same directory family:

1. **Same feature folder** — All components under `components/<Feature>/`
2. **Same service pattern** — All loader functions in `services/dataLoader.ts`, all parsers in `services/coordinateParser.ts`
3. **Hook overlap** — Calculate: `|hooks_A ∩ hooks_B| / |hooks_A ∪ hooks_B|` (Jaccard index)
4. **Flag pairs with overlap ≥ 0.6** (60%) for Phase 3 deep analysis

#### Step 2c — Loader/Service Pattern Detection

Search for loader functions that follow the thin-wrapper pattern:

- Fetch JSON from `/data/<filename>.json` → parse → map to `DataPoint[]`
- Most loaders differ only in file name, field keys, and parser function
- Flag groups of 3+ loaders following the same pattern

### Phase 3 — Function-Level Similarity Analysis

For each flagged pair from Phase 2, compare function bodies in detail.

#### Step 3a — Identify Matching Functions

Within each flagged class pair, align methods by name. For each name-matched pair:

1. **Read both function bodies** in full
2. **Classify the relationship:**

| Relationship             | Criteria                                                                    | Action                |
| ------------------------ | --------------------------------------------------------------------------- | --------------------- |
| **Identical**            | Bodies are character-for-character identical (ignoring whitespace/comments) | Report as Critical    |
| **Near-identical**       | Bodies differ only in variable names, string literals, or type references   | Report as Critical    |
| **Structurally similar** | Same control flow (if/for/try blocks) with different operations             | Report as Moderate    |
| **Signature-only match** | Same name and params but genuinely different logic                          | Report as Low or skip |

#### Step 3b — Cross-Module Function Search

Search for module-level functions that appear across multiple files:

1. `grep_search` for `export function`, `export const`, `export default function` across the scanned scope
2. For any function name defined in 2+ files, compare bodies
3. Flag utility functions that are copy-pasted across modules (e.g., coordinate helpers, date formatters, HTML string builders, `cn()` compositions)

#### Step 3c — Boilerplate Block Detection

Search for repeated code blocks that aren't full functions:

1. Common loader patterns: fetch call, null check, array mapping, `makePoint()` call
2. Common `useEffect` patterns: dependency arrays, cleanup functions
3. Common Tailwind class string blocks (identical `className` values across components)
4. Common Radix UI primitive wiring (same Radix component, same props)
5. Flag blocks of ≥ 10 identical or near-identical lines appearing in 2+ files

### Phase 4 — Cross-Cutting Pattern Detection

Identify systemic duplication patterns that span multiple files. Use the [duplication categories reference](./references/duplication-categories.md) to guide the scan.

#### 4a — Loader Function Boilerplate

All 8 data loaders in `services/dataLoader.ts` follow the same structure. Identify:

- `fetchJSON()` call with `/data/<filename>.json`
- Null guard (`if (!json) return []`)
- Array mapping with coordinate parsing + `makePoint()` construction
- Return of `DataPoint[]`
- Check if loader-specific logic could be parameterized into a shared factory

#### 4b — Component Structure Families

Within each component folder (`Map/`, `Sidebar/`, `Toolbar/`, `TimeFilter/`, `DataForm/`):

- Identify components that use the same Radix primitives wired identically
- Identify components that read the same AppContext fields in the same way
- Check if shared rendering logic could be extracted into a shared component or hook

#### 4c — State Dispatch Patterns

Search `src/components/` for:

- Repeated `dispatch({ type: 'SOME_ACTION', payload: ... })` patterns
- Repeated `const { state, dispatch } = useAppContext()` destructuring
- Identical event handler bodies across components
- Check if shared handlers could live in a shared hook

#### 4d — Utility Scattering

Search for common operations implemented inline in multiple files:

- Date formatting: `new Date(...)`, `toLocaleDateString`
- Coordinate formatting: `toFixed(N)`, `parseFloat`
- HTML escaping: string sanitization patterns
- Class merging: `cn()` calls with identical base classes
- GeoJSON construction: `{ type: 'FeatureCollection', features: [...] }`

Use `grep_search` with patterns like `toGeoJSON`, `makePoint`, `parseFloat`, `cn(` to find scattered implementations.

### Phase 5 — Impact Assessment

For each finding from Phases 2–4, assess the consolidation opportunity.

#### Severity Classification

| Severity     | Criteria                                                    | Typical Action                                              |
| ------------ | ----------------------------------------------------------- | ----------------------------------------------------------- |
| **Critical** | >90% identical bodies across 2+ files; >50 duplicated lines | Extract shared implementation immediately                   |
| **Moderate** | 60–90% similar structure; 20–50 similar lines               | Extract shared base or helper; may require interface design |
| **Low**      | <60% similar but same purpose; <20 similar lines            | Note for future refactor; may be intentional divergence     |

#### Merge Complexity

| Complexity | Criteria                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------ |
| **Easy**   | Extract into shared base class or utility function; no API changes; no caller updates needed     |
| **Medium** | Requires interface redesign (e.g., parameterizing a base class); some callers need updating      |
| **Hard**   | Different callers with different expectations; changes touch public API; breaking changes likely |

#### Per-Finding Assessment

For each finding, record:

- **Severity**: Critical / Moderate / Low
- **Merge complexity**: Easy / Medium / Hard
- **Lines recoverable**: Estimated LOC eliminated by consolidation
- **Files affected**: Which files change
- **Risk**: Breaking changes, test failures, API surface impact
- **Recommended pattern**: The specific design pattern to apply (see below)

**Recommended patterns for consolidation:**

| Pattern                     | When to Use                                                                      |
| --------------------------- | -------------------------------------------------------------------------------- |
| **Extract custom hook**     | Components sharing the same stateful logic (`useState` + `useEffect` + handlers) |
| **Config-driven factory**   | Loader functions differing only in config values (file, field keys, parser)      |
| **Higher-order component**  | Components wrapping another component with identical enhancement                 |
| **Shared utility function** | Same helper function in 2+ files (date format, coordinate format, HTML builders) |
| **Parameterized component** | Components differing only in props passed to the same Radix primitive            |
| **Shared context selector** | Identical `useAppContext()` destructuring + derived values across components     |

### Phase 6 — Report Generation

Produce a dated report at `docs/<YYYY-MM-DD>_Code_Duplication_Audit.md` using the [report template](./references/report-template.md).

**Report contents:**

1. **Header metadata** — date, scope, files/classes/functions scanned, finding counts
2. **Executive summary** — 3–5 sentences: what was scanned, headline findings, top-3 actionable merges
3. **Critical findings** — Per-finding detail with file paths, similarity score, side-by-side code snippets, specific merge recommendation
4. **Moderate findings** — Same structure, lighter detail
5. **Low-priority findings** — Table format only
6. **Merge roadmap** — Prioritized table of consolidation actions with dependency order and estimated LOC savings
7. **False positive notes** — Items considered but excluded, with reasoning

## Output Artifacts

| Artifact                 | Path                                          | When   |
| ------------------------ | --------------------------------------------- | ------ |
| Duplication audit report | `docs/<YYYY-MM-DD>_Code_Duplication_Audit.md` | Always |

## Quality Criteria

Before finalizing, verify:

- [ ] Every finding is verified by reading actual source code — no speculative claims
- [ ] Similarity assessments are grounded in concrete function/line comparisons
- [ ] At least 2 code snippet comparisons included per Critical finding (TypeScript/TSX)
- [ ] Merge recommendations name a specific pattern (e.g., "extract custom hook", "config-driven loader factory")
- [ ] Report covers all scanned directories — no silently skipped modules
- [ ] Lines-recoverable estimates are conservative (round down, not up)
- [ ] False positive notes explain why excluded items are intentionally different
- [ ] Module map table in Phase 1 accounts for every `.ts`/`.tsx` file in scope

## Anti-Patterns

Avoid these common false-positive traps:

- **Don't flag layer config entries as duplicates** — all 8 entries in `config/layers.ts` share the same shape by design; identical structure is the point
- **Don't flag loader functions as Critical duplicates purely on fetch pattern** — the shared `fetchJSON()` + null-guard structure is intentional scaffolding; only flag when the parsing and mapping logic is also duplicated
- **Don't count shared type interfaces as duplication** — `DataPoint`, `LayerConfig`, and other interfaces in `types/index.ts` are centralized by design
- **Don't flag Radix UI import patterns** — importing and forwarding Radix primitives follows the component library's intended usage
- **Don't conflate "similar structure" with "duplicate implementation"** — Phase 2 flags structure; Phase 3 _must_ verify body-level similarity before classifying as a finding
- **Don't recommend merging components with different purposes** — `Sidebar` and `Toolbar` may share hooks but serve fundamentally different roles; merging would create a fragile god-component
- **Don't flag intentional data-driven repetition** — `popupFields` arrays in each layer config look similar but are data, not code

## Tips

- **Start with `services/dataLoader.ts`** — all 8 loader functions are in one file and share the same high-level pattern; duplication clusters here are the most actionable
- **Use `grep_search` to find function name repetition** — searching for `export function` or `const load` across `src/` quickly reveals structural patterns
- **Read whole files, not snippets** — function-level similarity requires full body context; reading only signatures misses copy-paste
- **Cross-reference `config/layers.ts`** — the single-source-of-truth config already centralizes layer metadata; look for logic that _should_ be config-driven but isn't
- **Quantify, don't just flag** — "these loaders are similar" is not actionable; "6 of the 8 loaders share 12 identical lines, saving ~70 LOC by extracting a `makeLayerLoader()` factory" is
- **Check for inline popup HTML construction** — `buildPopupHTML()` in `MapContainer.tsx` may have repeated string-template patterns that could be componentized

## References

- [Duplication categories](./references/duplication-categories.md)
- [Report template](./references/report-template.md)
