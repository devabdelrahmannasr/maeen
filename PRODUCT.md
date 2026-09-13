# Product — مرافق القراءة

## Summary

**مرافق القراءة — Reading Companion** is an Arabic-first, open-source, local-first browser extension that turns a reader's goal into a guided reading protocol and exposes one useful next action at a time beside an existing PDF viewer.

Product promise: **قل لي لماذا تقرأ، وسأرتب لك كيف تقرأ.**

Success is not page count alone. The product helps the reader remember, explain, review, and apply what was read.

## Primary users

Arabic readers of educational, technical, and non-fiction PDFs, including students, software engineers, self-directed learners, deadline-driven readers, and people rebuilding their ability to focus.

## Product model

1. The reader registers a book reference and reading constraints; the file content remains outside the extension.
2. The reader chooses one primary goal and up to two secondary goals.
3. A deterministic rules engine selects a protocol and explains why.
4. The reading plan stores an immutable, versioned Protocol Snapshot.
5. A guided session advances through Preview → Question → Read → Recall → Explain → Review → Apply.
6. Progress and learning artifacts are stored locally and remain exportable by the user.

## MVP screens

1. Onboarding and privacy
2. Books Library
3. New Book Setup
4. Goal Selection
5. Protocol Preview
6. Focus Session
7. Recall / Explain / Review
8. Session Summary
9. Book Progress
10. Settings and Data

## Protocol families

- Deep Technical Reading: P2R + Active Recall + Feynman + 50/10
- Exam Study: SQ3R + Blurting + Review + Pomodoro
- Practical Application: 80/20 + Structured Notes + Apply + Timeboxing
- Deadline Reading: Reverse Planning + PPM + Timeboxing
- Critical Reading: Questions + marginal-style notes + review
- Focus Recovery: short blocks + Pomodoro + distraction tracking

## Platform and data

- Chrome and Edge Manifest V3 extension.
- Side Panel beside the browser's existing PDF viewer.
- IndexedDB for domain records and Chrome Storage Local for small preferences.
- JSON and Markdown export.
- Import pipeline: validate → migrate → preview → backup → commit.
- Absolute timestamps for resilient timers and interruption recovery.

## Non-goals for MVP

No backend, login, accounts, cloud sync, analytics, monetization, AI/RAG, PDF content reading, custom PDF.js reader, PDF annotation, Firefox, mobile application, or Acrobat integration.

## Experience principles

- Begin with purpose, not a menu of techniques.
- Present one clear next action and progressively disclose detail.
- Explain protocol selection in plain Arabic.
- Make local ownership, recovery, and deletion visible.
- Use structural RTL, keyboard support, visible focus, WCAG AA contrast, reduced motion, and non-color cues.
- Never imply research validation that has not occurred.

