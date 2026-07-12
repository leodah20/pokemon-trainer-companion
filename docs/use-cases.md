# Use Cases

Actors: **Trainer** (end user), **Pro Trainer** (authenticated, paying user), **System** (background
jobs: data sync).

## UC-01 — Calculate IVs from a screenshot

1. Trainer opens the overlay while viewing a Pokémon's status screen in Pokémon GO.
2. Trainer takes a screenshot (or the overlay captures the visible region on Android).
3. System runs on-device OCR to extract CP, HP, and stardust cost.
4. System computes the possible IV combinations and displays the top match(es) in the overlay.
5. Trainer dismisses the overlay or feeds another screenshot.

**Alternate flow:** OCR confidence is too low → Trainer is prompted to enter CP/HP/stardust manually.

## UC-02 — Get a raid/gym counter recommendation

1. Trainer selects the raid boss (or gym defender) from a list.
2. Trainer optionally filters by "Pokémon I own" (using locally saved team data).
3. System ranks counters by type effectiveness and moveset DPS.
4. Trainer views the ranked list with recommended fast/charge moves.

## UC-03 — Check PvP move rankings for a Pokémon

1. Trainer selects a Pokémon and a league (Great/Ultra/Master).
2. System returns ranked movesets with damage "breakpoints" relevant to that league's CP cap.

## UC-04 — View partner Pokédex trivia

1. Trainer has the "partner Pokédex" toggle enabled in settings.
2. Trainer points the overlay at a Pokémon encounter or Pokédex entry.
3. System matches the species and shows a short lore/trivia card (spoiler-light).
4. Trainer can disable this feature entirely from settings at any time.

## UC-05 — Save a team (Pro)

1. Trainer signs in (optional — required only for this use case).
2. Trainer builds a team from calculator results and saves it.
3. System persists the team to the backend, associated with the Trainer's account.
4. Team becomes available on any device the Trainer signs into.

## UC-06 — Sync static Pokémon data

1. System (scheduled job) fetches species/type/move data from PokéAPI and GO-specific data
   (CP multipliers, current raid bosses, active events) from PoGo API.
2. System stores/refreshes this data in the backend cache and/or the mobile app's local database.
3. Mobile app uses locally cached data first, falling back to a backend request only on cache miss.

## UC-07 — Manage Pro subscription

1. Trainer opens the "Go Pro" screen.
2. Trainer completes purchase through the platform's in-app purchase flow (Stripe/RevenueCat).
3. System verifies the purchase receipt and grants Pro entitlements (cross-device sync, ad-free).
4. Trainer can view/cancel the subscription from account settings.
