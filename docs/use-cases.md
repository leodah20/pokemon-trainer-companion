# Use Cases

Actors: **Trainer** (end user), **Pro Trainer** (authenticated, paying user), **System** (background
jobs: data sync).

**UC-01 and UC-01a are the project's flagship use cases** — the real-time AI overlay is the
differentiator this app is actually being built around (every other use case below is the solid
calculator/reference foundation it sits on top of). See
[architecture.md](architecture.md#key-decisions) and the README's "🏆 Flagship feature" section.

---

## UC-01 — Calculate IVs and get contextual tips from a screenshot

1. Trainer picks a screenshot of a Pokémon's status screen in Pokémon GO (today: from the gallery
   via `OverlayDemoScreen`; the goal: a native floating overlay that captures the screen live —
   see the alternate flow below).
2. System runs on-device OCR to extract species name, CP, and HP.
3. System computes the possible IV combinations, PvP moveset rankings, bulk percentile, and
   rule-based suggestions (evolve/power-up/PvP/raid/gym advice) — all grounded in the exact
   Pokémon and stats just read from the screen, not generic advice.
4. Trainer can tap "Ask AI ✨" for a natural-language tip generated from that same real, on-screen
   data (see UC-01a).

**Alternate flow (native overlay, scaffolded):** instead of picking a screenshot from the gallery,
the overlay captures the visible screen region live via a native Android module
(`SYSTEM_ALERT_WINDOW` + `MediaProjection`), so results render as a floating window over the game
in real time — no manual screenshot step. The floating window itself is real and verified
(`OverlayModule.kt`, survives app backgrounding); it just isn't fed live screen content yet —
`MediaProjection` capture into the existing OCR pipeline is the remaining piece.

**Alternate flow:** OCR confidence is too low / no known species recognized → Trainer is shown a
message rather than a wrong result; no manual-entry fallback yet.

**Status:** 🟡 Partially done — OCR pipeline, IV/PvP/bulk analysis, and rule-based suggestions all
work today via gallery screenshot (`analyzeScreenshot.ts`, `OverlayDemoScreen`). The native
floating window itself is scaffolded and verified; live `MediaProjection` capture feeding it is
the remaining piece — see "Flagship feature" in the README.

---

## UC-01a — Get an AI tip grounded in real on-screen data (flagship)

1. Trainer has just analyzed a screenshot (UC-01) or is chatting with the in-app Companion widget
   about their chosen buddy species.
2. Trainer picks a context (raid / battle / capture / level up / general) and taps "Ask AI ✨".
3. System sends the species' data plus the *real* OCR-extracted CP/HP/IVs (when available) to the
   Companion AI endpoint (`POST /api/companion/suggest`), which builds a grounded prompt and calls
   an LLM (currently Gemini) for a natural-language tip.
4. Trainer reads a tip specific to their actual Pokémon and situation — not a generic, disconnected
   fact.

