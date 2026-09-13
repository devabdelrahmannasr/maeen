# Product Specification Summary

This local summary supports continuation; the approved Notion spec remains authoritative.

## Problem

PDF readers can advance through pages without a reliable method for choosing a reading strategy, maintaining focus, recovering after interruption, or converting text into durable understanding.

## Proposed outcome

Given a book reference, goal, constraints, and optional secondary goals, the extension generates a transparent reading protocol and guides the reader through a recoverable session. It stores progress and learning artifacts locally.

## Functional requirements

- Explain privacy and local ownership during onboarding.
- Create, edit, archive, and resume local book records.
- Capture goal, time budget, pace, deadline, and optional secondary goals.
- Select a protocol deterministically and explain the reasons.
- Persist a versioned Protocol Snapshot with the plan.
- Guide session steps with pause, break, distraction, recovery, completion, and abandonment.
- Capture recall, explanation, questions, review, and application artifacts.
- Show book progress without reducing success to pages alone.
- Export JSON/Markdown, validate imports, and support safe deletion.
- Preserve usable keyboard, RTL, contrast, focus, and reduced-motion behavior.

## Acceptance boundary

The MVP is complete only when the ten-screen path works without network access, browser restart recovery is tested, import cannot partially corrupt data, and the extension never reads PDF contents.

