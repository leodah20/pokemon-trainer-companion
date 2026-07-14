# Use Cases

Actors: **Trainer** (end user), **Pro Trainer** (authenticated, paying user), **System** (background
jobs: data sync).

---

## UC-01 — Calculate IVs from a screenshot

1. Trainer opens the overlay while viewing a Pokémon's status screen in Pokémon GO.
2. Trainer takes a screenshot (or the overlay captures the visible region on Android).
3. System runs on-device OCR to extract CP, HP, and stardust cost.
4. System computes the possible IV combinations and displays the top match(es) in the overlay.
5. Trainer dismisses the overlay or feeds another screenshot.

**Alternate flow:** OCR confidence is too low → Trainer is prompted to enter CP/HP/stardust manually.

**Status:** ❌ Not started (depends on native Android overlay module + ML Kit)

---

## UC-02 — Get a raid/gym counter recommendation

1. Trainer selects the raid boss (or gym defender) from a list.
2. Trainer optionally filters by "Pokémon I own" (using locally saved team data).
3. System ranks counters by type effectiveness and moveset DPS.
4. Trainer views the ranked list with recommended fast/charge moves.

**Status:** 🔄 Planned (blocked by backend species API)

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

## UC-05 — Save a team (Pro)

1. Trainer signs in (optional — required only for this use case).
2. Trainer builds a team from calculator results and saves it.
3. System persists the team to the backend, associated with the Trainer's account.
4. Team becomes available on any device the Trainer signs into.

**Status:** ❌ Not started

---

## UC-06 — Sync static Pokémon data

1. System (scheduled job) fetches species/type/move data from PokéAPI and GO-specific data
   (CP multipliers, current raid bosses, active events) from PoGo API.
2. System stores/refreshes this data in the backend cache and/or the mobile app's local database.
3. Mobile app uses locally cached data first, falling back to a backend request only on cache miss.

**Status:** ❌ Not started (data currently bundled as static JSON files)

---

## UC-07 — Manage Pro subscription

1. Trainer opens the "Go Pro" screen.
2. Trainer completes purchase through the platform's in-app purchase flow (Stripe/RevenueCat).
3. System verifies the purchase receipt and grants Pro entitlements (cross-device sync, ad-free).
4. Trainer can view/cancel the subscription from account settings.

**Status:** ❌ Not started

---

## UC-08 — Compare Pokémon stats (planned)

1. Trainer selects 2–4 Pokémon species from the Pokédex.
2. System displays a side-by-side table with ATK, DEF, STA, bulk (DEF+STA), max CP, and bulk percentile.
3. Highest value in each column is highlighted.

**Status:** 🔄 Planned

---

## UC-09 — View top rankings (planned)

1. Trainer opens the rankings screen.
2. Tabs: Top ATK, Top DEF, Top STA, Top Bulk, Top CP (L50), PvP Great/Ultra/Master.
3. Each tab shows the top 20 species with their score and type badge.

**Status:** 🔄 Planned

---

## UC-10 — Quiz / trivia mode (planned)

1. Trainer opens the quiz screen.
2. Multiple-choice questions from categories: types, stats, evolutions, lore, PvP.
3. Timer per question, streak tracking, personal best saved locally.

**Status:** 🔄 Planned
