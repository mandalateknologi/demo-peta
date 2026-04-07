# [Feature Name] — Implementation Tasks

> **Project**: Peta Bencana — [Feature Context]
> **Feature**: [One-line description of what this feature does]
> **Timeline**: [X weeks] (Estimated)
> **Team**: [N developers]
> **Status**: Planning Phase

---

## Progress Summary

### ✅ Completed

_Nothing yet._

### 🔄 In Progress

_Nothing yet._

### ⏳ Pending

**Phase A — Core Types & Config**

- [ ] A1: [Task title]
- [ ] A2: [Task title]

**Phase B — Services & Data**

- [ ] B1: [Task title]

**Phase C — Components & UI**

- [ ] C1: [Task title]

**Phase D — State & Context**

- [ ] D1: [Task title]

**Phase E — Map Integration**

- [ ] E1: [Task title]

**Phase F — Testing**

- [ ] F1: [Task title]

**Phase G — Documentation**

- [ ] G1: [Task title]

---

## Metrics

| Metric                  | Target          |
| ----------------------- | --------------- |
| New files created       | [N]             |
| Files modified          | [N]             |
| Unit tests added        | [N]             |
| Integration tests added | [N]             |
| Bundle size delta       | < [X] KB        |
| Data layers affected    | [layer-id, ...] |

---

## Issue / Bottleneck Summary

| ID  | Severity | Location                     | Description                 |
| --- | -------- | ---------------------------- | --------------------------- |
| B-1 | High     | `src/config/layers.ts`       | [Description of issue]      |
| B-2 | Medium   | `src/services/dataLoader.ts` | [Description of bottleneck] |

_Severity: Critical · High · Medium · Low · Info_

---

## Architectural Decisions

| Decision                  | Choice           | Rationale                            |
| ------------------------- | ---------------- | ------------------------------------ |
| Marker type for new layer | `circle` / `gif` | [Reason based on feature behavior]   |
| State persistence         | IndexedDB / none | [Reason]                             |
| Clustering                | Yes / No         | [Expected feature count, zoom level] |

---

## Conflict Analysis

| Area                         | Risk   | Mitigation                              |
| ---------------------------- | ------ | --------------------------------------- |
| `config/layers.ts` structure | Low    | Simple object addition, no merge risk   |
| Active TASK_X work           | Medium | Coordinate merge order with active work |

---

## Task Assignment Guide

### 🔴 Critical Path

```
A1 (types) → A2 (config entry) → B1 (loader) → E1 (map layer) → F1 (tests)
```

### 🟡 Parallel Work

- **C1** — component can develop in parallel with B1
- **D1** can start once A1 is done — parallel with B1/C1

### 🟢 Post-Integration

- G1 — documentation only after all phases merged

---

## Phases & Tasks

### Phase A — Core Types & Config

---

### Task A1: [Short Title] 🔴

**Priority**: Critical
**Estimated time**: [N] hours
**Dependencies**: None
**Status**: ⏳ Pending

**Description**: [What this task accomplishes in 2-3 sentences.]

**Files to modify**:

- `src/types/index.ts` — Add [interface/type] definition
- `src/config/layers.ts` — Register new layer config entry

**Changes required**:

```typescript
// Example: new interface in types/index.ts
interface NewFeatureData {
  id: string;
  layerId: string;
  // ...
}

// Example: new layer entry in config/layers.ts
{
  id: 'new-layer',
  name: 'NEW LAYER',
  file: 'new-layer.json',
  markerType: 'circle',
  color: '#rrggbb',
  hasDate: true,
  cluster: true,
  popupFields: [
    { key: 'field', label: 'Field Label' },
  ],
  defaultVisible: false,
},
```

**Constraints**:

- Layer `id` must be unique across all entries in `config/layers.ts`
- `color` must be a valid hex color string

**Acceptance Criteria**:

- ✅ New type/interface is exported from `types/index.ts` with no TypeScript errors
- ✅ Layer config entry is syntactically valid and passes `npm run build`
- ✅ Test requirements: see Task F1

**After Implementation**: [To be filled after completion]

---

### Phase B — Services & Data

---

### Task B1: [Short Title] 🔴

**Priority**: High
**Estimated time**: [N] hours
**Dependencies**: Task A1
**Status**: ⏳ Pending

**Description**: [What this task accomplishes.]

**Files to modify**:

