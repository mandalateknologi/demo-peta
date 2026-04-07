# Peta Bencana — Project Guidelines

## Tech Stack

- **React 19** + **TypeScript 6** + **Vite 8** (frontend-only SPA)
- **MapLibre GL JS** for interactive mapping
- **Tailwind CSS v4** (utility-first, no CSS modules)
- **Radix UI** for unstyled accessible primitives
- **Dexie.js** for IndexedDB persistence
- **Lucide React** for icons

## Code Style

- Functional React components only — no class components
- Global state via `useReducer` + React Context (`AppContext.tsx`)
- Local state via `useState`; memoize callbacks with `useCallback`
- Use `cn()` from `@/lib/utils` for conditional Tailwind class merging
- Strict TypeScript: no `any` — use `Record<string, unknown>` for dynamic shapes
- All shared types live in `src/types/index.ts`
- Use relative imports (the `@/` alias exists but is not used in this codebase)

## Architecture

```
src/
  components/<Feature>/<Component>.tsx   # Feature-folder layout
  services/                              # Data loading & parsing logic
  config/layers.ts                       # Layer definitions (single source of truth)
  context/AppContext.tsx                  # Global state + reducer
  db/index.ts                            # Dexie IndexedDB schema
  types/index.ts                         # All shared interfaces
```

- Layer metadata (id, color, marker type, popup fields) is declared in `config/layers.ts`
- Each data layer has its own loader function in `services/dataLoader.ts`
- Coordinate/date parsing helpers live in `services/coordinateParser.ts`

## Build & Dev

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Conventions

- Data files are served from `public/data/*.json`; missing files must fail silently
- Popups render HTML strings — sanitize any user-facing property values
- Dark/light theme controlled via `.dark` class on root div + Tailwind `dark:` variant
- New layers must be registered in `config/layers.ts` with a matching loader in `services/dataLoader.ts`
- Icon imports come from `lucide-react`; prefer existing icon set before adding new ones
