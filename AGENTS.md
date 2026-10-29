# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

**url2qr client** (`package.json` name: `url2qr-client`): a single-page React app
that shortens URLs, renders a downloadable QR code for the short link, shows stats
for an existing short link, and performs client-side redirects when visited at
`/<shortcode>`. It is a frontend only; the API is a separate backend
(`https://api.url2qr.com`). The production domain is `url2qr.com`.

Stack: Vite 8, React 19, MUI 9 (`@mui/material`, Emotion), `qrcode`,
`vite-plugin-pwa` (Workbox service worker), Vitest + Testing Library, ESLint 10
(flat config). Plain JavaScript, components are `.jsx`. Requires Node ≥ 20.19.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (npm only; `package-lock.json` is authoritative). |
| `npm run dev` (or `npm start`) | Vite dev server at http://localhost:5173. The service worker is **not** active in dev. |
| `npm run build` | Production build into `dist/` (includes `sw.js` and `manifest.webmanifest`). |
| `npm run preview` | Serve `dist/` at http://localhost:4173. Use this to test the service worker. |
| `npm test` | Run the Vitest suite once (jsdom). `npm run test:watch` for watch mode. |
| `npm run lint` | ESLint over the repo. |
| `npm run deploy` | Build, then `npm run redeploy`. |
| `npm run redeploy` | `scripts/deploy.sh`: upload `dist/` to S3 with correct Cache-Control and invalidate CloudFront. |
| `npm run create-bucket` / `delete-bucket` | Create/remove the S3 bucket named in `.env` (AWS CLI). |

CI (`.github/workflows/ci.yml`) runs `npm ci`, lint, test and build on pushes to
`main`/`master` and on PRs. Before pushing, run `npm run lint && npm test && npm run build`.

## Environment setup

```bash
cp env.sample .env
npm install
```

`.env` and `.env.*` are git-ignored. Vite reads `VITE_*` variables at build time;
the deploy scripts `source .env` for the AWS variables.

| Variable | Used by | Meaning |
| --- | --- | --- |
| `VITE_GA_MEASUREMENT_ID` | `src/lib/analytics.js` | GA4 ID (`G-…`). Empty/unset = no analytics. Only loaded in production builds and when Do Not Track is off. |
| `VITE_API_URL` | `src/config.js` | Optional API base URL override (e.g. `http://localhost:5005`). Default: `settings.json` → `api`. |
| `VITE_SHORT_DOMAIN` | `src/config.js` | Optional short-link domain override. Default: `settings.json` → `domain`. |
| `BUCKETNAME`, `DIS`, `AWS_PROFILE`, `REGION` | AWS scripts | S3 bucket, CloudFront distribution ID, AWS CLI profile, region. |

**Analytics ID handling:** keep the real `VITE_GA_MEASUREMENT_ID` only in `.env` or
a CI secret (`secrets.VITE_GA_MEASUREMENT_ID`), never in committed files. Note that
any `VITE_*` value is compiled into the public JS bundle, so the ID is hidden from
the repo, not from site visitors. That is inherent to client-side analytics. The
old ID still exists in git history from before this change.

Hosting: S3 + CloudFront. Shortcodes are served as paths (`/abc123`), so CloudFront
must route 403/404 to `/index.html` (status 200). Once the service worker is
installed it serves the cached shell for those paths itself.

## Architecture

