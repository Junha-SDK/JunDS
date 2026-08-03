<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

## AI Agent Onboarding — read in this order

To get productive in this repo without dozens of `glob`/`grep` calls, read these
files first, in order:

1. **`requirements/README.md`** — index of feature specs. Find the row matching
   the user's request and open that file before touching code. If no matching
   requirement exists, ask the user before guessing.
2. **`.ai/MAP.md`** — auto-generated flat inventory of every file an agent is
   likely to edit (~500 paths in one Read call). Use this instead of walking
   the tree.
3. **`.ai/props.json`** — auto-extracted prop signatures (name / type /
   optional / JSDoc) for every primitive, composite, and pattern. **Every prop
   carries a Korean description** — read this instead of opening source files
   when you only need the public API of a component.
4. **`.ai/recipes/README.md`** — index of composition recipes (Modal+Form,
   DataTable page, Login screen, Dashboard, etc.). When the user asks for an
   app-level pattern, open the matching recipe before writing code from
   scratch.
5. **`.ai/a11y.json`** — last accessibility audit report (axe-core, jsdom).
   Check before editing a component to see existing violations; the report is
   non-blocking but the issues listed are real.
6. **`.ai/bundle.json`** — per-component bundle size (raw + gzip). Consult
   when discussing performance or "is this expensive to add" questions.
7. **`.ai/deps.json`** — internal dependency graph + fan-in/fan-out stats.
   Tells you which primitive a composite leans on and what would break if you
   touch it.
8. **`.ai/screenshots.json`** — visual manifest for showcase routes (PNGs
   under `.ai/screenshots/`, gitignored). Generated on demand by
   `npm run capture-screenshots` against a running dev server.
9. **`.ai/coverage.json`** — vitest line / function / branch coverage summary
   plus the 10 lowest-covered files. Re-run `npm run coverage:report`.
10. **`.ai/css-vars.json`** — CSS custom properties from `app/globals.css`,
    grouped by selector and category. Read before referencing `var(--*)`.
11. **`.ai/layout-map.json`** — 레이아웃 **의도 → 3플랫폼 API** 대응표 (웹 태그 /
    UIKit / SwiftUI) + 세 플랫폼이 공유하는 어휘(브레이크포인트·gap·align·container).
    배치 관련 요청이면 코드를 뒤지기 전에 여기부터 본다. "좁으면 세로로 접기" 같은
    의도로 찾는다 — CSS 속성명이나 UIStackView 용어가 아니라. 표에 적힌 심볼이 실제로
    존재하는지는 `npm run layout-map:check`가 검증하므로 낡은 이름이 남아 있지 않다.
12. **`ds/runtime/schema.ts`** — 노코드 런타임의 `PageDoc`/`ProjectDoc` 스키마
    (valibot). 빌더(Lab)·게시 사이트·AI 패치가 전부 이 JSON 형식 하나를 본다.
    페이지 JSON 을 만들거나 고치는 요청이면 `parsePageDoc`/`parseNodePatch` 로
    검증부터 한다 (MCP `validate_page_doc` / `apply_page_patch` 도 같은 일).
13. **`COMPONENTS.md`** — auto-generated component reference (regenerate
    with `npm run docs:components`). Don't hand-edit.

After these files, you usually do **not** need to glob anything.

## Fast lookup commands

```bash
npm run locate -- <query>                       # rank source files for a concept
npm run locate -- <query> --type requirement    # search requirement specs
npm run locate -- <query> --type composite      # narrow to one kind
npm run map                                     # regenerate .ai/MAP.md after structural changes
npm run extract-props                           # regenerate .ai/props.json from TS sources
npm run scaffold primitive <Name>               # scaffold a new primitive (component + test + page + barrel + search entry)
npm run scaffold composite <Name>               # same for composites
npm run scaffold pattern <Name>                 # same for patterns
npm run scaffold requirement <slug>             # scaffold a requirement file from the template
npm run scaffold recipe <slug> -- --target <dir>  # extract the .ai/recipes/<slug>.md tsx block into <dir>/page.tsx
npm run test:gen                                # auto-generate render-throws-not smoke tests for components missing them
npm run audit:a11y                              # axe-core a11y audit → .ai/a11y.json (non-blocking)
npm run build:report                            # rebuild .ai/bundle.json + .ai/deps.json
npm run capture-screenshots                     # rebuild .ai/screenshots.json (needs `npm run dev` running)
npm run validate:requirements                   # check every requirements/*.md is well-formed
npm run test:types                              # expect-type contract tests for top components
npm run typecheck                               # tsc --noEmit on the whole repo
npm run mcp                                     # run the MCP server standalone (debug)
npm run build:lib                               # bundle the @junds/ui dist (mjs + cjs + d.ts)
./start                                         # dev server (auto-shifts port if 6100 busy)
./start prod                                    # production server
```

