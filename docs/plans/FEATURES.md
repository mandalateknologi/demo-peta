# Peta Bencana — Features & Bugs Registry

> **Single source of truth** for all tracked features and bugs.
> Every item has a unique number (`FEAT-XXX` or `BUG-XXX`) that threads through
> feature analysis, planning, and task breakdowns.

---

## Workflow

```
1. Propose    → Run feature-analysis skill to evaluate feasibility
2. Register   → If verdict is Implement, assign next FEAT-XXX / BUG-XXX number here
3. Plan       → Create a plan (title includes [FEAT-XXX] or [BUG-XXX])
4. Tasks      → Run plan-to-tasks skill → generates TASK_FEAT_XXX_[NAME].md
5. Implement  → Work through tasks, update status below as you go
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

| Number   | Title                                     | Description                                                                                                             | Priority | Status      | Plan File                  | Date Added |
| -------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------- | ---------- |
| FEAT-001 | Render custom data on map                 | Load user-created points from IndexedDB and display them as a layer on the map                                          | High     | Proposed    | —                          | 2026-04-08 |
| FEAT-002 | Data export (CSV/GeoJSON)                 | Allow users to export visible data points or custom data as CSV or GeoJSON files                                        | Medium   | Proposed    | —                          | 2026-04-08 |
| FEAT-003 | Layer opacity controls                    | Add opacity slider for each data layer in the sidebar (Dexie schema already has `opacity` field)                        | Medium   | Proposed    | —                          | 2026-04-08 |
| FEAT-004 | Province search in sidebar                | Add a search/filter input for the province list in the sidebar                                                          | Low      | Proposed    | —                          | 2026-04-08 |
| FEAT-005 | Auto-refresh running text ticker          | Periodically re-fetch `running_text.json` so the news ticker stays current                                              | Low      | Proposed    | —                          | 2026-04-08 |
| FEAT-006 | Service worker for offline data caching   | Cache fetched data files via service worker so the app works offline after first load                                   | Medium   | Proposed    | —                          | 2026-04-08 |
| FEAT-007 | Flood/inundation mapping layer            | Add a flood detection layer using BNPB or satellite-based data                                                          | Medium   | Proposed    | —                          | 2026-04-08 |
| FEAT-008 | Comprehensive ARIA labels & keyboard nav  | Add ARIA attributes, keyboard handlers, and focus management across all interactive components                          | Medium   | Proposed    | —                          | 2026-04-08 |
| FEAT-009 | Per-layer error display in UI             | Surface data-load errors per layer in the sidebar (errors state exists but is never rendered)                           | Medium   | Proposed    | —                          | 2026-04-08 |
| FEAT-010 | Implement mobile hamburger menu           | Make the toolbar hamburger button functional with a slide-out menu                                                      | Low      | Proposed    | —                          | 2026-04-08 |
| FEAT-011 | Data fetch retry mechanism                | Add configurable retry logic for transient network failures in `fetchJSON()`                                            | Low      | Proposed    | —                          | 2026-04-08 |
| FEAT-012 | Consolidate icon/color mappings to config | Move duplicated `LAYER_ICONS` and `LAYER_COLORS` from components into `config/layers.ts`                                | Low      | Proposed    | —                          | 2026-04-08 |
| FEAT-013 | Management Dashboard                      | Split-view dashboard with summary cards, interactive charts (recharts), and province statistics for management overview | High     | In Progress | TASK_FEAT_013_DASHBOARD.md | 2026-04-08 |

---

## Bugs

| Number  | Title                                          | Description                                                                                        | Priority | Status   | Plan File | Date Added |
| ------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- | -------- | --------- | ---------- |
| BUG-001 | Map event listeners not cleaned up on unmount  | `useEffect` in `MapContainer.tsx` does not return cleanup functions for map event listeners        | High     | Proposed | —         | 2026-04-08 |
| BUG-002 | Coordinate cast without runtime validation     | `as [number, number]` cast in `MapContainer.tsx` with no check that values are actually numeric    | Medium   | Proposed | —         | 2026-04-08 |
| BUG-003 | LAYER_ICONS record not exhaustively checked    | `LAYER_ICONS` in `ProvincePanel.tsx` maps layer IDs but has no verification all layers are covered | Low      | Proposed | —         | 2026-04-08 |
| BUG-004 | Sidebar layout breaks on narrow screens        | No media query adjustments for screens < 640px; sidebar may overlap map entirely                   | Medium   | Proposed | —         | 2026-04-08 |
| BUG-005 | Time filter buttons truncate on mobile         | Time filter buttons may scroll off-screen on narrow viewports                                      | Medium   | Proposed | —         | 2026-04-08 |
| BUG-006 | GeoJSON property access without type narrowing | Accessing `f.properties.province_id` and `f.properties.name` in Sidebar without type narrowing     | Low      | Proposed | —         | 2026-04-08 |

---

## How to Add a New Entry

1. Pick the next available number: `FEAT-XXX` for features, `BUG-XXX` for bugs (zero-padded, 3 digits).
2. Add a row to the appropriate table above.
3. Set **Status** to `Proposed` (or `Approved` if it came from a feature-analysis with an Implement verdict).
4. Set **Plan File** to `—` until a task file is created.
5. When a task file is created via plan-to-tasks, update **Plan File** to the filename (e.g., `TASK_FEAT_001_CUSTOM_DATA.md`) and set **Status** to `In Progress`.
6. When all tasks are done, set **Status** to `Done`.