```
index.html                 # Vite entry HTML (no inline analytics)
vite.config.js             # React + PWA plugins, Vitest config
scripts/deploy.sh          # S3/CloudFront upload with cache headers
src/
  main.jsx                 # createRoot, ThemeProvider/CssBaseline, initAnalytics()
  App.jsx                  # Picks <Redirect> (path is a shortcode) or <Converter> + HowItWorks
  theme.js                 # MUI dark theme (palette, glass Paper, button sizes)
  config.js                # Merges settings.json with VITE_* env overrides
  components/
    SpaceBackground.jsx/.css  # Fixed parallax sky: nebula, 3 star layers, moon, Earth photo
    Converter.jsx          # Input form: shorten a URL or inspect one of our short links
    ShortLinkResult.jsx    # Short link field, copy button, QR code
    QrCode.jsx             # <canvas> QR via lib/qr + PNG download
    Stats.jsx              # Destination, redirect count, unique viewers
    Redirect.jsx           # /<shortcode> handling (redirect or preview)
    UpdatePrompt.jsx       # "New version available → Reload" snackbar
    Header.jsx, HowItWorks.jsx, Footer.jsx
  hooks/useParallax.js     # Scroll-driven transforms for [data-parallax-rate] layers
  lib/
    api.js                 # fetch-based API client (shortenUrl, fetchLink, ApiError)
    base64url.js           # UTF-8 safe base64url encode/decode
    urls.js                # normalizeUrl, shortcodeFromInput/Path, safeRedirectTarget
    swUpdates.js           # watchForUpdates (periodic/visibility checks), applyUpdate
    analytics.js           # Env-driven GA4 loader
    starfield.js           # Seeded SVG star tiles + layer definitions
    qr.js, clipboard.js
  data/settings.json, data/strings.json
  assets/earth.webp        # Night-side Earth photo (resized from the original NASA image)
  assets/moon.webp         # Full-moon photo (Unsplash), cropped to a circle with transparent edges
  test/setup.js, test/pwaRegisterStub.js
```

### App flow

- **Shorten:** input → `normalizeUrl` (adds `https://` when missing, http(s) only,
  ≤ `maxUrlLength`) → `shortenUrl` → `ShortLinkResult` with copy and QR download.
- **Inspect:** if the input is one of our own short links (`shortcodeFromInput`
  matches `domain` or `www.domain` and a single `[A-Za-z0-9_-]` segment), the
  button becomes "Inspect" and `fetchLink` loads `<Stats>`.
- **Redirect:** `App` reads `window.location.pathname`; a shortcode path renders
  `<Redirect>`, which calls `fetchLink` and `window.location.replace`s to the
  target. **Any query string** (e.g. `/abc123?stats`) shows a preview with stats
  and a "Continue" button instead. Only http(s) targets are followed
  (`safeRedirectTarget`); legacy links stored without a scheme get `https://`.

### Parallax background

`SpaceBackground` is `position: fixed` behind the content. Each layer has
`data-parallax-rate` (fraction of `scrollY` it moves up). Optional
`data-parallax-tile` wraps the offset for seamless repeating star tiles, and
`data-parallax-max-vh` caps the travel (Earth stops at 55vh). `useParallax` writes
`translate3d` once per animation frame and holds the layers still under
`prefers-reduced-motion`. Rates, back to front: nebula 0.03, stars 0.06 / 0.14 /
0.26, moon 0.38, Earth 0.55. To add a layer, add an element with these data
attributes inside `.space`.

### Service worker updates

`vite-plugin-pwa` in `registerType: 'prompt'` mode precaches the build and serves
`index.html` for navigations. Updates are made reliable by:

1. `watchForUpdates` (`src/lib/swUpdates.js`) calls `registration.update()`
   hourly and whenever the tab becomes visible. It first fetches `sw.js` with
   `cache: 'no-store'` and skips the check while offline or already installing.
2. `UpdatePrompt` shows a snackbar when a new worker is waiting. **Reload** calls
   `applyUpdate`, which sends SKIP_WAITING and reloads on `controllerchange`, with
   a timeout fallback. vite-plugin-pwa's own reload doesn't fire for updates
   found by manual `update()` calls, so don't replace this with a bare
   `updateServiceWorker(true)`.
3. `scripts/deploy.sh` uploads `index.html`, `sw.js`, `registerSW.js` and
   `manifest.webmanifest` with `Cache-Control: no-cache`, and hashed
   `assets/**` / `workbox-*.js` as immutable. Deploy with this script so CDN
   caching can't hide a release.
4. `cleanupOutdatedCaches` removes old precaches after activation.

