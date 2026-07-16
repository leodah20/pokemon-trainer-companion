# Legal & Compliance Notes

This document records the reasoning behind design decisions that affect Terms of Service
compliance, intellectual property, and data protection. Keeping this reasoning written down is
itself part of the point of this project: it shows the decision was made deliberately, not
overlooked.

## 1. Niantic's Terms of Service

There is no official public API for Pokémon GO account or game data. Third-party tools that log in
with a trainer's credentials, read the game's memory, or call reverse-engineered private APIs
violate Niantic's Terms of Service and have led to permanent account bans and, in some cases,
legal action against tool developers.

**Design decision:** this app never touches the Pokémon GO client or account. It reads only what is
already visible on the trainer's screen, via:

- A screenshot the trainer takes/shares, or
- An Android floating overlay that captures the visible screen region

...and runs on-device OCR (Google ML Kit) to extract stats. This is the same approach used by
established, long-running apps such as Calcy IV and Poké Genie, which both state they require no
login and modify no game files.

**iOS constraint:** Apple does not allow a persistent overlay on top of another app. The iOS build
relies on manual screenshot import or manual stat entry instead — this is documented as a platform
limitation, not a bug.

## 2. Intellectual property

Pokémon names, species data, sprites, and game terminology are trademarks/copyright of Nintendo,
Game Freak, and The Pokémon Company. This project:

- Uses PokéAPI and PoGo API, both community-maintained datasets that already operate under a
  "fan project, not affiliated" model.
- Does not reproduce copyrighted flavor text verbatim beyond what those APIs already expose for
  reference/fan-use; original trivia/lore summaries written for the app are paraphrased in the
  team's own words, not copied from game manuals or wikis.
- States clearly in the README and in-app "About" screen that the project is unaffiliated fan work.

## 2b. PvP moveset suggestions: PvPoke, not social media scraping

An earlier draft of this feature considered analyzing player comments from Reddit/forums to back
up moveset suggestions with "real community sentiment." That was deliberately rejected in favor of
[PvPoke](https://pvpoke.com)'s open rankings dataset
([GitHub: pvpoke/pvpoke](https://github.com/pvpoke/pvpoke)):

- Scraping social platforms means operating under each platform's own ToS/API rate limits, plus
  building a sentiment-analysis pipeline from scratch — a research project in itself, not a
  reasonable scope addition to a calculator app.
- PvPoke's rankings are already the aggregated output of community-vetted damage simulations
  (published as plain JSON files, MIT-licensed repo), giving the same end-user value — "what's the
  best moveset and why" — without any of the scraping risk or engineering overhead.
- The app bundles a locally-matched, size-trimmed snapshot of this data (fast move + charged moves
  + score per league), refreshed manually for now; a scheduled sync job (like the one described for
  PokeAPI/PoGo API in [architecture.md](architecture.md)) is the natural next step once this data
  needs to stay current automatically.

## 3. LGPD (Lei Geral de Proteção de Dados)

Two data postures, by design. The app is entirely free — there is no paid tier — but signing in
for cross-device team sync is still optional, so LGPD exposure is scoped to that opt-in only:

- **No account (default):** no personal data leaves the device. OCR runs on-device; screenshots
  are never uploaded. This alone keeps LGPD exposure close to zero — there's no personal data
  processing to govern.
- **Signed in (opt-in, for cross-device sync only):** collects only what's needed to sync saved
  teams across devices (email, saved teams). Chosen auth method: **Google Sign-In** (OAuth), not
  email/password — decided 2026-07-16, not yet implemented. Requires the project owner to create
  OAuth client credentials in Google Cloud Console before backend/mobile work can start (this is
  an account-holder action, cannot be done on their behalf). Requirements to satisfy before this
  ships:
  - A public privacy policy stating what's collected and why (consent as the legal basis).
  - A way for the trainer to export or delete their data (account deletion removes `TRAINER` and
    cascades to `SAVED_TEAM`/`TEAM_MEMBER`, see [entity-relationship-diagram.md](entity-relationship-diagram.md)).
  - Encryption in transit (HTTPS) and at rest for the database.
  - Google Play "Data Safety" and Apple "App Privacy" labels kept in sync with what's actually
    collected — mismatches here are a common app-store rejection reason.
  - Google Sign-In specifically also needs the OAuth consent screen configured and (before
    general release) verified by Google if requesting sensitive scopes — email-only sign-in stays
    in the lighter "unverified app" tier during development.
