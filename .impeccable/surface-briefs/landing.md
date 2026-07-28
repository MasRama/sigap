# Surface brief — landing

Scope: `resources/Pages/landing.svelte` (public landing page, route `/`)
Visitor mode: Persuade

## Audience, job, action

Three co-equal audiences on one page — teacher, admin/headmaster, parent. No single primary. Each must see themselves and their job in the product.

- Teacher: "is this what I'll use daily in class?" — wants the confirmation flow to feel fast and dignified, not surveilled.
- Admin/headmaster: "does this prove my teachers are present?" — wants the evidence mechanism to be airtight and auditable.
- Parent: "can I see my child's attendance without chasing the school?" — wants transparency to be direct, not mediated.

Action: no public register, no public demo. Login is provisioned by the school's super admin. The page's job is to prove the mechanism and position the product — the visitor contacts their school admin to get access. No pricing (product is custom per-school).

## Proof/content

Only real proof: the anti-fraud mechanism itself (selfie + geolocation + Haversine distance check against school location). No testimonials, no customer logos, no benchmarks, no case studies (PRODUCT.md forbids fabrication). The mechanism IS the proof — show it working, don't claim it works.

## Constraints

- Bahasa Indonesia for all user-facing copy (ADR 0010, revised 2026-07-28)
- No pricing table, no "trusted by" strip, no testimonial carousel
- No public demo/register CTA — login is super-admin provisioned
- Voice: factual, calm, trustworthy. Not playful, not hype.
- Must work for all 3 audiences without prioritizing one
- Svelte 5 runes, Inertia.js, Tailwind CSS 4, existing token system

## Chosen direction

Sertifikat Kehadiran — the landing page is a document being produced, not a hero being marketed. Every journal entry in SIGAP is a "surat bersertifikat": selfie + geo + stamp. The page shows the mechanism as a certificate being stamped, not as feature cards being listed.

Visual world: Indonesian surat dinas / certificate aesthetic — ivory paper, ink-black text, stamp red accent, official blue for institutional headers, serial numbers, signature blocks, seals. The mental model "this is verified because it's stamped and signed" is exactly what selfie+geolocation replaces digitally.

Memorable moment: the stamp. A red "TERVERIFIKASI" stamp impacts onto the certificate as the section loads — the same gesture that marks every verified journal entry in the product.

## Unresolved decisions

- Whether the certificate in the first viewport shows a real seed-data teacher name or a generic placeholder (currently: generic placeholder, labeled as illustrative)
- Whether to add a "hubungi sekolah Anda" contact form or keep it as text-only CTA (currently: text-only, no form)
