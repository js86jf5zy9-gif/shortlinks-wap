#!/usr/bin/env bash
# Upload dist/ to S3 and invalidate CloudFront.
# The HTML shell, service worker and manifest must never be cached by the CDN or
# browser, otherwise clients keep checking against a stale sw.js and never see
# an update. Hashed assets under assets/ are safe to cache forever.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env; set +a

AWS_PROFILE="$AWS_PROFILE" npx deploy-aws-s3-cloudfront \
  --source ./dist/ \
  --bucket "$BUCKETNAME" \
  --distribution "$DIS" \
  --exclude .DS_Store \
  --cache-control \
    'index.html:no-cache' \
    'sw.js:no-cache' \
    'registerSW.js:no-cache' \
    'manifest.webmanifest:no-cache' \
    'assets/**:public, max-age=31536000, immutable' \
    'workbox-*.js:public, max-age=31536000, immutable' \
  --non-interactive
