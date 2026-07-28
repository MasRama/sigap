---
name: SIGAP
description: Trust-first school management — verified attendance, live.
colors:
  primary: "#1DA85A"
  primary-dark: "#27C46B"
  accent: "#0C6B51"
  accent-dark: "#0A2620"
  destructive: "#D61515"
  destructive-dark: "#D62626"
  amber: "#F59E0B"
  background: "#FFFFFF"
  background-dark: "#0D0F0E"
  foreground: "#1C1F1E"
  foreground-dark: "#E8EDE9"
  secondary: "#F5F7F6"
  secondary-dark: "#161A18"
  muted: "#EEF0EF"
  muted-foreground: "#6B7674"
  border: "#DDE1E0"
  border-dark: "#1E2521"
typography:
  display:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "clamp(2.25rem, 6vw, 4rem)"
    fontWeight: 600
    lineHeight: "1.0"
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 600
    lineHeight: "1.1"
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.3"
    letterSpacing: "normal"
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.6"
    letterSpacing: "normal"
  label:
    fontFamily: "Spline Sans Mono, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: "1.4"
    letterSpacing: "0.15em"
  mono:
    fontFamily: "Spline Sans Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "0.05em"
rounded:
  sm: "2px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "#1A9650"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "20px"
  card-header:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.lg}"
    padding: "12px 20px"
  status-dot-hadir:
    backgroundColor: "{colors.primary}"
    size: "8px"
    rounded: "50%"
  status-dot-terlambat:
    backgroundColor: "{colors.amber}"
    size: "8px"
    rounded: "50%"
  status-dot-absen:
    backgroundColor: "{colors.destructive}"
    size: "8px"
    rounded: "50%"
---

# Design System: SIGAP

## Overview

**Creative North Star: "The Live Ledger"**

SIGAP's visual system is a digital attendance ledger that is alive — names appear one by one, status dots light up green or red, timestamps tick. The system rejects the generic SaaS landing page (gradient heroes, feature card grids, "trusted by" logos, pricing tables). Instead, the product demonstrates itself: the hero IS the product working, not a description of it.

The palette is operational, not decorative. Green means verified presence. Red means absence or out-of-radius alert. Amber means late. These are not brand colors chosen for mood — they are the semantic colors of attendance status, and the entire interface is built from them. The deep green accent panel in the hero is the institutional voice: calm, authoritative, the school speaking.

Density is high but legible. Mono type (Spline Sans Mono) carries data — NIS numbers, coordinates, timestamps, distances. Serif (Spectral) carries headlines and titles — the institutional voice. Sans (Public Sans) carries body and UI — the operational voice. The pairing mirrors the product: a school (serif) running on data (mono) used by people (sans).

**Key Characteristics:**
- Ledger-first: every surface shows data in rows, not marketing cards
- Semantic color: green/red/amber carry meaning, never decorative
- Mono for data, serif for institution, sans for people
- Live motion: staggered reveals, pulse indicators — the system is working
- No social proof: no testimonials, no logos, no pricing — the mechanism is the proof
- Bahasa Indonesia for all user-facing text

## Colors

The palette is built from attendance semantics. Green is presence. Red is absence. Amber is late. These roles are fixed and non-interchangeable.

