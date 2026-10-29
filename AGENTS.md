# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

**Shortlinks / URL2QR client** (`package.json` name: `url2qr-client`): a single-page
React app that shortens URLs, renders a QR code for the short link, shows stats for
an existing short link, and performs client-side redirects when visited at
`/<shortcode>`. It is a frontend only; the API lives in a separate backend
(`api.url2qr.com`). The production domain is `url2qr.com`.

Stack: Create React App (`react-scripts` 4.0.3), React 17, Material-UI v4
(`@material-ui/core`, `@material-ui/icons`), axios, `qrcode`. Plain JavaScript (no
TypeScript), components use `.jsx`.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies. |
| `npm start` | Dev server at http://localhost:3000. |
| `npm run build` | Production build into `build/`. |
| `npm test` | Jest + Testing Library in watch mode (use `CI=true npm test` for a single run). |
| `npm run create-bucket` / `npm run delete-bucket` | Create or remove the S3 bucket named in `.env` (AWS CLI). |
| `npm run deploy` | Clean `build/`, rebuild, upload to S3 and invalidate CloudFront (`deploy-aws-s3-cloudfront`). |
| `npm run redeploy` | Upload the existing `build/` without rebuilding. |

Notes:
- **Node version:** `react-scripts` 4 uses webpack 4, which fails on Node ≥ 17 with
  `ERR_OSSL_EVP_UNSUPPORTED`. Use Node 16, or prefix commands with
  `NODE_OPTIONS=--openssl-legacy-provider`.
- Both `package-lock.json` and `yarn.lock` are committed. The README and scripts use
  npm; keep `package-lock.json` authoritative and avoid mixing package managers.
- There are **no tests** yet (`src/setupTests.js` only loads `jest-dom`). Put new
  tests next to the code as `*.test.js(x)`.
- Linting is CRA's built-in ESLint (`react-app`, `react-app/jest`), surfaced during
  `start`/`build`. There is no separate lint script and no Prettier config.

## Environment setup

```bash
cp env.sample .env
npm install
```

`.env` (git-ignored) is **only used by the AWS npm scripts**, which run
`source .env` (needs a bash-compatible shell for npm scripts):

| Variable | Used by | Meaning |
| --- | --- | --- |
| `BUCKETNAME` | create/delete-bucket, deploy | S3 bucket hosting the build |
| `DIS` | deploy, redeploy | CloudFront distribution ID |
| `AWS_PROFILE` | all AWS scripts | AWS CLI profile |
| `REGION` | create/delete-bucket | AWS region |
| `API_SERVER` | **nothing** | Unused. CRA only exposes `REACT_APP_*` vars to the bundle, and the code reads the API host from `src/data/settings.json`. |

The AWS scripts need the AWS CLI installed and configured. To point the app at a
different API or domain, edit `src/data/settings.json` (see below); the app always
calls the API over `https://`.

Hosting assumption: S3 + CloudFront. Because shortcodes are served as paths
(`https://url2qr.com/abc123`), CloudFront/S3 must route unknown paths (403/404) to
`index.html` so the SPA can handle them.

## Architecture

```
src/
  index.js              # ReactDOM.render(<App/>) + web-vitals
  views/App.js          # Page shell: Header, Converter, Footer (FeatureList commented out)
  components/
    Converter.jsx       # All app logic/state: input, shorten, inspect, redirect, copy
    StyledInput.jsx     # Styled MUI TextField
    Qrcode.jsx          # <canvas id="canvas"> filled by utils/genQR
    Stats.jsx           # Shows link, redirect count, view count for a shortcode
    Header.jsx, Footer.jsx
    FeatureList.jsx, Feature.jsx, Text.jsx   # Currently unused (see gotchas)
  actions/index.js      # API calls: shortenUrl, viewUrl
  utils/
    adapter.js          # axios instance factory; exports `host` and `api` base URLs
    validateUrl.js      # URL regex validation + shortcodeUrl() detection of own links
    genQR.js            # qrcode.toCanvas with brand colours, error correction 'H'
    clipboardCopy.js    # select + document.execCommand('copy')
    highlight.js        # focus/select an element by CSS selector
  data/
    settings.json       # Domain/API hosts and theme constants
    strings.json        # All UI copy
  styles/App.css, index.css, images/earth-nasa.jpeg (background)
public/                 # CRA index.html (includes Google Analytics gtag), manifest, icons
```

