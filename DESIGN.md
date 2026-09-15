---
name: Maeen
description: A calm Arabic reading desk inside a precise local browser Side Panel.
colors:
  scholarly-indigo: "#3154A5"
  scholarly-indigo-hover: "#24458D"
  scholarly-indigo-pressed: "#1B3776"
  action-soft: "#E8EDFA"
  reading-ink: "#18212B"
  supporting-ink: "#66707A"
  warm-paper: "#FFFDF8"
  desk-canvas: "#F6F0E5"
  quiet-rule: "#D8CEBD"
  preserved-green: "#1F7257"
  preserved-green-soft: "#E4F2EC"
  recovery-amber: "#9B5A1D"
  recovery-amber-soft: "#FFF0D8"
  error-red: "#AD3B42"
  error-red-soft: "#FAE9EA"
typography:
  display:
    fontFamily: "Cairo Variable, Cairo, sans-serif"
    fontSize: "clamp(30px, 9vw, 38px)"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Cairo Variable, Cairo, sans-serif"
    fontSize: "19px"
    fontWeight: 750
    lineHeight: 1.5
  body:
    fontFamily: "Cairo Variable, Cairo, sans-serif"
    fontSize: "14px"
    fontWeight: 520
    lineHeight: 1.85
  label:
    fontFamily: "Cairo Variable, Cairo, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.65
rounded:
  field: "9px"
  control: "10px"
  callout: "12px"
  card: "14px"
  panel: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.scholarly-indigo}"
    textColor: "{colors.warm-paper}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.scholarly-indigo-hover}"
    textColor: "{colors.warm-paper}"
    rounded: "{rounded.control}"
  book-card:
    backgroundColor: "{colors.warm-paper}"
    textColor: "{colors.reading-ink}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: Maeen

## Overview

**Creative North Star: "The Arabic Reading Desk"**

The interface translates a quiet reading desk into a narrow Side Panel: warm paper, ink-like hierarchy, and scholarly indigo used only for deliberate action. It is an operating surface beside a PDF, so calm scanability and one visible next step take priority over dashboard density or decorative chrome.

The system is Arabic-first and structurally RTL. Privacy, recovery, and saved-state messages are visible parts of the product, not settings hidden behind technical language.

**Key Characteristics:**

- Warm, paper-like neutral surfaces with precise ink contrast.
- Restrained indigo actions and semantic status colors.
- Cairo typography bundled locally for offline consistency.
- Flat-by-default containers, one lifted book-cover object, and no decorative gradients.
- Responsive composition designed first for 420px, then 320px and 600px.

## Colors

Scholarly Indigo is the single action voice; Warm Paper and Reading Ink carry most of every screen. Preserved Green, Recovery Amber, and Error Red appear only when state meaning requires them.

**The One Action Voice Rule.** Scholarly Indigo identifies interaction and progress; semantic colors never compete with it for ordinary navigation.

**The Local State Rule.** Green means data was preserved, amber means safe recovery is available, and red names a failure plus its recovery.

## Typography

**Display Font:** Cairo Variable, with Cairo and sans-serif fallbacks.

**Body Font:** Cairo Variable, with Cairo and sans-serif fallbacks.

**Character:** Compact, highly legible Arabic with enough weight to anchor a narrow panel. Latin book titles remain in the same family to prevent a fragmented reading rhythm.

- **Display:** Heavy and compact for the onboarding thesis only.
- **Title:** Strong page and section hierarchy without oversized dashboard headings.
- **Body:** Direct Arabic copy with generous line height and a short measure.
- **Label:** Quiet metadata and state detail; never placeholder-only form labeling.
- **Numerals:** Page ranges, time, and percentages use tabular features and explicit LTR isolation inside RTL sentences.

**The Clear Numerals Rule.** Never allow bidi reordering to turn `84–102` into `102–84` or `44%` into `%44`.

## Layout

The Side Panel is a single content column at 320–519px with 24px inline padding at the 420px reference width. At 320px, padding contracts to 16px and only nonessential supporting copy may disappear. At 520–600px, padding grows to 32px; onboarding may pair its visual and message while task screens retain a readable single column.

Use the 4/8/12/16/24/32 spacing rhythm. Group related text tightly, separate states and actions generously, and keep the primary action full-width near the end of the current task.

**The Side Panel First Rule.** Wider space increases breathing room; it does not turn the product into a dashboard grid.

## Elevation & Depth

The system is flat by default. Tonal layers and one-pixel rules separate ordinary containers. The book cover alone uses a soft offset shadow so it reads as the physical object being acted upon; status callouts and cards do not combine borders with shadows.

**The One Lifted Object Rule.** Elevation belongs to the book as subject, not to every container.

## Shapes

Fields and primary controls use gently curved 9–10px corners. Status callouts use 12px, book rows 14px, and major visual panels 16px. Full pills are reserved for compact statuses such as “محلي”. Borders are quiet one-pixel rules; thick side accents are not part of this system.

## Components

### Primary button

Full-width, 48px tall, Scholarly Indigo, 10px corners, and bold Arabic action copy. Hover and pressed states deepen the indigo; the pending state changes its label, exposes `aria-busy`, and disables repeat activation. Focus is a 3px indigo outline with a 3px offset.

### Text action

Transparent, indigo, and at least 44px tall even when its visible text is compact. Hover adds a deliberate underline with offset. Icons come from one consistent stroke family and follow the action direction.

### Book row

Warm Paper with a quiet rule, 14px corners, and 16px internal spacing. The colored cover is the only elevated object. Progress uses a slim track with an accessible progressbar name and value.

### Status callout

Uses a semantic soft surface and matching foreground. It contains a short state title followed by what was preserved and the next safe action. Error and recovery copy never rely on color alone.

### App bar

Desk Canvas spans the panel edge-to-edge while content aligns with the screen padding. The Arabic page identity begins visually on the right; compact status or settings action occupies the opposite edge.

## Do's and Don'ts

### Do

- **Do** keep one filled primary action in each focus context.
- **Do** label synthetic examples visibly at every responsive width.
- **Do** bundle fonts and runtime code locally.
- **Do** show what was preserved whenever an operation fails.
- **Do** verify Arabic copy and isolated numerals at 320, 420, and 600px.

### Don't

- **Don't** use decorative gradients, glass, icon tiles, or generic productivity-dashboard statistics.
- **Don't** hide privacy, recovery, or destructive consequences behind vague copy.
- **Don't** mirror an LTR layout cosmetically; use structural RTL and semantic DOM order.
- **Don't** shrink interactive targets below 44px to save space.
- **Don't** place shadows and borders on the same ordinary container.
