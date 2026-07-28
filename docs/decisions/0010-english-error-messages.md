# ADR 0010: Bahasa Indonesia for user-facing messages

Date: 2026-07-28
Status: Accepted (supersedes the 2025-01-15 English-only decision)

## Context

SIGAP is a school management system for Indonesian schools (SMP/SMA). User-facing messages appear in:
- Toast notifications (frontend)
- Form validation errors (frontend)
- API error responses (JSON `message` field)
- Page copy, labels, buttons, empty states

The previous decision (2025-01-15) mandated English for user-facing messages because the project was an open-source AI-first starter kit (Nara) with an editorial English aesthetic. SIGAP has since become a product for Indonesian schools — teachers in the field, admins in school offices, and parents at home. English messages are a friction layer for the actual audience, especially parents and teachers who are not fluent in English.

PRODUCT.md (2026-07-28) records Bahasa Indonesia as the binding UI language. This ADR brings the convention in line with the product truth.

## Decision

**Bahasa Indonesia for user-facing messages. English for code.**

Bahasa Indonesia for:
- Toast notifications
- Form validation errors
- API error responses (JSON `message` field)
- Page copy, labels, buttons, empty states, onboarding text

English for:
- Code (variables, functions, types)
- Comments (if any)
- Log messages (Logger.info/warn/error)
- Internal error codes (DUPLICATE_EMAIL, FORBIDDEN, etc.) — these are machine-readable identifiers, not user-facing strings
- ADRs, AGENTS.md, docs aimed at developers

Examples:
- `"Email sudah digunakan"` (not "Email already in use")
- `"User berhasil dibuat"` (not "User created successfully")
- `"Gagal membuat user"` (not "Failed to create user")

## Consequences

Positive:
- UI language matches the audience — Indonesian teachers, admins, and parents read Bahasa Indonesia
- Consistent with PRODUCT.md and the `sigap.id` market positioning
- Clear separation: code/logs in English, UI in Bahasa Indonesia

Negative:
- Existing English user-facing strings must be migrated to Bahasa Indonesia (toast messages, validation errors, API error messages, page copy)
- Non-Indonesian contributors need to translate when touching UI strings — acceptable, the product is for Indonesian schools
- No i18n framework yet — single-language (Bahasa) is the current scope; if bilingual is needed later, add i18n then, not now

## Migration

Existing English user-facing strings are now technical debt. Migration scope:
1. `app/validators/` — Zod error messages in `zodToErrors` and schema definitions
2. `app/core/response.ts` and error helpers — default `jsonError` / `jsonValidationError` messages
3. `app/handlers/` — success/error messages passed to `jsonSuccess` / `jsonCreated` / `jsonError`
4. `resources/lib/toast.ts` and any hardcoded toast strings
5. `resources/Pages/*.svelte` and `resources/Components/*.svelte` — labels, buttons, empty states, validation display
6. `resources/lib/api.ts` — fallback error messages

Migration is a separate task from this ADR. Do not block the ADR on migration; do not migrate piecemeal without a tracking issue.

## Alternatives considered

- **English only (previous decision)** — inconsistent with the Indonesian school audience and PRODUCT.md. Rejected.
- **Bilingual (Indonesian + English) via i18n** — doubles translation work, adds complexity, no current demand. Defer until a real bilingual requirement arrives.
- **Indonesian for UI, English for API error `message`** — splits the contract; frontend would need to map codes to Bahasa strings anyway. Simpler to keep `message` in Bahasa end-to-end and treat `code` as the machine-readable identifier.