### MCP server

`mcp/server.mjs` exposes the project's tooling over the Model Context Protocol
(`locate`, `get_component_props`, `list_recipes`, `read_recipe`,
`list_requirements`, `read_requirement`, `scaffold`, `map_refresh`,
`extract_props`, `validate_page_doc`, `apply_page_patch`). Project-level Claude Code clients pick it up automatically
via `.mcp.json`. See `mcp/README.md` for per-tool input/output shapes.

A pre-commit hook (`.husky/pre-commit`) auto-runs `npm run map` and
`npm run extract-props` whenever staged changes touch `ds/`, showcase
`page.tsx` files, or `requirements/`, so `.ai/MAP.md` and `.ai/props.json`
stay in sync with the working tree without you having to remember.

Recognised `--type` values: `requirement`, `primitive`, `composite`, `hook`,
`token`, `test`, `page`, `data`, `config`, `asset`, `file`.

## Directory map (high level)

```
requirements/        feature specs — single source of truth for intent
.ai/MAP.md           auto-generated inventory of every important file
.ai/props.json       auto-extracted component prop signatures (every prop has a Korean description)
.ai/recipes/         composition templates for common app-level patterns
.ai/a11y.json        accessibility audit report (axe-core, last `npm run audit:a11y`)
.ai/bundle.json      per-component bundle size (raw + gzip)
.ai/deps.json        internal dependency graph + fan-in/fan-out stats
.ai/screenshots.json visual manifest (paths to PNGs; PNGs gitignored)
mcp/                 MCP server exposing tools to Claude Code / Cursor
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

> 💡 For **adding** a new primitive/composite/pattern, prefer
> `npm run scaffold <kind> <Name>` — it creates every file below in the
> correct shape and registers the component in the search dictionary.

| Intent                           | Touch these files                                                                                                                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add a new primitive `Foo`        | `ds/primitives/Foo/Foo.tsx`, `ds/primitives/index.ts`, `ds/index.ts`, `ds/__tests__/primitives/Foo.test.tsx`, `app/design-system/primitives/foo/page.tsx`, `app/design-system/_data/search-dictionary.ts` |
| Add a new composite `Foo`        | same as above but under `ds/composites/Foo/` and `app/design-system/composites/foo/`                                                                                                                      |
| Edit existing component behavior | the matching `ds/<kind>/<Name>/<Name>.tsx` + its test in `ds/__tests__/<kind>/<Name>.test.tsx` + the showcase page if behavior is visible                                                                 |
| Adjust design tokens             | `ds/tokens/<token>.ts` + `app/design-system/tokens/page.tsx` + `app/globals.css` if it bridges to CSS vars                                                                                                |
| Add or change a hook             | `ds/hooks/<name>.ts`, `ds/hooks/index.ts`                                                                                                                                                                 |
| Fix a showcase route             | `app/design-system/<kind>/<slug>/page.tsx` (kind = primitives/composites/patterns)                                                                                                                        |
| Update the public API surface    | `ds/index.ts` (root barrel) and the matching kind barrel                                                                                                                                                  |

## Conventions

- **Naming.** Component files are PascalCase and live in a same-named folder:
  `ds/composites/Modal/Modal.tsx`. Hooks are camelCase starting with `use`.
- **Barrels.** Every `ds/<kind>/` directory has an `index.ts`. The root
  `ds/index.ts` re-exports everything that is part of the public API.
- **Imports inside the lib.** Use relative imports inside `ds/`. Use `@/ds/...`
  from the showcase site (`app/`).
- **Tests.** Tests live in `ds/__tests__/<kind>/<Name>.test.tsx`, mirroring src.
  Most components have an auto-generated render-smoke test; hand-written
  behavioral tests live alongside in the same file. After adding a new
  component without required props, run `npm run test:gen` to add its smoke
  test automatically.
- **Tokens, not literals.** Reach for `ds/tokens/*` instead of hardcoded
  colors/spacing/typography values.

## Maintenance — keep agent context honest

The pre-commit hook regenerates `.ai/MAP.md` and `.ai/props.json` automatically
whenever staged changes touch `ds/`, showcase `page.tsx` files, or
`requirements/`. You normally don't need to run anything manually.

If you bypass the hook (e.g. `git commit --no-verify`) or want to refresh
without committing, run:

```bash
npm run map            # rebuild .ai/MAP.md
npm run extract-props  # rebuild .ai/props.json
```

Both files are committed artifacts — keep them in sync with the source.
