---
name: feature-analysis
description: "Analyze a proposed new feature for Peta Bencana. Use when: evaluating feature proposals, assessing architectural fit, reviewing new data layers or UI additions, checking frontend-only compatibility, proposing integration designs for new capabilities."
argument-hint: "Feature name and brief description (e.g. 'tsunami warning layer', 'offline tile caching', 'area measurement tool')"
---

# Peta Bencana Feature Analysis

Analyze a proposed new feature for Peta Bencana — an Indonesian hazard-mapping SPA — and produce a structured architecture assessment.

## When to Use

- Evaluating whether a new capability belongs in Peta Bencana
- Assessing how a feature fits the data-layer architecture and frontend-only philosophy
- Designing the integration approach and implementation plan for a proposed feature
- Reviewing compatibility with existing layers, theming, map behavior, and state management

## Input

The user provides a **feature name** and optionally a brief description. If the description is missing, ask the user to clarify what the feature does before proceeding.

## Procedure

Work through each section below sequentially. For each section, ground your analysis in Peta Bencana's actual codebase and architecture — reference the [project philosophy checklist](./references/philosophy-checklist.md) and the project's `copilot-instructions.md` for architecture details.

### 1. Feature Description

Explain what the feature does and the specific problem it solves for hazard monitoring or map users. Be concrete — name the inputs, outputs, and core transformation or interaction.

### 2. Use Cases

List 3–5 practical scenarios where this feature adds value. For each, briefly state the user role (e.g., emergency responder, researcher, public user, government operator) and the workflow it enables or simplifies.

### 3. Fit with Project Philosophy

Evaluate the feature against Peta Bencana's three core principles:

| Principle                   | Question                                                                                                 | Pass/Fail |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | --------- |
| **Data-layer architecture** | Can the feature be expressed as a new data layer with a loader + config entry + popup fields?            |           |
| **Frontend-only SPA**       | Does this work without a backend server? Data must be fetchable as static JSON or a public API.          |           |
| **Map-centric UI**          | Does it render on/interact with the MapLibre map, or belong in the sidebar/toolbar with a clear purpose? |           |

If any principle fails, explain the tension and whether it can be resolved.

### 4. Integration Approach

Determine where the feature should live in Peta Bencana's architecture. Choose one:

| Integration Point    | When to Use                                                 | Example                                          |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| **New data layer**   | Feature adds a new hazard/data source to the map            | Tsunami warnings, flood gauge stations           |
| **New component**    | Feature adds a new UI panel, dialog, or control             | Legend panel, export dialog, permalink button    |
| **State extension**  | Feature needs new global state fields or reducer actions    | New filter type, user-saved views, bookmarks     |
| **Map interaction**  | Feature adds new map behavior (drawing, measuring, picking) | Polygon selection, distance tool, route drawing  |
| **Service module**   | Feature adds data processing logic used by other modules    | New parser, aggregation function, GeoJSON export |
| **Config extension** | Feature extends the existing config structure               | New marker type, new popup field format type     |

Justify your choice. If the feature spans multiple integration points, describe each.

### 5. API / Integration Proposal

Propose how the feature would be implemented. Follow Peta Bencana's existing conventions:

**If a new data layer:**

```typescript
// 1. Entry in config/layers.ts
{
  id: '<layer-id>',
  name: '<Display Name>',
  file: '<filename>.json',
  markerType: 'circle' | 'gif',
  color: '#rrggbb',
  hasDate: true | false,
  cluster: true | false,
  popupFields: [ { key: '...', label: '...' } ],
  defaultVisible: true | false,
}

// 2. Loader function in services/dataLoader.ts
export async function load<LayerName>(): Promise<DataPoint[]> { ... }

// 3. Register in loadAllData() — add to loaders[] and layerIds[]
```

**If a new component:**

```typescript
// New file: src/components/<Feature>/<Component>.tsx
// - Read global state via const { state, dispatch } = useAppContext()
// - Dispatch actions for state changes
// - Use Tailwind classes + dark: variant; Radix UI primitives; Lucide icons
```

**New type definitions** (if needed):

```typescript
// Add to src/types/index.ts
interface NewFeatureConfig { ... }
type NewActionType = 'NEW_ACTION';
```

**New reducer actions** (if needed):

```typescript
// Add case to reducer in AppContext.tsx
case 'NEW_ACTION': return { ...state, newField: action.payload };
```

### 6. Compatibility Matrix

Assess compatibility with existing system dimensions:

| Dimension                 | Compatible? | Notes |
| ------------------------- | ----------- | ----- |
| Dark theme                |             |       |
| Light theme               |             |       |
| Mobile viewport           |             |       |
| Time filter (1h–7d / ALL) |             |       |
| Clustering (GeoJSON)      |             |       |
| GIF markers (DOM-based)   |             |       |
| Circle markers (GL layer) |             |       |
| Popup display             |             |       |
| Layer toggle (visibility) |             |       |
| IndexedDB / offline data  |             |       |

### 7. Performance Impact

Briefly evaluate:

- **Map render cost**: How many new GeoJSON features or DOM markers? Will clustering handle scale?
- **Bundle size**: Does this require a new npm package? Estimate KB impact.
- **Network requests**: Does this add new fetch calls? Is the data source reliable and fast?
- **State update frequency**: Does this trigger frequent re-renders or map redraws?
- **IndexedDB usage**: Does this need persistence? How large is the stored payload?

### 8. Final Recommendation

Provide a clear **Implement / Defer / Reject** verdict with justification:

- **Implement**: Feature aligns with project philosophy, has clear use cases, and integrates cleanly. State which integration point(s) and estimated scope.
- **Defer**: Feature has merit but depends on prerequisites or needs design iteration. State what must happen first (e.g., data source access, new parser, design approval).
- **Reject**: Feature diverges from the frontend-only SPA model, requires a backend, or is better served by a different tool. Explain where and why it diverges.

### 9. Registration

If the verdict in section 8 is **Implement** or **Defer**, register the feature in the project backlog:

1. Read `docs/plans/FEATURES.md` to find the next available `FEAT-XXX` number.
2. Output a ready-to-paste table row for the **Features** table:

```markdown
| FEAT-XXX | [Short Title] | [One-line description] | [Priority] | Proposed | — | [YYYY-MM-DD] |
```

3. If the user confirms, append the row to `docs/plans/FEATURES.md` under the **Features** table.

For **bug fixes** discovered during analysis, use `BUG-XXX` numbering and add to the **Bugs** table instead.

Do **not** register if the verdict is **Reject**.

## Output Format

Present the analysis as a structured Markdown document with numbered sections matching the procedure above (1–9). Use tables where specified. Keep each section concise — aim for the minimum words needed to convey a clear, justified assessment.

## Quality Checks

Before finalizing, verify:

- [ ] Every section is addressed (no skipped sections)
- [ ] Integration proposal follows existing Peta Bencana conventions (layer config + loader + optional state)
- [ ] Philosophy assessment references actual project principles, not generic software principles
- [ ] Recommendation includes a clear verdict with justification
- [ ] No speculative claims — if uncertain about implementation details, say so
- [ ] If verdict is Implement/Defer, section 9 includes a `FEAT-XXX` registration row
