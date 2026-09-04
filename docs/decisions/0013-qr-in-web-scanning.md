# ADR 0013: In-Web QR Scanning with html5-qrcode

## Status

Accepted

## Context

Teacher attendance confirmation needs QR scanning directly inside the web app
(no external camera app). The first implementation decoded frames manually
(native `BarcodeDetector` + `jsqr` fallback) and managed the camera lifecycle
by hand. Two problems surfaced:

1. The Svelte 5 `$effect` tracked `$state` flags read inside the async camera
   starter, so every state change re-ran the effect and its cleanup stopped
   the freshly opened stream — the camera never stayed on.
2. Hand-rolled camera handling (facing mode, permission errors, file decode)
   duplicates edge cases a maintained library already covers. The sibling
   project dani-ejournal scans QR reliably with `html5-qrcode`.

## Decision

Use the `html5-qrcode` npm package for in-browser QR scanning
(`resources/Components/QrScanner.svelte`):

- `Html5Qrcode.start({ facingMode: 'environment' }, { fps: 10, qrbox })`
  for live scanning, `scanFile()` for the upload fallback.
- Dynamic `import('html5-qrcode')` so the decoder chunk loads only when the
  scanner mounts, not on every page.
- Camera guard flags are plain (non-reactive) variables so `$effect` tracks
  only the static `autoStart` prop and never loops start/stop.
- Decoded text is parsed by the existing `extractQrTokenFromScan()` helper
  (URL `qr_token` param or raw JSON payload).

`jsqr` was removed — no longer used.

## Consequences

- **Positive:** Same scanning behavior as the proven sibling implementation;
  less custom camera code to maintain.
- **Positive:** No new server contract — decode output feeds the existing
  QR-token verification, geofence, and one-per-day rules.
- **Negative:** Extra client dependency (~100 KB, lazy-loaded only on
  scanner pages).
- **Limitation (unchanged):** Camera still needs a secure context
  (HTTPS/`localhost`) and the `Permissions-Policy: camera=(self)` header;
  the component shows an explicit message otherwise.

## Related

- `resources/Components/QrScanner.svelte`
- `resources/lib/qr.ts`
- `app/middlewares/securityHeaders.ts`
- ADR 0012 (QR code attendance)
