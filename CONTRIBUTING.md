# Contributing to Peta Bencana Mandala

Thank you for your interest in contributing! This document covers how to report bugs, propose improvements, and submit code changes.

---

## Table of Contents

- [Reporting Bugs](#reporting-bugs)
- [Proposing Features](#proposing-features)
- [Development Setup](#development-setup)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Code Style](#code-style)
- [Running Tests](#running-tests)
- [Adding a New Data Layer](#adding-a-new-data-layer)
- [Commit Messages](#commit-messages)

---

## Reporting Bugs

Open an issue on GitHub with:

1. A clear, descriptive title.
2. Steps to reproduce the problem.
3. What you expected to happen and what actually happened.
4. Browser, OS, and screen size (map issues are often viewport-dependent).
5. Console errors if any (DevTools → Console).

---

## Proposing Features

Open a GitHub issue tagged **enhancement** before writing code. Describe the problem it solves and how it fits the project's scope (frontend-only, Indonesia hazard data, no backend).

---

## Development Setup

Follow [QUICKSTART.md](QUICKSTART.md) to clone the repo and start the dev server. The full workflow:

```bash
git clone https://github.com/your-org/demo-peta.git
cd demo-peta
npm install
npm run dev        # http://localhost:5173
```

Run the linter and tests before pushing any changes:

```bash
npm run lint       # ESLint (TypeScript + React hooks rules)
npm test           # Vitest — single run
```

---

## Submitting a Pull Request

1. **Fork** the repository and create a feature branch from `main`:

   ```bash
   git checkout -b add-flood-layer
   ```

2. Make your changes (see [Code Style](#code-style) and [Running Tests](#running-tests) below).

3. Run lint and tests — both must pass:

   ```bash
   npm run lint
   npm test
   ```

4. Push your branch and open a PR against `main`. Include:
   - What the PR does and why.
   - Screenshots or recordings for any visual changes.
   - The related issue number if applicable (`Closes #42`).

PRs with failing lint or tests will not be merged.

---

## Code Style

The codebase follows the rules in `.github/copilot-instructions.md`. Key points:

- **Functional components only** — no class components.
- **Strict TypeScript** — no `any`. Use `Record<string, unknown>` for dynamic shapes.
- **No inline styles** — use Tailwind CSS v4 utility classes. Conditional merging via `cn()` from `src/lib/utils.ts`.
- **Radix UI** for any interactive primitives (dialogs, dropdowns, tooltips) to ensure accessibility.
- **Lucide React** for icons — check the existing set before importing a new icon.
- **Relative imports** — do not use the `@/` alias even though it exists; follow the pattern in existing files.
- **One component per file**, named after the file (e.g., `Sidebar.tsx` exports `Sidebar`).
- All shared TypeScript interfaces live in `src/types/index.ts`.
- New layer metadata (id, color, marker type, popup fields) belongs in `src/config/layers.ts`.

---

## Running Tests

```bash
npm test               # Run all tests once
npm run test:watch     # Re-run on file change (useful during development)
```

Tests live in `src/services/__tests__/`. When adding a new parser or loader function, add a corresponding test file in the same `__tests__/` directory.

Test files that currently exist:

| File                       | Coverage                                                       |
| -------------------------- | -------------------------------------------------------------- |
| `coordinateParser.test.ts` | All five coordinate parsers, three date parsers, `makePoint()` |
| `dataLoader.test.ts`       | `filterByTime()` for all time ranges, `toGeoJSON()` conversion |

---

## Adding a New Data Layer

See the detailed steps in [DEVELOPMENT.md — Adding a New Data Source](DEVELOPMENT.md#adding-a-new-data-source):

1. Drop the JSON data file in `public/data/`.
2. Add a `LayerConfig` entry in `src/config/layers.ts`.
3. Write a loader function in `src/services/dataLoader.ts` and register it in `loadAllData()`.
4. Add the layer icon to `LAYER_ICONS` in `src/components/Sidebar/Sidebar.tsx`.
5. Add tests for any new coordinate or date parsers in `src/services/__tests__/`.

---

## Commit Messages

Write messages in the **imperative mood** that complete the sentence "If applied, this commit will…":

```
Add flood layer with BNPB GeoJSON source
Fix longitude parsing for comma-string coordinates
Update province panel to show rainfall data
Remove unused TimeFilter import
```

Guidelines:

- Keep the subject line under 72 characters.
- Reference the issue number at the end if applicable: `Fix popup HTML escaping (#17)`.
- No need for a rigid prefix format (e.g., `feat:`, `fix:`) — clear descriptive messages are sufficient.

---

## License

By contributing, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
