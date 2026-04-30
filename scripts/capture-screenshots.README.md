# capture-screenshots

Captures one PNG per showcase route under `/design-system/<kind>/<slug>` and emits
`.ai/screenshots.json` — a manifest agents can consult for "make it look like X"
visual matching.

## Workflow

```bash
# 1. Start the dev server (separate terminal)
npm run dev

# 2. Install Playwright's Chromium binary (one-time)
npx playwright install chromium

# 3. Capture screenshots
npm run capture-screenshots
```

## Output

- `.ai/screenshots/<kind>--<slug>.png` — screenshot of the first `<Preview>` block
  on each showcase page. PNGs are gitignored (large binaries).
- `.ai/screenshots.json` — committed manifest with this shape:

```json
{
  "generatedAt": "2026-04-29T00:00:00.000Z",
  "viewport": { "width": 1280, "height": 720 },
  "baseUrl": "http://localhost:6100",
  "selector": "[data-preview]",
  "screenshots": [
    {
      "kind": "primitive",
      "slug": "button",
      "name": "Button",
      "route": "/design-system/primitives/button",
      "image": ".ai/screenshots/primitive--button.png",
      "width": 800,
      "height": 220
    }
  ],
  "errors": [{ "route": "/design-system/...", "reason": "..." }]
}
```

## Selector strategy

The script targets `[data-preview]`, an attribute set on the root `<Box>` of
`app/design-system/_components/Preview.tsx`. If that is missing on an older
checkout, the script falls back to the first `div[class*="border"][class*="radius"]`.

## Graceful degradation

The script exits with code `0` (does not crash CI / parent agents) when:

- the dev server is not reachable at `http://localhost:6100`
- Chromium browser binary is not installed (`Executable doesn't exist`)
- `@playwright/test` is missing
- a single route fails — it is logged into `errors[]` and the run continues

## Configuration

- `JUNDS_DEV_URL` — override the base URL (default `http://localhost:6100`).

## Idempotence

Re-running the script overwrites previous PNGs and the manifest. Safe to run on
every visual change.
