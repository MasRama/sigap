# ADR 0011: Camera + Geolocation for Anti-Fraud Teacher Confirmation

## Status

Accepted

## Context

SIGAP must ensure that teacher attendance and journal records are tied to a real person at a real place. Manual attendance is easy to fake: a teacher can mark themselves present from anywhere, or another person can record attendance on their behalf.

We needed a verification mechanism that:
- Does not require specialized hardware.
- Works on any teacher's phone or laptop.
- Records evidence that can be audited later.
- Does not block submission if the teacher is slightly outside the school radius, but clearly flags the case for headmaster review.

## Decision

Use the browser's `navigator.mediaDevices.getUserMedia()` to capture a live selfie and `navigator.geolocation.getCurrentPosition()` to capture coordinates. The selfie is converted to a base64 data URL on the client, then submitted as a JSON payload to `/teacher/confirmations`. The backend validates the coordinates, computes the haversine distance to the active `school_locations` record, saves the photo to local storage, and stores `distance_meters` and `is_inside_school` on the `teacher_confirmations` table.

A journal can only be created after a confirmation exists for the same schedule on the same day.

## Consequences

- **Positive:** Strong evidence chain: photo, GPS coordinates, timestamp, and distance to the school are all stored per confirmation.
- **Positive:** Teachers can still confirm outside the school radius (e.g., during an excursion or emergency); the system records the fact instead of blocking it.
- **Positive:** No extra hardware or native app is required; the flow runs in the browser.
- **Negative:** Browser geolocation accuracy depends on the device and can be spoofed; the headmaster report remains the human oversight layer.
- **Negative:** Selfies contain personal images; photo URLs are stored on the server under `storage/confirmations` and must be protected by the same access controls as other user data.

## Related

- `app/services/CameraUpload.ts`
- `app/services/Geolocation.ts`
- `app/handlers/teacherConfirmations.ts`
- `resources/Pages/teacher/confirm.svelte`
