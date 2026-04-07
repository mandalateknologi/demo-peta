---
description: "Use when creating or editing React components (.tsx files). Covers component structure, hooks usage, Tailwind styling, and Radix UI patterns for Peta Bencana."
applyTo: "src/components/**/*.tsx"
---
# React Component Guidelines

## Structure
- Export one component per file; name must match filename
- Use feature-folder layout: `components/<Feature>/<Component>.tsx`
- Access global state via `useAppContext()` hook — avoid prop drilling
- Pass only event callbacks and local data as props

## Hooks
- `useEffect` for side effects (data loading, DOM subscriptions); always clean up
- `useRef` for DOM refs and mutable values that should not trigger re-renders
- `useCallback` for event handlers passed to children or used in dependency arrays
- Never call hooks conditionally

## Styling
- All styles via Tailwind utility classes in `className`
- Use `cn()` from `../../lib/utils` for conditional classes:
  ```tsx
  <div className={cn('px-3 py-2', isActive && 'bg-blue-500')} />
  ```
- Support dark mode with `dark:` variant: `bg-white dark:bg-slate-900`
- No inline `style` objects unless required by a library (e.g., MapLibre marker positioning)

## Radix UI
- Use Radix primitives for dialogs, selects, checkboxes, labels
- Style Radix components with Tailwind — no custom CSS
- Compose from `@radix-ui/react-*` packages (already installed: dialog, checkbox, label, select, scroll-area, separator)

## Icons
- Import from `lucide-react`
- Prefer icons already used in the project before adding new ones
- Size via `size` prop or Tailwind `w-*` / `h-*`
