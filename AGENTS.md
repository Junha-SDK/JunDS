<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## AI Agent Onboarding — read in this order

To get productive in this repo without dozens of `glob`/`grep` calls, read these
three files first, in order:

1. **`requirements/README.md`** — index of feature specs. Find the row matching
   the user's request and open that file before touching code. If no matching
   requirement exists, ask the user before guessing.
2. **`.ai/MAP.md`** — auto-generated flat inventory of every file an agent is
   likely to edit (~500 paths in one Read call). Use this instead of walking
   the tree.
3. **`COMPONENTS.md`** — public component API reference (props, variants,
   import paths). Use this when consuming components, not when finding files.

After these three files, you usually do **not** need to glob anything.

## Fast lookup commands

```bash
npm run locate -- <query>                       # rank source files for a concept
npm run locate -- <query> --type requirement    # search requirement specs
npm run locate -- <query> --type composite      # narrow to one kind
npm run map                                     # regenerate .ai/MAP.md after structural changes
./start                                         # dev server (auto-shifts port if 6100 busy)
./start prod                                    # production server
```

Recognised `--type` values: `requirement`, `primitive`, `composite`, `hook`,
`token`, `test`, `page`, `data`, `config`, `asset`, `file`.

## Directory map (high level)

```
requirements/        feature specs — single source of truth for intent
.ai/MAP.md           auto-generated inventory of every important file
ds/                  the design system library (published as @junds/ui)
  primitives/        atomic building blocks (Button, Input, Badge, …)
  composites/        composed widgets (Modal, Tabs, Toast, Select, …)
  patterns/          larger app-level patterns (DataTable, ChartCard, …)
  layout/            layout primitives (Stack, Grid, Container, Spacer)
  hooks/             shared React hooks
  tokens/            design tokens (colors, spacing, typography, …)
  providers/         context providers (Theme, Toast, …)
  utils/             tiny helpers (cn, …)
  __tests__/         vitest tests, mirroring the src structure
app/design-system/   the showcase site
  primitives/<x>/page.tsx     showcase page per primitive
  composites/<x>/page.tsx     showcase page per composite
  _components/                shared showcase scaffolding
  _data/                      showcase data (search dictionary, live demos)
scripts/             build-map, locate, run-server, etc.
```

## Task recipes — common intents → which files to touch

| Intent | Touch these files |
| --- | --- |
| Add a new primitive `Foo` | `ds/primitives/Foo/Foo.tsx`, `ds/primitives/index.ts`, `ds/index.ts`, `ds/__tests__/primitives/Foo.test.tsx`, `app/design-system/primitives/foo/page.tsx`, `app/design-system/_data/search-dictionary.ts` |
| Add a new composite `Foo` | same as above but under `ds/composites/Foo/` and `app/design-system/composites/foo/` |
| Edit existing component behavior | the matching `ds/<kind>/<Name>/<Name>.tsx` + its test in `ds/__tests__/<kind>/<Name>.test.tsx` + the showcase page if behavior is visible |
| Adjust design tokens | `ds/tokens/<token>.ts` + `app/design-system/tokens/page.tsx` + `app/globals.css` if it bridges to CSS vars |
| Add or change a hook | `ds/hooks/<name>.ts`, `ds/hooks/index.ts` |
| Fix a showcase route | `app/design-system/<kind>/<slug>/page.tsx` (kind = primitives/composites/patterns) |
| Update the public API surface | `ds/index.ts` (root barrel) and the matching kind barrel |

## Conventions

- **Naming.** Component files are PascalCase and live in a same-named folder:
  `ds/composites/Modal/Modal.tsx`. Hooks are camelCase starting with `use`.
- **Barrels.** Every `ds/<kind>/` directory has an `index.ts`. The root
  `ds/index.ts` re-exports everything that is part of the public API.
- **Imports inside the lib.** Use relative imports inside `ds/`. Use `@/ds/...`
  from the showcase site (`app/`).
- **Tests.** Tests live in `ds/__tests__/<kind>/<Name>.test.tsx`, mirroring src.
- **Tokens, not literals.** Reach for `ds/tokens/*` instead of hardcoded
  colors/spacing/typography values.

## Maintenance — keep agent context honest

After any of these, regenerate the map so future agents stay accurate:

- adding, deleting, or renaming a file under `ds/`, `app/`, or `requirements/`
- moving a component between primitive ↔ composite ↔ pattern

```bash
npm run map
```

Commit `.ai/MAP.md` along with the structural change.