**What makes this the flagship feature, not just an LLM wrapper:** the LLM is grounded in the
backend's own species/type/PvP/raid data plus a knowledge base of real Pokedex facts
(`backend/src/data/knowledge/`, PokeAPI-sourced: genus, habitat, official Pokedex flavor text),
instead of relying purely on its own training. That knowledge base currently covers all 251 Gen
1+2 species (tracking the backend's own species database range) — extending it to later
generations and toward deeper, community-sourced facts (Bulbapedia-style trivia) beyond what
PokeAPI's structured fields cover is the next step and the highest-value piece of work left in
the project.

**Status:** 🟡 Partially done — grounded prompting with real OCR data
(`buildCompanionExtraContext.ts`) and a PokeAPI-sourced knowledge base MVP
(`KnowledgeRepository`, `buildCompanionPrompt.ts`) both work today; the knowledge base covers all
251 Gen 1+2 species but only PokeAPI's structured fields so far.

---

## UC-02 — Get a raid/gym counter recommendation

1. Trainer selects the raid boss from a list (grouped by tier: 1★/3★/5★).
2. Trainer optionally selects the current weather for a boost-adjusted ranking.
3. System ranks counters by type effectiveness × STAB × weather boost (an estimated DPS score,
   not a full moveset simulation — the app doesn't have a fast/charge move
   power+energy+duration database yet).
4. Trainer views the top 10 ranked list.

**Status:** ✅ Done — `RaidCountersScreen` (mobile) + `GET /api/raids/current`,
`GET /api/raids/:id/counters` (backend). "Pokémon I own" filtering and recommended fast/charge
moves are not implemented — would need the move database above.

---

## UC-03 — Check PvP move rankings for a Pokémon

1. Trainer selects a Pokémon and a league (Great/Ultra/Master).
2. System returns ranked movesets with scores from PvPoke rankings.

**Status:** ✅ Implemented (detail screen shows movesets per league from bundled PvPoke data)

---

## UC-04 — View partner Pokédex trivia

1. Trainer has the "partner Pokédex" toggle enabled in settings.
2. Trainer points the overlay at a Pokémon encounter or Pokédex entry.
3. System matches the species and shows a lore/trivia card with 8 categories:
   - Origin & inspiration
   - GO relevance
   - Battle tips
   - Easter eggs / cultural references
   - GO vs main series differences
   - Evolution costs
   - Shiny rates
4. Trainer can disable this feature entirely from settings at any time.

**Alternate flow:** No written lore for the species → System generates lore dynamically from
existing stats (type, generation, base stats, evolution cost estimates).

**Status:** ✅ Implemented (151 Gen 1 species with hand-written lore; fallback for all others)

---

## UC-05 — Save a team

1. Trainer signs in (optional — required only for this use case).
2. Trainer builds a team from calculator results and saves it.
3. System persists the team to the backend, associated with the Trainer's account.
4. Team becomes available on any device the Trainer signs into.

Not gated behind any tier — the app has no paid tier at all (see README). Signing in is purely for
the convenience of syncing across devices.

**Status:** ❌ Not started

---

## UC-06 — Sync static Pokémon data

1. System (scheduled job) fetches species/type/move data from PokéAPI and GO-specific data
   (CP multipliers, current raid bosses, active events) from PoGo API.
2. System stores/refreshes this data in the backend cache and/or the mobile app's local database.
3. Mobile app uses locally cached data first, falling back to a backend request only on cache miss.

**Status:** ❌ Not started (data currently bundled as static JSON files)

---

## UC-07 — Sign in for cross-device team sync

1. Trainer opts into signing in via **Google Sign-In** (entirely optional — the app works fully
   offline without it; decided 2026-07-16, not email/password, see
   [legal-compliance.md](legal-compliance.md) §3).
2. System creates/authenticates the `TRAINER` account (matched by the Google account's subject id)
   and syncs `SAVED_TEAM`/`TEAM_MEMBER` rows.
3. Trainer can view/delete their synced data from account settings at any time.

There is no paid tier — this use case exists purely for the convenience of syncing saved teams
across devices, not to gate any feature.

**Blocked on:** the project owner creating OAuth client credentials in Google Cloud Console — an
account-holder action that can't be done on their behalf. No backend/mobile implementation exists
yet.

**Status:** ❌ Not started

---

## UC-08 — Compare Pokémon stats

1. Trainer selects 2 Pokémon species inline on the Comparison screen.
2. System displays a side-by-side table with ATK, DEF, STA, and bulk (DEF+STA), highest value per
   row highlighted.

**Status:** ✅ Done — `ComparisonScreen` (mobile)

---

## UC-09 — View top rankings

1. Trainer opens the rankings screen.
2. Tabs: Top ATK, Top DEF, Top STA, Top Bulk, Top CP (L40, perfect IVs), PvP Great/Ultra/Master.
3. Each tab shows the ranked species with their score, tap a row to open its detail screen.

**Status:** ✅ Done — `TopRankingsScreen` (mobile)

---

## UC-10 — Quiz / trivia mode

1. Trainer opens the quiz screen.
2. 10 random multiple-choice questions from categories: type ID, type-effectiveness matchups,
   generation.
3. Score tracked across the run; "Play Again" generates a fresh set.

**Status:** ✅ Done — `QuizScreen` (mobile)
