# create-junds

Bootstrap a new Next.js app preconfigured with [`@junds/ui`](https://www.npmjs.com/package/@junds/ui).

## Use

```bash
# create in the current directory
npx create-junds my-app

# create at an explicit parent path
npx create-junds my-app --target ~/projects

# overwrite a non-empty target
npx create-junds my-app --force
```

After it finishes:

```bash
cd my-app
npm install
npm run dev
```

## Options

| Flag                | Default   | Description                                              |
| ------------------- | --------- | -------------------------------------------------------- |
| `<name>`            | —         | Project name (also the directory name). Required.        |
| `--target <path>`   | `cwd`     | Parent directory in which the project folder is created. |
| `--template <name>` | `default` | Template identifier under `templates/`.                  |
| `--force`           | `false`   | Overwrite a non-empty target directory.                  |
| `-h`, `--help`      | —         | Print usage.                                             |

## What you get

- Next.js 16 (App Router, Turbopack default)
- Tailwind v4 (`@tailwindcss/postcss`)
- `@junds/ui` wired through a client-side `<Providers>` component (`JunDSProvider` reads `NEXT_PUBLIC_JUNDS_LICENSE_KEY`)
- TypeScript strict mode, ESLint with `next` defaults
- A sample `app/page.tsx` rendering JunDS `<Button>`s

## Templates

Templates live in `templates/<name>/`. Files are copied verbatim with two
substitutions:

| Token      | Replaced with                                        |
| ---------- | ---------------------------------------------------- |
| `{{NAME}}` | The project name passed on the CLI                   |
| `{{DIR}}`  | The leaf directory name (drops `@scope/` if present) |

Filename rules:

- `_gitignore` is renamed to `.gitignore` (npm strips real `.gitignore` files when packaging).
- Binary files are copied as-is; text files are rendered through the substitution map.

To add a template, drop it into `templates/<your-name>/` and pass `--template <your-name>`.

## Publishing this package

This package is independent of the JunDS monorepo's internal scripts. To
release it:

```bash
cd create-junds
npm version patch     # or minor/major
npm publish --access public
```

The package's `bin` is `bin/index.mjs`; no build step is needed.

> **Heads up.** `@junds/ui` itself ships from this monorepo's root
> (`package.json` at the project root). Until that root package is published
> publicly (it currently has `"private": true`), the generated app's
> `npm install` step will fail to fetch `@junds/ui`. Either:
>
> 1. Publish `@junds/ui` first (`cd .. && npm publish` after flipping
>    `private` off and running `npm run build:lib`), or
> 2. Edit `templates/default/package.json` to point `@junds/ui` at a git
>    URL or local `file:` path so the starter resolves locally.