### Flow in `Converter.jsx`

1. **Shorten**: user types a URL → `validateUrl` → value is base64-encoded with
   `btoa` → `shortenUrl` → short link `https://<domain>/<shortcode>` is shown with a
   QR code and a click-to-copy field.
2. **Inspect**: if the input is one of our own short links (`shortcodeUrl` matches
   `settings.domain`), the button switches to "Inspect" and `viewUrl` loads stats
   into `<Stats>`.
3. **Redirect**: on load, if `window.location.pathname` is `/<shortcode>`, the app
   renders "Redirecting to…", calls `viewUrl`, and sets `window.location.href` to the
   target link. If the URL has **any query string** (e.g. `/abc123?`), it skips the
   redirect and shows the stats instead.

Button label (`btnText`) doubles as UI state: the button is hidden when it equals
`strings.converter.btnDone`.

### Backend API contract (as consumed by the client)

Base: `https://${settings.api}`

| Call | Request | Expected 200 response |
| --- | --- | --- |
| `shortenUrl(url64)` | `POST /links/{base64(url)}` with body `{}` | `{ "shortcode": "abc123" }` |
| `viewUrl(shortcode)` | `GET /v/{shortcode}` | `{ "Item": { "link": "https://…", "redirects": 3, "viewers": [ … ] } }` |

`Item` follows a DynamoDB `GetItem` shape; a missing/falsey `Item` means unknown
shortcode. The view count shown is `viewers.length`. Any non-200 or thrown error is
passed to the `onError` callback.

## Content schemas

### `src/data/settings.json`

```jsonc
{
  "domain": "url2qr.com",      // short-link host; also used to detect own links
  "api": "api.url2qr.com",     // API host, no scheme (https:// is prepended)
  "white": "#edf6f9",          // input text colour
  "gray": "#b2b9bb",           // input label colour
  "padding": 4,                // base padding/border radius (px) for StyledInput
  "limit": 2048                // max URL length — defined but not enforced anywhere yet
}
```

### `src/data/strings.json`

All user-facing copy. `App.js` destructures the top-level keys and passes them down:

```jsonc
{
  "header":   { "title": "string", "caption": "string" },          // -> <Header {...header}/>
  "footer":   { "link": "url", "creator": "string" },              // -> <Footer {...footer}/>
  "converter": {                                                    // -> <Converter strings={converter}/>
    "inputLabel": "string", "outputLabel": "string", "ph": "string",
    "btnGo": "string", "btnView": "string", "btnDone": "string", "btnError": "string",
    "copyDefault": "string", "copySuccess": "string", "copyFailed": "string"
  },
  "features": [                                                     // -> <FeatureList strings={features}/> (disabled)
    { "name": "string", "description": "string", "link": "url" }
  ]
}
```

When adding UI text, add a key here rather than hard-coding strings in components
(the "Redirecting to..." text in `Converter.jsx` is a current exception).

## Conventions

- Functional components with hooks; MUI `styled()` for component styles, plain CSS
  in `src/styles/App.css` for layout.
- API calls go through `src/actions` using callback-style `onSuccess`/`onError`.
- Config and copy live in JSON under `src/data/`, not in components.
- 2-space indentation, single quotes, semicolons used inconsistently — match the
  surrounding file.

## Known gotchas

- `btoa(url)` can produce `/` and `+`, which land in the request path of
  `POST /links/{url64}`; URL-safe base64 or `encodeURIComponent` would be safer, but
  the backend must agree on the encoding before changing it.
- `Text.jsx` uses `export default Text = …` (assignment to an undeclared variable),
  which throws in strict-mode ES modules. It is only imported by `Feature.jsx`, which
  is only reached via the commented-out `FeatureList` — fix it before re-enabling.
- `FeatureList` renders `Feature` items without a `key` prop.
- `Qrcode` targets a hard-coded `#canvas` id, so only one QR code per page works.
- `clipboardCopy` relies on the deprecated `document.execCommand('copy')`.
- `public/index.html` embeds a Google Analytics tag (`G-FNEFLS6LYS`).
