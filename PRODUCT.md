# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

Web today (Svelte 5 + Inertia.js, responsive). Native iOS/Android planned for the teacher confirmation flow (camera + geolocation capture in the field). Mobile web remains the bridge until native ships.

## Users

Three co-equal audiences; no single primary.

- **Teachers** — in the classroom, daily. They check the day's schedule, capture a selfie and share their geolocation before class (anti-fraud confirmation), write the digital journal, and enter grades. Field use, phone-first, time-pressured between classes.
- **Admins / headmasters** — in the school office, desktop-first. They manage master data (academic years, classes, subjects, students, teachers, parents, schedules, school locations), oversee operations, and review reports of confirmations made outside the school radius.
- **Parents** — at home or at work, occasional check-ins from phone. They view their children's attendance and grades. Trust and transparency is the entire job here; they are not operators.

## Product Purpose

SIMPATIK (Sistem Monitoring Perkembangan dan Aktivitas Akademik) is a school management system built around **trust-first attendance**. Every journal entry is tied to a real teacher at a real place: before class, the teacher captures a selfie and shares their location, which is checked (Haversine distance) against the active school location. The product exists so that attendance, journals, and grades in a school are verifiable evidence of a teacher's presence — not self-reported claims.

Success means: a headmaster can prove every journal entry came from a teacher inside the school radius, a parent can see their child's attendance and grades without asking the school, and a teacher can run their daily class flow in under a minute from their phone.

## Positioning

Two claims, both binding:

1. **Trust-first attendance.** The anti-fraud selfie + geolocation confirmation tied to every journal entry is the mechanism no neighboring school management system truthfully copies. Most LMSes record attendance as self-reported data; SIMPATIK records it as verified evidence.
2. **Parent transparency.** The parent portal closes the school-home loop: parents see attendance and grades directly, without mediating through the teacher or admin. This is the second wedge — trust extends outward to families, not just upward to administrators.

## Operating Context

- **Market:** Indonesian schools (SMP/SMA scale). Seed data uses Indonesian names.
- **Language:** User-facing UI in **Bahasa Indonesia** (ADR 0010, revised 2026-07-28). English for code, comments, logs, and internal error codes only.
- **Daily teacher flow:** open schedule → tap today's class → capture selfie + share location → confirmation recorded with distance + inside/outside flag → write journal → enter grades.
- **Anti-fraud check:** Haversine distance from teacher's GPS to the active `school_locations` row; `is_inside_school` flag stored on `teacher_confirmations`. Photos saved locally and auditable.
- **Headmaster oversight:** dashboard summary + report of confirmations made outside the school radius.
- **Deployment:** lightweight — SQLite embedded, single server, suitable for on-prem or small VPS per school. Not enterprise multi-tenant SaaS.

## Capabilities and Constraints

- Master data: academic years, classes, subjects, students, teachers, parents, schedules, school locations.
- Teacher flow: daily schedule, selfie + geolocation confirmation, digital journal, grades.
- Anti-fraud: Haversine distance check against active school location; photos saved locally and auditable.
- Parent portal: view children's attendance and grades.
- Headmaster view: dashboard summary + outside-radius confirmation report.
- Auth: session-based + RBAC (admin, teacher, parent, headmaster roles).
- Constraints:
  - SQLite (single-file, embedded) — no Postgres/MySQL dependency.
  - Raw SQL over ORM (ADR 0001) — AI writes SQL, no Prisma/Drizzle/Knex.
  - Functions over classes (ADR 0002) — no `class` keyword in app code.
  - Files under 500 lines (check:filesize).
  - No new `any` (check:types) — type safety is non-negotiable.
  - Camera + geolocation require HTTPS and user permission in browser; native shell would remove the HTTPS constraint for the confirmation flow.

## Brand Commitments

- **Name:** SIMPATIK — Sistem Monitoring Perkembangan dan Aktivitas Akademik. The name reflects the platform's focus on monitoring student development and academic activity.
- **Voice:** factual, calm, trustworthy. Not playful. The product is evidence infrastructure for a school.
- **Identity constraints:** none pinned yet (no logo, palette, or typography committed). To be established in DESIGN.md via new-work.
- **UI language:** Bahasa Indonesia for user-facing strings (user-confirmed 2026-07-28, ADR 0010 revised to match). Existing English user-facing strings are technical debt to migrate — see ADR 0010 migration section.

## Evidence on Hand

- Working codebase: full-stack TypeScript, Svelte 5 + Inertia frontend, ultimate-express + better-sqlite3 backend.
- Seed data demonstrating real shapes: 1 academic year (2025/2026), 2 classes (10A, 10B), 3 subjects (Mathematics, Biology, English), 10 students, 1 school location (Main Campus), 4 demo accounts (admin, 2 teachers, parent).
- Database schema fully specified in `migrations/` (20 tables — see AGENTS.md schema table).
- 266+ passing tests (`npm run test`).
- ADRs in `docs/decisions/` documenting the why behind conventions.
- **Absences future work must not fabricate:** no real customer testimonials, no real school deployments cited, no performance benchmarks against other LMSes, no published case studies. Marketing/landing claims must be built from the product mechanism, not invented social proof.

## Product Principles

1. **Presence is evidence, not claim.** Every attendance, journal, and grade record must trace back to a verified teacher at a verified place. Anything that weakens that trace is a regression.
2. **Trust extends outward.** Parents see what the school sees. Transparency to families is a first-class feature, not a reporting afterthought.
3. **Lightweight by default.** SQLite, single server, raw SQL, functions. The product must remain deployable by one person at one school without an ops team.
4. **The teacher flow is sacred.** Teachers are time-pressured in the field. The confirmation → journal → grade flow must stay under a minute on a phone. Friction here is the highest-severity bug.
5. **Agent-legible code.** The codebase is built to be read and extended by AI agents (AGENTS.md, CODEMAP, layer lint, convention tests). Conventions are load-bearing, not cosmetic.

## Accessibility & Inclusion

- Teacher confirmation flow runs on phones in the field — must work one-handed, outdoors, with poor lighting (selfie capture) and unreliable GPS.
- Parent portal must be usable by non-technical adults on low-end Android phones.
- No product-specific WCAG level pinned yet; default to WCAG 2.1 AA as the working target until a different standard is committed.