- `src/services/dataLoader.ts` — Add loader function and register in `loadAllData()`
- `public/data/new-layer.json` — Add or verify data file exists

**Changes required**:

```typescript
// New loader function
export async function loadNewLayer(): Promise<DataPoint[]> {
  const res = await fetch('data/new-layer.json');
  if (!res.ok) return [];
  const json = await res.json();
  // parse json.features or json.data array
  return json.items.map((item: Record<string, unknown>, idx: number) => ({
    id: `new-layer-${idx}`,
    layerId: 'new-layer',
    lat: parseFloat(String(item.latitude)),
    lng: parseFloat(String(item.longitude)),
    date: item.date ? new Date(String(item.date)) : undefined,
    properties: { field: String(item.field ?? '') },
  }));
}

// Register in loadAllData():
const loaders = [..., loadNewLayer];
const layerIds = [..., 'new-layer'];
```

**Constraints**:

- Loader must fail silently (return `[]`) if data file is missing or malformed
- Must use `makePoint()` helper or inline `DataPoint` construction — no ad-hoc shapes

**Acceptance Criteria**:

- ✅ `loadNewLayer()` returns `DataPoint[]` with correct `layerId`
- ✅ Function is registered in `loadAllData()` and layer appears on map after load
- ✅ Missing or malformed JSON does not throw — returns `[]`
- ✅ Test requirements: see Task F1

**After Implementation**: [To be filled after completion]

---

### Phase C — Components & UI

---

### Task C1: [Short Title] 🟡

**Priority**: Medium
**Estimated time**: [N] hours
**Dependencies**: Task A1
**Status**: ⏳ Pending

**Description**: [What this task accomplishes.]

**Files to modify**:

- `src/components/[Feature]/[Component].tsx` — Create new component
- `src/App.tsx` — Mount component in layout

**Changes required**:

```typescript
// src/components/Feature/Component.tsx
import { useAppContext } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export function Component() {
  const { state, dispatch } = useAppContext();

  return (
    <div className={cn('...', state.theme === 'dark' && 'dark:...')}>
      {/* component content */}
    </div>
  );
}
```

**Constraints**:

- Use `cn()` for conditional Tailwind class merging — no inline styles
- Dark mode via `dark:` variant only — do not manipulate `.dark` class manually
- Icons from `lucide-react` only — no new icon libraries

**Acceptance Criteria**:

- ✅ Component renders without errors in both light and dark themes
- ✅ Component reads state via `useAppContext()` — no prop drilling from App
- ✅ Mobile viewport (≥320px) doesn't cause layout overflow
- ✅ Test requirements: see Task F1

**After Implementation**: [To be filled after completion]

---

### Phase D — State & Context

---

### Task D1: [Short Title] 🟡

**Priority**: Medium
**Estimated time**: [N] hours
**Dependencies**: Task A1
**Status**: ⏳ Pending

**Description**: [What this task accomplishes.]

**Files to modify**:

- `src/context/AppContext.tsx` — Extend `AppState`, add reducer action
- `src/types/index.ts` — Add new action type to union

**Changes required**:

```typescript
// In AppState:
newField: NewFieldType;

// New action:
| { type: 'SET_NEW_FIELD'; payload: NewFieldType }

// In reducer:
case 'SET_NEW_FIELD':
  return { ...state, newField: action.payload };

// Initial state:
newField: defaultValue,
```

**Constraints**:

- Reducer must be a pure function — no side effects inside the switch
- `initialState` must include the new field with a sensible default

**Acceptance Criteria**:

- ✅ `AppState` type contains the new field with correct type
- ✅ Dispatching the new action updates state correctly
- ✅ Initial render uses the default value without errors
- ✅ Test requirements: see Task F1

**After Implementation**: [To be filled after completion]

---

### Phase E — Map Integration

---

### Task E1: [Short Title] 🔴

**Priority**: High
**Estimated time**: [N] hours
**Dependencies**: Task B1, Task D1
**Status**: ⏳ Pending

**Description**: [What this task accomplishes.]

**Files to modify**:

- `src/components/Map/MapContainer.tsx` — Add layer rendering logic

**Changes required**:

```typescript
// Add GeoJSON source + layer, or GIF marker logic
// Follow existing pattern for 'circle' or 'gif' markerType
// Popup: build sanitized HTML string from popupFields config
```

**Constraints**:

- Popup HTML values must be sanitized — never inject raw `properties` values directly
- GIF markers use DOM `div` elements appended as `maplibregl.Marker` — not GL layers
- Add / remove layers on map `load` event, not on component mount

