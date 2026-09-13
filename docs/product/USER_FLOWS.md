# User Flows

## First-use happy path

Onboarding/privacy → Library empty state → New Book Setup → Goal Selection → Protocol Preview → Focus Session → Recall/Explain/Review → Session Summary → Book Progress.

## Returning reader

Library → Resume saved plan/session → Recover exact saved state if interrupted → Continue one next action → Complete → Summary.

## Data safety

Settings and Data → Export JSON or Markdown.

Settings and Data → Choose import → Validate schema → Migrate in memory → Preview effects → Create backup → Commit atomically → Report result.

Settings and Data → Request deletion → Explain scope and irreversibility → Confirm explicitly → Delete local product records → Report outcome.

## Failure/recovery

If the side panel closes, the browser suspends the extension, or the device restarts, reconstruct elapsed time from absolute timestamps and restore the latest safe session state. Never mark a recovered or abandoned session completed automatically.

