# [Feature Title] — Plan

> **Tracking**: FEAT-XXX
> **Plan Revision**: P01
> **Requested by**: [Name]
> **Reason**: [Why this feature is needed]
> **Date**: YYYY-MM-DD
> **Verdict**: Implement

---

## 1. Feature Description

[What the feature does and the specific problem it solves.]

## 2. Use Cases

1. **[User role]** — [Workflow this enables or simplifies]
2. **[User role]** — [Workflow this enables or simplifies]
3. **[User role]** — [Workflow this enables or simplifies]

## 3. Fit with Project Philosophy

| Principle                   | Question                                                                                                 | Pass/Fail |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | --------- |
| **Data-layer architecture** | Can the feature be expressed as a new data layer with a loader + config entry + popup fields?            |           |
| **Frontend-only SPA**       | Does this work without a backend server? Data must be fetchable as static JSON or a public API.          |           |
| **Map-centric UI**          | Does it render on/interact with the MapLibre map, or belong in the sidebar/toolbar with a clear purpose? |           |

## 4. Integration Approach

| Integration Point | When to Use | Justification |
| ----------------- | ----------- | ------------- |
| [Point]           | [When]      | [Why]         |

## 5. API / Integration Proposal

[Implementation details following Peta Bencana conventions — layer config, loader, component, state, etc.]

## 6. Compatibility Matrix

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

## 7. Performance Impact

- **Map render cost**: [Assessment]
- **Bundle size**: [Assessment]
- **Network requests**: [Assessment]
- **State update frequency**: [Assessment]
- **IndexedDB usage**: [Assessment]

## 8. Final Recommendation

**Verdict**: Implement

[Justification — which integration point(s), estimated scope, key risks.]