**Acceptance Criteria**:

- ✅ Layer appears on map when toggled visible
- ✅ Layer disappears from map when toggled off
- ✅ Popup opens on feature click with correct fields from `popupFields` config
- ✅ Time filter correctly hides features outside the selected range
- ✅ Test requirements: see Task F1

**After Implementation**: [To be filled after completion]

---

### Phase F — Testing

---

### Task F1: Unit & Integration Tests 🟢

**Priority**: High
**Estimated time**: [N] hours
**Dependencies**: Task B1, Task C1, Task D1, Task E1
**Status**: ⏳ Pending

**Description**: Write tests covering all new code paths added in this feature.

**Files to modify**:

- `src/services/dataLoader.test.ts` — Loader function unit tests
- `src/services/coordinateParser.test.ts` — Parser tests (if new parsers added)
- `src/components/[Feature]/[Component].test.tsx` — Component render tests

**Acceptance Criteria**:

- ✅ Loader returns `[]` for empty/missing data file
- ✅ Loader returns correct `DataPoint[]` for valid input
- ✅ Component renders without errors in light and dark themes
- ✅ Reducer action updates state as expected
- ✅ `npm run build` passes with no type errors
- ✅ `npm run lint` passes with no new warnings

**After Implementation**: [To be filled after completion]

---

### Task F2: Full Regression Suite Verification 🟢

**Priority**: High
**Estimated time**: 2 hours
**Dependencies**: Task F1
**Status**: ⏳ Pending

**Description**: Run the full test suite and manual smoke test of all 8 existing layers to confirm no regressions.

**Acceptance Criteria**:

- ✅ All existing layers still load and render correctly
- ✅ Time filter works for all `hasDate: true` layers
- ✅ Layer toggles in sidebar show/hide map features correctly
- ✅ Popups display expected fields for each layer
- ✅ Dark/light theme toggle works without visual regressions
- ✅ `npm run build` produces a valid production bundle

**After Implementation**: [To be filled after completion]

---

### Phase G — Documentation

---

### Task G1: Update Documentation 🟢

**Priority**: Low
**Estimated time**: 2 hours
**Dependencies**: Task F2
**Status**: ⏳ Pending

**Description**: Update `README.md` and any relevant docs to reflect the new feature. Add a CHANGELOG entry.

**Files to modify**:

- `README.md` — Add feature to feature list / layer table if applicable
- `DEVELOPMENT.md` — Add any new developer notes (new data file format, new config field)

**Acceptance Criteria**:

- ✅ README accurately describes the new feature/layer
- ✅ Any new config fields are documented with their expected values and types
- ✅ DEVELOPMENT.md notes any non-obvious setup or conventions introduced

**After Implementation**: [To be filled after completion]

---

## Testing Checklist

### Unit Tests

- [ ] Loader function: empty input → `[]`
- [ ] Loader function: valid input → correct `DataPoint[]` shape
- [ ] Loader function: malformed JSON → `[]` (silent fail)
- [ ] New parser function (if added): edge cases from `coordinateParser.ts` pattern
- [ ] Reducer case: new action updates state field correctly

### Integration Tests

- [ ] New component mounts without errors
- [ ] New component responds to state changes via `useAppContext`
- [ ] Map layer appears / disappears with visibility toggle
- [ ] Popup renders correct fields for new layer

### Validation

- [ ] `npm run build` — zero TypeScript errors
- [ ] `npm run lint` — zero new lint warnings
- [ ] No leftover `any` types introduced

### Manual Smoke Tests

- [ ] New layer loads data from `public/data/` in browser
- [ ] Layer toggle in sidebar shows/hides markers
- [ ] Popup opens on click with correct label/value pairs
- [ ] Time filter correctly filters new layer features (if `hasDate: true`)
- [ ] Dark theme: no color or contrast regressions
- [ ] Mobile viewport: no layout overflow

---

## Definition of Done

- [ ] All tasks in ⏳ Pending are moved to ✅ Completed
- [ ] All Acceptance Criteria checkboxes are met
- [ ] Full regression suite passes (Task F2)
- [ ] `npm run build` produces a valid production bundle
- [ ] `npm run lint` reports no errors
- [ ] Documentation updated (Task G1)
- [ ] "After Implementation" sections filled in for all tasks
- [ ] No MATA/Python/adapter references left in code or docs
