# Source Structure (Safe Cleanup Layer)

This project now includes a non-breaking structure layer for easier navigation and future refactoring.

## Added Folders

- `src/app`
  - App-level composition exports (layout, routing shell, store access).
- `src/features`
  - Feature-centric export hubs:
    - `artist`
    - `valuation`
    - `itunes`
    - `youtube`
- `src/shared`
  - Cross-feature export hubs:
    - `components`
    - `utils`

## Why This Is Safe

- Existing files were not moved or renamed.
- Existing imports continue to work as-is.
- New index files provide cleaner import entry points for new code.

## Recommended Usage For New Code

- Feature imports:
  - `import { ArtistCard } from "../features/artist";`
  - `import { ITunesValuationTab } from "../features/itunes";`
- Shared imports:
  - `import { Button, Card } from "../shared/components";`
  - `import { supabase } from "../shared/utils";`

This keeps behavior unchanged while improving maintainability.
