# ADR 0012: QR Code for Teacher Attendance Confirmation

## Status

Accepted

## Context

SIMPATIK previously used camera selfies + GPS geolocation for teacher attendance
verification (ADR 0011). The flow has changed: teachers now confirm attendance
once per day by scanning a QR code displayed on a school screen (TV/projector),
rather than taking a photo per class session.

The old mechanism required:
- `navigator.mediaDevices.getUserMedia()` for selfie capture
- `navigator.geolocation.getCurrentPosition()` for GPS coordinates
- Server-side photo storage and haversine distance calculation
- Per-schedule confirmation (multiple times per day)

The new mechanism requires:
- A rotating QR code displayed on a school screen
- Teachers scan the QR code once per day to confirm attendance
- No photo, no geolocation
- Server-side QR code generation

## Decision

Use the `qrcode` npm package for server-side QR code generation. The QR code
encodes a time-based token that rotates every N minutes (configurable by admin,
default 5 minutes). The token contains a date, expiry timestamp, and HMAC
signature to prevent forgery.

The QR display page (`/qr-display`) renders a large QR code suitable for
TV/projector display. The admin settings page (`/qr-settings`) allows
configuration of the refresh interval.

The `teacher_confirmations` table is updated to support the new flow:
- `schedule_id` becomes nullable (no longer per-schedule)
- `photo_url`, `latitude`, `longitude`, `distance_meters`,
  `is_inside_school` become nullable (no longer collected)
- A new `confirmation_date` column stores the start-of-day timestamp for
  the confirmed day, enforcing one-confirmation-per-day per teacher

The `school_locations` table is repurposed as a general school profile:
- `address` column added for general purposes (reports, display)
- `latitude`, `longitude`, `radius_meters` become nullable (no longer
  needed for geofencing)

A new `app_settings` key-value table stores the QR refresh interval and
other future application settings.

## Consequences

- **Positive:** Simpler teacher flow — scan once per day instead of photo +
  GPS per session.
- **Positive:** No personal photo data stored — privacy improvement.
- **Positive:** No dependency on browser geolocation accuracy.
- **Positive:** `qrcode` is a well-established package (12+ years on npm)
  with TypeScript types, works server-side, no external API calls.
- **Negative:** QR code can be photographed and shared — the rotating token
  (every N minutes) mitigates this but does not eliminate it.
- **Negative:** Requires a dedicated screen at the school for QR display.
- **Negative:** Old confirmation data (photo, GPS) remains in the database
  but is no longer displayed or collected.

## Related

- `app/services/QrCode.ts`
- `app/handlers/qrSettings.ts`
- `app/queries/appSettings.ts`
- `resources/Pages/qrSettings.svelte`
- `resources/Pages/qrDisplay.svelte`
- Supersedes ADR 0011 (camera + geolocation anti-fraud)
