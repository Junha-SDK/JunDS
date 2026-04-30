# JunDS MCP Server

A small [Model Context Protocol](https://modelcontextprotocol.io) server that
exposes the project's existing scripts (under `scripts/`) and metadata
artifacts (under `.ai/`, `requirements/`) as MCP tools, so MCP-aware clients
(Claude Code, Cursor, etc.) can call them directly without going through the
shell.

The server is **additive** — it does not modify or replace any existing
scripts. Each tool either shells out to an `npm run` script or reads a file
the project already produces.

## Run

```bash
node mcp/server.mjs
# or
npm run mcp
```

The server speaks JSON-RPC over stdio. Claude Code project-level discovery
picks it up via `/.mcp.json` at the repo root automatically.

## Tools

All tools return JSON in the `text` content field of the MCP result. Errors
come back with `isError: true` plus an `error` summary, the script's exit
code, and captured stderr / stdout.

### `locate`

Rank source files by relevance to a free-form query. Wraps
`npm run locate -- <query> [--type <type>] --json`.

| arg | type | required | notes |
| --- | --- | --- | --- |
| `query` | string | yes | Free-form, e.g. `"button variants"` |
| `type` | enum | no | `requirement` / `primitive` / `composite` / `hook` / `token` / `test` / `page` / `data` / `config` / `asset` / `file` |

Example:

```json
{ "query": "modal focus trap", "type": "composite" }
```

### `map_refresh`

Regenerate `.ai/MAP.md`. Run after structural changes (adding / renaming /
moving files under `ds/`, `app/`, `requirements/`).

No args. Returns `{ ok, message, path, stdout }`.

### `extract_props`

Regenerate `.ai/props.json` (TypeScript-derived prop tables for every
component). Returns `{ ok, message, path }`.

### `get_component_props`

Look up one component's props inline from `.ai/props.json` (no shell-out).
Case-insensitive name match.

```json
{ "name": "Button" }
```

Returns the matching `{ name, kind, file, interface, props: [...] }` entry,
or an error listing available names if not found.

### `list_recipes`

List every `.ai/recipes/*.md` file. Returns `{ slug, title, path }` for each.
Returns an empty list (with a `note`) if the directory does not exist yet.

### `read_recipe`

Return the full markdown body of `.ai/recipes/<slug>.md`.

```json
{ "slug": "stat-card" }
```

### `scaffold`

Wraps `npm run scaffold <kind> <name> [--keywords ...]`. Creates a new
component (primitive / composite / pattern) or a new requirement file plus
all the matching barrels, tests, and showcase pages.

| arg | type | required | notes |
| --- | --- | --- | --- |
| `kind` | enum | yes | `primitive` / `composite` / `pattern` / `requirement` |
| `name` | string | yes | PascalCase for components, kebab-case for requirements |
| `keywords` | string | no | Comma-separated, e.g. `"modal,dialog,overlay"` |

Example:

```json
{ "kind": "composite", "name": "Drawer", "keywords": "drawer,sidebar,sheet" }
```

### `list_requirements`

List every spec under `requirements/*.md`. Skips `_template.md` and
`README.md`. Returns `{ slug, title, status, path }` for each.

### `read_requirement`

Return the full markdown body of `requirements/<slug>.md`, plus parsed
`title`, `status`, and `owner`.

```json
{ "slug": "theming" }
```

### `list_hooks`

List every hook re-exported from `ds/hooks/index.ts`. The description for
each hook is pulled from the leading JSDoc comment in
`ds/hooks/<name>.ts` (first non-tag line).

No args. Returns:

```json
{
  "ok": true,
  "count": 30,
  "hooks": [
    { "name": "useBreakpoint", "description": "현재 브레이크포인트 감지 훅" },
    { "name": "useDebounce", "description": "디바운스 훅 — 값 변경을 지연시킵니다" }
  ]
}
```

### `get_a11y`

Read `.ai/a11y.json` (axe-core results). With `name`, returns just that
component's violations. Without, returns the run summary plus only the
components that have at least one violation.

| arg | type | required | notes |
| --- | --- | --- | --- |
| `name` | string | no | PascalCase component name |

Example:

```json
{ "name": "Button" }
```

Returns `{ ok, name, kind, violations, error }` for the named form, or
`{ ok, generatedAt, tooling, summary, componentsWithViolations }` for the
summary form. Errors with `ok: false` if `.ai/a11y.json` is missing.

### `get_bundle_info`

Read `.ai/bundle.json`. With `name`, returns that component's
`{ rawBytes, gzipBytes }`. Without, returns the top 10 components by gzip
size plus the per-kind / overall totals.

| arg | type | required | notes |
| --- | --- | --- | --- |
| `name` | string | no | PascalCase component name |

Example:

```json
{ "name": "DataTable" }
```

Returns `{ ok, name, kind, file, rawBytes, gzipBytes }` or
`{ ok, generatedAt, mode, totals, top10ByGzip }`.

### `get_deps_for`

Look up one component's `{ kind, file, imports, importedBy }` entry from
`.ai/deps.json`.

| arg | type | required | notes |
| --- | --- | --- | --- |
| `name` | string | yes | PascalCase component name |

```json
{ "name": "Button" }
```

### `get_screenshot_info`

Read `.ai/screenshots.json`. With `name`, returns that component's
screenshot entry. Without, returns the full manifest summary
(`generatedAt`, `summary`, `count`, `components`).

| arg | type | required | notes |
| --- | --- | --- | --- |
| `name` | string | no | PascalCase component name |

```json
{ "name": "Modal" }
```

Errors with `ok: false` if `.ai/screenshots.json` is missing.

## Safety / shell-injection prevention

- Every external command is invoked with `child_process.spawn(cmd, args, { shell: false })`. There is **no** path through `exec` or a shell string.
- Component / requirement names are validated against tight regexes
  (`^[A-Za-z][A-Za-z0-9]*$` / `^[a-z0-9]+(-[a-z0-9]+)*$`) before being passed
  as argv.
- Slugs are also checked against `path.startsWith(parentDir + sep)` after
  joining, so `../`-style traversal cannot escape `.ai/recipes/` or
  `requirements/`.
- The `keywords` arg is restricted to `[A-Za-z0-9 ,_-]` and the `locate`
  query rejects shell-significant characters as a courtesy (although the
  spawn-array form already makes this unnecessary).

## Adding a new tool

1. Add a `toolFoo` async function in `mcp/server.mjs` that returns
   `successResult(...)` or `errorResult(...)`.
2. Register it with `server.registerTool("foo", { title, description, inputSchema }, toolFoo)`.
3. Document the new tool in this README.