### Primary
- **Verified Green** (#1DA85A): The color of confirmed presence. Used for "Hadir" status, "Terverifikasi" labels, primary CTAs, success states, and the accent panel in the hero. In dark mode: #27C46B (slightly brighter for contrast).

### Accent
- **Institutional Teal-Green** (#0C6B51): Deep, authoritative green for the hero's left panel — the school speaking. Not used for interactive elements. In dark mode: #0A2620 (very dark green-black for panel backgrounds).

### Destructive
- **Alert Red** (#D61515): The color of absence and out-of-radius alerts. Used for "Absen" status, "Di luar radius" labels, admin alert footers. Never used decoratively. In dark mode: #D62626.

### Tertiary
- **Late Amber** (#F59E0B): The color of "Terlambat" status. Used sparingly — only for the late status dot, late status text, and late count in stats bars.

### Neutral
- **Paper White** (#FFFFFF): Primary background — clean, operational, the ledger surface.
- **Ink Dark** (#1C1F1E): Primary text — warm-tinted near-black, not pure black.
- **Surface Gray** (#F5F7F6): Secondary backgrounds — card headers, subtle section separation.
- **Muted Gray** (#6B7674): Secondary text — labels, descriptions, timestamps.
- **Border Gray** (#DDE1E0): Borders and dividers — subtle, warm-tinted.

### Dark Mode Neutrals
- **Ledger Dark** (#0D0F0E): Background — warm-tinted near-black.
- **Surface Dark** (#161A18): Secondary backgrounds.
- **Border Dark** (#1E2521): Borders.

### Named Rules
**The Semantic Color Rule.** Green, red, and amber are reserved for attendance status meanings. Never use green for a non-success UI element. Never use red for a non-alert element. The colors carry data; misusing them breaks the ledger contract.

**The One Accent Rule.** The deep teal-green accent panel appears once per page — in the hero. It is the institutional voice. Repeating it elsewhere dilutes its authority.

## Typography

**Display Font:** Spectral (with Georgia, serif fallback)
**Body Font:** Public Sans (with system-ui, sans-serif fallback)
**Label/Mono Font:** Spline Sans Mono (with SF Mono, ui-monospace fallback)

**Character:** Spectral gives the system its institutional weight — a school speaks in serif. Public Sans is the operational workhorse — clear, neutral, the voice of daily use. Spline Sans Mono carries data — NIS, coordinates, timestamps — the machine's voice. Three voices for three audiences: institution, people, data.

### Hierarchy
- **Display** (600, clamp(2.25rem, 6vw, 4rem), 1.0): Hero headlines only. Tight tracking, tight leading. One per page.
- **Headline** (600, clamp(1.75rem, 4vw, 2.5rem), 1.1): Section titles. Same serif, smaller scale.
- **Title** (600, 1.125rem, 1.3): Card titles, sub-section headers. Serif.
- **Body** (400, 1rem, 1.6): Paragraphs, descriptions, UI text. Sans. Max 65ch for readability.
- **Label** (400, 0.625rem, 0.15em tracking, uppercase): Metadata labels — "NIS", "Status", "Kelas". Mono, uppercase, wide tracking.
- **Mono Data** (400, 0.75rem, 1.5): Data values — timestamps, coordinates, distances, IDs. Mono, normal case.

### Named Rules
**The Three Voices Rule.** Serif speaks for the institution (headlines, titles). Sans speaks for people (body, UI). Mono speaks for data (numbers, timestamps, IDs). Never use mono for a headline. Never use serif for a data value.

**The Uppercase Label Rule.** Metadata labels are mono, uppercase, 0.15em tracking, 10px. This is the ledger's annotation voice — quiet, precise, institutional.

## Layout

The system uses a split-panel hero (5/7 ratio on desktop, stacked on mobile). Left panel: deep green accent with headline + CTA. Right panel: live data on white. Below the hero, sections are full-width with max-width containers (3xl–5xl) and generous vertical rhythm (py-24 to py-32).

Grid: CSS grid for card layouts (2-col for mechanism, 3-col for role views). Single-column for mobile, expanding at `sm` (640px) and `lg` (1024px) breakpoints.

Spacing rhythm: 4px base unit. Cards use 20px internal padding. Section headers sit 48px above their content. Stats bars use 20px vertical padding for visual balance.

Density: high but breathable. Data rows are 44px tall (py-3). Card headers are 44px tall. The ledger feels operational, not spacious.

## Elevation & Depth

The system is flat by default. Depth is conveyed through tonal layering, not shadows. Card headers use `bg-secondary/40` or `bg-secondary/60` to create visual hierarchy without shadow. Status tinting uses low-opacity backgrounds (`bg-primary/8`, `bg-destructive/5`) to color-code rows without heavy fills.

Shadows appear only on the live attendance card in the hero — a subtle elevation to distinguish the "live" element from the page surface. Even there, shadows are minimal.

### Shadow Vocabulary
- **Card Rest** (none): Cards are flat at rest. Borders define edges.
- **Hero Card** (`0 2px 8px rgba(0,0,0,0.08), 0 16px 40px -12px rgba(0,0,0,0.16)`): The live attendance card in the hero. The only elevated element on the page.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat. Borders and tonal layering create hierarchy. Shadows are reserved for the single "live" element that needs to feel elevated above the page.

## Shapes

Corners are rounded but restrained. The radius scale: `sm` (2px) for small elements like status dots containers, `md` (6px) for buttons and inputs, `lg` (8px) for cards and containers. The default `--radius` is 6px (0.375rem).

Status dots are perfect circles (50% radius, 8px). The logo mark is a rounded square (6px radius) with an inner square. No sharp corners anywhere — the system is operational but not harsh.

Borders are 1px solid, using `--border` color. Dividers within cards use `border-border/60` (60% opacity) for subtle separation.

## Components

### Buttons
- **Shape:** 6px radius, 44px height, 24px horizontal padding.
- **Primary:** `bg-primary text-primary-foreground` — green button with white text. Used for CTAs ("Masuk", "Buka dashboard").
- **Hover:** `bg-primary/90` — slight darkening, no scale, no shadow.
- **Font:** Spectral, 14px, 500 weight. The institution speaking through a button.

### Status Dots
- **Shape:** 8px circle, 50% radius.
- **Hadir:** `bg-primary` (green).
- **Terlambat:** `bg-amber-500` (amber).
- **Absen:** `bg-destructive` (red).
- **Live indicator:** 10px dot with `animate-ping` ring — the system is working.

### Cards / Ledger Containers
- **Corner:** 8px radius.
- **Background:** `bg-card` (white in light, dark surface in dark mode).
- **Border:** 1px solid `border-border`.
- **Shadow:** None at rest (see Elevation). Hero card only.
- **Structure:** Header bar (`bg-secondary/40` or `/60`, 44px) + body (20px padding) + optional footer bar (tinted `bg-primary/5` or `bg-destructive/5`).
- **Internal Padding:** 20px (px-5 py-5).

### Data Rows
- **Structure:** Grid layout with columns for NIS, name, status, icon.
- **Height:** ~44px (py-3).
- **Status tinting:** Row background tinted with status color at 8% opacity.
- **Divider:** 1px `border-border` between rows.
- **Hover:** `bg-secondary/30` — subtle highlight, no scale.

### Stats Bar
- **Structure:** 3-column grid at card footer.
- **Each cell:** Flex column, centered. Large number (Spectral, 20px, bold) + small label (mono, 9px, uppercase).
- **Color:** Number colored by status (green/amber/red). Label always muted.

### Navigation
- **Style:** Fixed top, 64px height, solid `bg-background` with `border-b border-border`. No transparency transition.
- **Logo:** Green rounded square mark + "SIGAP" in Spectral semibold + tagline in mono.
- **Links:** Public Sans, 14px, `text-muted-foreground` → `text-foreground` on hover.

### Verification Log (Signature Component)
- **Structure:** Card with header ("Log Verifikasi" + status) + timeline entries + footer (guru name + TERVERIFIKASI).
- **Timeline:** Vertical dots connected by lines. Done = gray dot, Verified = green dot. Connector line colored by status.
- **Entries:** Timestamp (mono, right-aligned) + label (serif) + description (sans) + data readout (mono).

## Do's and Don'ts

### Do:
- **Do** show the product working — live data, staggered reveals, status dots. The mechanism is the marketing.
- **Do** use green/red/amber only for their semantic attendance meanings.
- **Do** use mono type for all data values (NIS, coordinates, timestamps, distances, IDs).
- **Do** use the card header + body + footer structure for all data containers — it's the ledger pattern.
- **Do** keep the hero split 5/7 — green panel left, data right. This ratio is the signature.
- **Do** use Bahasa Indonesia for all user-facing text.

### Don't:
- **Don't** use green, red, or amber as decorative colors. They carry data.
- **Don't** add shadows to cards at rest. The system is flat; borders and tonal layering create hierarchy.
- **Don't** use gradient transitions between sections. Let each section stand with its own background.
- **Don't** add testimonials, "trusted by" logos, pricing tables, or social proof. The mechanism is the proof.
- **Don't** use serif for data values or mono for headlines. The three voices are non-interchangeable.
- **Don't** animate the nav background on scroll. It should be solid from the start.
- **Don't** use real teacher photos in the hero. The mechanism (geolocation + geofence) is the proof, not faces.
