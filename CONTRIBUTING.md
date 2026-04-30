# Contributing to JunDS

JunDS is a private design-system monorepo. This guide covers the workflow for
both human contributors and AI agents (Claude Code, Cursor, etc.).

If you are an AI agent, also read `AGENTS.md` first — it lists the artifacts
under `.ai/` that you should consult before opening source files.

---

## Quick start

```bash
npm install
./start                  # dev server on http://localhost:6100
npm test                 # vitest in watch-less mode
npm run typecheck        # tsc --noEmit
```

The pre-commit hook (`.husky/pre-commit`) regenerates `.ai/MAP.md` and
`.ai/props.json` automatically when staged changes touch the design system.

---

## Adding a component

Always prefer the scaffold CLI — it sets up every file in the right shape and
registers the component in the search dictionary, barrel, and showcase.

```bash
npm run scaffold primitive  Foo
npm run scaffold composite  Foo
npm run scaffold pattern    Foo
npm run scaffold hook       useFoo
npm run scaffold requirement my-feature
npm run scaffold recipe     dashboard-overview -- --target app/dashboard
```

After scaffolding:

1. Fill in the JSDoc above the export — at minimum `@status`, `@since`,
   `@tags`, and a Korean one-line description plus `@example`.
2. Add prop-level JSDoc to every property in `<Name>Props`.
3. Implement the component, write any behavioral tests beyond the smoke test.
4. Update the showcase `page.tsx` with realistic examples.

---

## What CI checks

`.github/workflows/ci.yml` runs on every push and PR:

| Job | Command | Purpose |
| --- | --- | --- |
| `lint` | `npx eslint .` | ESLint + jsx-a11y |
| `typecheck` | `npm run typecheck:lib`, `:app`, `:test` | strict TS, three projects |
| `test` | `npm test` | vitest (363+ tests) |
| `build-lib` | `npm run build:lib` | rollup → `dist/` |
| `bundle-check` | `npm run analyze` | bundle size sanity |
| `a11y` | `npm run audit:a11y` | axe-core audit |
| `validate-requirements` | `npm run validate:requirements` | `requirements/` integrity |
| `type-contracts` | `npm run test:types` | `expect-type` contract tests |
| `ai-artifacts-fresh` | regen + diff check | ensure `.ai/MAP.md` and `.ai/props.json` are committed in sync with source |

Run them locally with the equivalent `npm run` command before pushing.

---

## Conventions

- **Naming.** Components are PascalCase in same-named folders
  (`ds/composites/Modal/Modal.tsx`). Hooks are camelCase starting with `use`.
- **Imports inside the lib.** Use relative imports inside `ds/`. Use
  `@/ds/...` from the showcase site (`app/`).
- **Tokens, not literals.** Reach for `ds/tokens/*` instead of hardcoding
  colors / spacing / typography values.
- **Tests live in** `ds/__tests__/<kind>/<Name>.test.tsx`, mirroring src.
- **Don't hand-edit** `.ai/MAP.md`, `.ai/props.json`, `.ai/bundle.json`,
  `.ai/deps.json` — they are generated artifacts.

---

## Commit messages

Use conventional-style prefixes:

- `feat:` new component / capability
- `fix:` bug fix
- `refactor:` no behavior change
- `docs:` documentation only
- `chore:` build / tooling
- `test:` tests only

Example: `feat(composites): add HoverCard with arrow positioning`

---

## Pull requests

Use the PR template (filled in automatically by GitHub). At minimum:

- **What** — one-line summary
- **Why** — link to the matching `requirements/<slug>.md` if applicable
- **Test plan** — checklist of what you verified
- **Screenshots / GIFs** for UI changes (use `npm run capture-screenshots` to
  refresh the visual manifest if you touched components)

PRs that don't pass CI won't be merged. CI runs in parallel and usually
finishes in under 5 minutes.

---

## When something is unclear

- For component behavior: `.ai/props.json` and `.ai/recipes/`
- For project conventions: `AGENTS.md` and this file
- For requirement context: `requirements/README.md`

If you're an AI agent and a requirement file is missing for a feature you've
been asked to build, **ask the user before guessing**.
