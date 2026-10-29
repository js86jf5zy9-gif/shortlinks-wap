# url2qr

A React web app for shortening links, sharing them as QR codes and tracking
clicks. It runs as an installable PWA with a parallax space background.

## Requirements
- Node.js 20.19+ and npm

## Setup

```bash
cp env.sample .env
npm install
```

Fill in `.env`. `VITE_GA_MEASUREMENT_ID` is optional (leave empty to disable
analytics). The AWS variables are only needed for deployment.

## Develop

```bash
npm run dev
```

## Test and lint

```bash
npm test
npm run lint
```

## Deploy

The site is hosted on S3 behind CloudFront. CloudFront must return
`/index.html` for 403/404 so short-link paths reach the app.

```bash
npm run deploy
```

See [AGENTS.md](AGENTS.md) for architecture, the API contract and content schemas.

## License
[MIT](https://choosealicense.com/licenses/mit/)