To test locally: `npm run build && npm run preview`, load the page, rebuild with a
visible change, then switch tabs away and back. The prompt should appear.

### Backend API contract (as consumed by the client)

Base: `config.apiUrl` (default `https://api.url2qr.com`).

| Call | Request | Expected 200 response |
| --- | --- | --- |
| `shortenUrl(url)` | `POST /links/{base64url(url)}`, body `{}` | `{ "shortcode": "abc123" }` |
| `fetchLink(shortcode)` | `GET /v/{shortcode}` | `{ "Item": { "link": "https://…", "redirects": 3, "viewers": [ … ] } }` |

`Item` follows DynamoDB `GetItem` shape; a missing `Item` means unknown shortcode.
Non-2xx responses throw `ApiError` (with `.status`).

**URL encoding:** the URL is UTF-8 encoded, then base64url-encoded (RFC 4648 §5:
`-`/`_` instead of `+`/`/`, padding kept). Standard base64 could contain `/`, which
split the path segment and broke those links. The backend must decode with a
base64url-aware decoder. Node's `Buffer.from(s, 'base64')` accepts both alphabets
as-is. Python needs `base64.urlsafe_b64decode`, not `b64decode`, which silently
drops `-`/`_`.

## Content schemas

### `src/data/settings.json`

```jsonc
{
  "domain": "url2qr.com",            // short-link host; also used to detect our own links
  "api": "https://api.url2qr.com",   // API base URL (with scheme, no trailing slash)
  "maxUrlLength": 2048               // max accepted input length, enforced by normalizeUrl
}
```

Env overrides: `VITE_SHORT_DOMAIN` → `domain`, `VITE_API_URL` → `api`. Theme
colours live in `src/theme.js`, not here.

### `src/data/strings.json`

All user-facing copy. Components import it directly. `{max}` in `tooLong` is
substituted with `maxUrlLength`.

```jsonc
{
  "header":    { "title": "string", "caption": "string" },
  "converter": {
    "inputLabel": "string", "inputHelp": "string", "invalid": "string", "tooLong": "string with {max}",
    "btnGo": "string", "btnView": "string", "btnReset": "string",
    "outputLabel": "string", "copy": "string", "copied": "string", "copyFailed": "string",
    "download": "string", "serverError": "string", "unknown": "string"
  },
  "stats":     { "title": "string", "link": "string", "redirects": "string", "views": "string" },
  "redirect":  {
    "redirecting": "string", "preview": "string", "continue": "string",
    "unknown": "string", "unsafe": "string", "error": "string", "home": "string"
  },
  "stepsTitle": "string",
  "steps":     [ { "title": "string", "body": "string" } ],   // HowItWorks cards; icons by index
  "update":    { "available": "string", "reload": "string" },
  "footer":    { "link": "url", "creator": "string" }
}
```

Tests look up UI elements by these strings (e.g. button names "Shorten",
"Inspect", "Copy", "Reload"). Update the tests when you change them.

## Testing

- Tests live next to the code as `*.test.js(x)`. Vitest globals are enabled.
  `src/test/setup.js` loads jest-dom, cleans up and restores mocks after each test,
  and polyfills `matchMedia`.
- Mock the network by spying on `lib/api` functions (components) or
  `globalThis.fetch` (`api.test.js`).
- `lib/qr` must be mocked in component tests because jsdom has no canvas.
- `virtual:pwa-register/react` is aliased to `src/test/pwaRegisterStub.js` under
  Vitest. Override it with `vi.mock` where needed.

## Conventions

- Functional components with hooks. Style with MUI `sx`/theme. Plain CSS only for
  the background (`SpaceBackground.css`).
- Logic that can be tested without React goes in `src/lib`. Inject `window`-like
  dependencies (see `swUpdates`, `analytics`, `Redirect`'s `navigate`) so tests
  don't need global mocks.
- Copy goes in `strings.json`, config in `settings.json`/env. No hard-coded user-facing text.
- 2-space indentation, single quotes, semicolons.
