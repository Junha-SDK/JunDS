# Requirements Index

This directory is the **single source of truth** for product / feature requirements.
AI agents (Claude, etc.) must read this index **before** starting any task that
touches a feature listed below — code may have drifted, this file has not.

## How this directory works

- One file per feature: `requirements/<slug>.md` (kebab-case, e.g. `dark-mode.md`).
- Use `_template.md` as the starting point for new entries.
- The table below is the lookup index. Keep it sorted by slug.
- Mark status as `draft`, `active`, `shipped`, or `archived`.

## Active & shipped

| Slug | Status | One-line summary |
| ---- | ------ | ---------------- |
| _(none yet — add a row when you create a requirement file)_ | | |

## Quick lookup for agents

```bash
# Find a requirement file by keyword:
npm run locate -- <keyword> --type requirement

# List every requirement file:
ls requirements/*.md
```

## Workflow

1. **Before coding**, open the matching requirement file and read it end-to-end.
2. If the requirement is missing or unclear, **ask the user** before guessing.
3. When a feature ships or scope changes, **update the requirement file in the
   same PR** as the code change — do not let it rot.
