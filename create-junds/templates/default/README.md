# {{NAME}}

Next.js app powered by [`@junds/ui`](https://www.npmjs.com/package/@junds/ui).

## Develop

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_JUNDS_LICENSE_KEY
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack). |
| `npm run build` | Production build. |
| `npm run start` | Run the production build. |
| `npm run lint` | ESLint with `next` defaults. |
| `npm run typecheck` | `tsc --noEmit` over the whole repo. |

## Where things live

- `app/layout.tsx` — Root layout. Wraps the tree in `<Providers>`.
- `app/providers.tsx` — Client-side wrapper that mounts `<JunDSProvider>`.
- `app/page.tsx` — Home page. Edit this first.
- `app/globals.css` — Tailwind + JunDS stylesheet imports.

## Components

```tsx
import { Button, Stack, JunDSProvider } from "@junds/ui";
```

See the [JunDS component reference](https://github.com/) for the full surface.
