# Peta Bencana — Features & Bugs Registry

> **Single source of truth** for all tracked features and bugs.
> Every item has a unique number (`FEAT-XXX` or `BUG-XXX`) that threads through
> feature analysis, planning, and task breakdowns.

---

## Workflow

```
1. Analyze    → Run feature-analysis skill (prompts for Name + Reason)
               → If verdict is Implement: auto-registers here, generates plan file
2. Plan       → Plan file already exists (PLAN_FEAT_XXX_P01.md in docs/plans/)
               → Revisions create P02, P03, … — only latest is active
3. Tasks      → Run plan-to-tasks skill (MUST attach the plan file)
               → Generates TASK_FEAT_XXX_[NAME].md in docs/tasks/
4. Implement  → Engineers claim tasks (Assigned To field), update status as they go
```

---

## Status Legend

| Status        | Meaning                                                 |
| ------------- | ------------------------------------------------------- |
| `Proposed`    | Registered but not yet analyzed or approved             |
| `Approved`    | Feature analysis passed; ready for planning             |
| `In Progress` | Plan/tasks created; implementation underway             |
| `Done`        | All tasks completed, tested, and merged                 |
| `Rejected`    | Feature analysis verdict was Reject; will not implement |

## Priority Legend

| Priority   | Meaning                                          |
| ---------- | ------------------------------------------------ |
| `Critical` | Blocks other work or causes data loss / crashes  |
| `High`     | Core functionality gap; should be addressed soon |
| `Medium`   | Important improvement; has workarounds           |
| `Low`      | Nice-to-have; polish, optimization, minor UX     |

---

## Features

| Number   | Title                                     | Description                                                                                                                                                                                  | Priority | Status      | Plan File            |
| -------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------- |
| FEAT-001 | Render custom data on map                 | Load user-created points from IndexedDB and display them as a layer on the map                                                                                                               | High     | Proposed    | —                    |
| FEAT-002 | Data export (CSV/GeoJSON)                 | Allow users to export visible data points or custom data as CSV or GeoJSON files                                                                                                             | Medium   | Proposed    | —                    |
| FEAT-003 | Layer opacity controls                    | Add opacity slider for each data layer in the sidebar (Dexie schema already has `opacity` field)                                                                                             | Medium   | Proposed    | —                    |
| FEAT-004 | Province search in sidebar                | Add a search/filter input for the province list in the sidebar                                                                                                                               | Low      | Proposed    | —                    |
| FEAT-005 | Auto-refresh running text ticker          | Periodically re-fetch `running_text.json` so the news ticker stays current                                                                                                                   | Low      | Proposed    | —                    |
| FEAT-006 | Service worker for offline data caching   | Cache fetched data files via service worker so the app works offline after first load                                                                                                        | Medium   | Proposed    | —                    |
| FEAT-007 | Flood/inundation mapping layer            | Add a flood detection layer using BNPB or satellite-based data                                                                                                                               | Medium   | Proposed    | —                    |
| FEAT-008 | Comprehensive ARIA labels & keyboard nav  | Add ARIA attributes, keyboard handlers, and focus management across all interactive components                                                                                               | Medium   | Proposed    | —                    |
| FEAT-009 | Per-layer error display in UI             | Surface data-load errors per layer in the sidebar (errors state exists but is never rendered)                                                                                                | Medium   | Proposed    | —                    |
| FEAT-010 | Implement mobile hamburger menu           | Make the toolbar hamburger button functional with a slide-out menu                                                                                                                           | Low      | Proposed    | —                    |
| FEAT-011 | Data fetch retry mechanism                | Add configurable retry logic for transient network failures in `fetchJSON()`                                                                                                                 | Low      | Proposed    | —                    |
| FEAT-012 | Consolidate icon/color mappings to config | Move duplicated `LAYER_ICONS` and `LAYER_COLORS` from components into `config/layers.ts`                                                                                                     | Low      | Proposed    | —                    |
| FEAT-013 | Management Dashboard                      | Split-view dashboard with summary cards, interactive charts (recharts), and province statistics for management overview                                                                      | High     | In Progress | PLAN_FEAT_013_P01.md |
| FEAT-014 | UI Contrast Enhancement                   | Enhance visual contrast for sidebar, running text ticker, selected province highlight, and map markers/clusters using combined approach (darker bg, accent borders, higher opacity, shadows) | Medium   | Approved    | —                    |

---

## Bugs

| Number  | Title                                          | Description                                                                                        | Priority | Status   | Plan File |
| ------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- | -------- | --------- |
| BUG-001 | Map event listeners not cleaned up on unmount  | `useEffect` in `MapContainer.tsx` does not return cleanup functions for map event listeners        | High     | Proposed | —         |
| BUG-002 | Coordinate cast without runtime validation     | `as [number, number]` cast in `MapContainer.tsx` with no check that values are actually numeric    | Medium   | Proposed | —         |
| BUG-003 | LAYER_ICONS record not exhaustively checked    | `LAYER_ICONS` in `ProvincePanel.tsx` maps layer IDs but has no verification all layers are covered | Low      | Proposed | —         |
| BUG-004 | Sidebar layout breaks on narrow screens        | No media query adjustments for screens < 640px; sidebar may overlap map entirely                   | Medium   | Proposed | —         |
| BUG-005 | Time filter buttons truncate on mobile         | Time filter buttons may scroll off-screen on narrow viewports                                      | Medium   | Proposed | —         |
| BUG-006 | GeoJSON property access without type narrowing | Accessing `f.properties.province_id` and `f.properties.name` in Sidebar without type narrowing     | Low      | Proposed | —         |

---

## How to Add a New Entry

> **Preferred method**: Run the `feature-analysis` skill — it auto-registers the feature and generates the plan file.
> Manual registration is only needed for bugs or deferred features.

1. Pick the next available number: `FEAT-XXX` for features, `BUG-XXX` for bugs (zero-padded, 3 digits).
2. Add a row to the appropriate table above.
3. Set **Status** to `Proposed` (or `Approved` if it came from a feature-analysis with an Implement verdict).
4. Set **Plan File** to `—` until a plan file is created.
5. When the `feature-analysis` skill generates a plan file, it auto-updates **Plan File** to `PLAN_FEAT_XXX_P01.md` and sets **Status** to `Approved`.
6. When a task file is created via `plan-to-tasks`, set **Status** to `In Progress`.
7. When all tasks are done, set **Status** to `Done`.
