# Pokémon Trainer Companion

A companion app for Pokémon GO trainers: battle-stat calculators (IV, CP, PvP rankings, raid
counters) plus an optional "partner Pokédex" that surfaces lore and trivia about the Pokémon
currently on screen.

> **Fan project.** Not affiliated with, endorsed by, or sponsored by Niantic, The Pokémon Company,
> Nintendo, or Game Freak. Pokémon and Pokémon GO are trademarks of their respective owners. This
> project only reads what the trainer's device already displays on screen (via OCR) — it never
> logs in with a game account, reads game memory, or calls any Niantic server.

## Why this exists

A portfolio project built to exercise the full stack: mobile app, backend API, data modeling,
system design, and the non-technical work (legal/compliance research, documentation) that a real
product needs before it ships to app stores.

## Core features

**Battle & stats (implemented)**
- IV calculator — brute-force search over 4096 IV combinations per trainer level, using observed CP and HP
- CP evolution / power-up cost simulator — stardust, candy, and XL candy costs from level 1 to 50
- PvP move rankings — PvPoke-sourced moveset scores for Great / Ultra / Master League
- Bulk percentile ranking — tankiness comparison (DEF + STA heuristic) against all 965 species
- Meta tier classification — scores classified as Top / Viable / Niche
- Raid counters — top 10 estimated counters per boss (11 Gen 1 bosses, tiers 1/3/5), with
  optional weather-boost adjustment
- Evolution chain viewer — full chain with stats and heuristic candy costs (Gen 1-2 coverage)
- Quick Actions HUD — pulsing floating action button (Pokédex screen) opens a spring-physics
  bottom sheet with shortcuts to every tool, staggered fade-in per item

**Partner Pokédex (implemented)**
- Pokémon detail screen with 8 lore categories: origin & inspiration, GO relevance, battle tips, easter eggs, GO vs main series differences, evolution costs, shiny rates
- Hand-written lore for all 151 Generation 1 species
- Intelligent fallback — auto-generated lore for unseeded species using existing stats

**Planned features**
- OCR overlay (ML Kit) for automatic screenshot capture on Android
- Catch-chance calculator (throw type, curveball, berry)
- Raid / gym counter recommender with DPS estimates
- Top rankings (ATK, DEF, STA, bulk, CP, PvP by league)
- Evolution chain viewer with costs and stat changes
- Quiz / trivia mode
- Cross-device sync for saved teams and settings

The whole app is free and open source — every feature above ships free, with no paid/subscription
tier. See [LICENSE](LICENSE) (MIT).

## How the "overlay" works (and why it's ToS-safe)

Screenshot capture + on-device OCR (Google ML Kit) feeds a floating overlay window — the same
approach used by established apps like Calcy IV and Poké Genie. No login, no memory reads, no
calls to Niantic's servers. See [docs/legal-compliance.md](docs/legal-compliance.md) for the full
reasoning.

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Mobile | React Native 0.86 (TypeScript, bare workflow) | Bare workflow because overlay + ML Kit OCR need a custom native module |
| Navigation | `@react-navigation/native-stack` + `@react-navigation/bottom-tabs` | Bottom tab bar (Pokedex/Tools/Rankings/Quiz/More) for primary navigation; a root stack pushes detail/tool screens full-screen over the tab bar from any tab |
| State | Local (useState/useMemo/useRef) | No global state library — static data loaded from bundled JSON |
| Backend | NestJS 11 (TypeScript) | Clean Architecture-friendly module/DI structure |
| ORM | Prisma 7 | Schema-first modeling, migrations, typed client |
| Database | PostgreSQL 16 | Saved teams, user accounts (for future cross-device sync) |
| Data sources | [PoGo API](https://pogoapi.net/) (stats, CP multipliers), [PvPoke](https://pvpoke.com/) (PvP movesets), [PokéAPI](https://pokeapi.co/) (sprites) | All free, unofficial/open-source, community-maintained |

## Project status

**v1.0 Beta.** Every planned battle-stat calculator, PvP tool, and reference screen (type chart,
rankings, raid counters, evolution chain, quiz) is implemented, tested, and verified on a physical
device. Overlay OCR, cross-device sync, and deeper content (dark mode, i18n, extra lore/PvP-IV
cards) are intentionally out of scope for this beta — see "Post-beta scope" below.

<!-- ==================== PROGRESS OVERVIEW ==================== -->

Progress: 85% █████████████████░░░ (23 / 27 features)

| Category | Feature | Status | Tests |
|----------|---------|--------|-------|
| **Pokédex** | List with search + gen/type filters + animated background | ✅ Done | ✅ |
| | Detail screen (stats, PvP, battle role, power-up cost) | ✅ Done | — |
| **Calculator** | IV calculator (brute-force 4096 combos) | ✅ Done | ✅ |
| | Power-up cost simulator (stardust/candy/XL) | ✅ Done | ✅ |
| | Bulk percentile ranking (DEF+STA heuristic) | ✅ Done | ✅ |
| **PvP** | Move rankings by league (Great/Ultra/Master) | ✅ Done | ✅ |
| | Meta tier classification (Top/Viable/Niche) | ✅ Done | ✅ |
| **Lore** | Hand-written lore for 151 Gen 1 species (8 fields each) | ✅ Done | — |
| | Intelligent fallback for unseeded species | ✅ Done | — |
| **Backend** | Skeleton (NestJS + Prisma schema + logging) | ✅ Done | ✅ |
| | Species REST API (endpoints + Swagger) | ✅ Done | — |
| | Type Chart API (`/api/type-chart`, `/:type`, `/weather/boosts`) | ✅ Done | ✅ |
| | PvP API (`/api/pvp/leagues`, `/top/:league`) | ✅ Done | ✅ |
| | Raids API (`/api/raids/current`, `/:id/counters`) | ✅ Done | ✅ |
| | Companion AI API (`POST /api/companion/suggest`, Gemini-backed) | ✅ Done | ✅ |
| **Mobile** | Type effectiveness chart (attacker vs. all 18 types) | ✅ Done | — |
| | Pokémon comparison tool (side-by-side stats) | ✅ Done | ✅ |
| | Top rankings (ATK/DEF/STA/Bulk/Max CP/PvP by league) | ✅ Done | ✅ |
| | Quiz / trivia mode | ✅ Done | ✅ |
| | Raid counters with DPS estimates | ✅ Done | ✅ |
| | Evolution chain viewer with costs | ✅ Done | ✅ |
| | In-app Companion widget (avatar + speech bubble, rule-based) | ✅ Done | — |
| **Future** | OCR engine + rule-based smart suggestions (gallery screenshot → species/CP/HP → evolve/PvP/raid/gym advice) | ✅ Done | ✅ |
| | Mobile wiring for the Companion AI endpoint (currently backend-only) | ❌ Not started | — |
| | Scraped knowledge base (Bulbapedia/PokeAPI) feeding the AI prompt | ❌ Not started | — |
| | Floating overlay (native Android module, auto-capture instead of gallery picker) | ❌ Not started | — |
| | Cross-device sync + authentication | ❌ Not started | — |

### Post-beta scope

Deliberately deferred past this beta — not gaps, just not yet prioritized:

- **Floating overlay** (rest of Fase 6) — the OCR engine itself works today (gallery screenshot →
  species/CP/HP → full analysis); auto-capture via a native Android Kotlin module
  (SYSTEM_ALERT_WINDOW + MediaProjection) is the only piece left, and it's the riskiest native
  work in the project — deliberately deferred rather than rushed
- **LLM-based suggestions** — the free, rule-based path (`generateSmartSuggestions.ts`) stays as
  the always-available default. A real LLM was later added as an *optional* layer on top
  (`POST /api/companion/suggest`, backend-only so far — see "Last implemented features"), using
  Gemini's free tier specifically to avoid the cost/privacy tradeoffs of a paid API. Not wired
  into the mobile app yet, and not backed by any scraped knowledge base — it only knows what the
  backend's own species/type/PvP/raid data already contains
- **Cross-device sync + auth** — backend schema exists (`Trainer`, `SavedTeam`), no endpoints yet
- **i18n / translation** — UI is English-only by design for now (tracked, see task list)
- **Dark mode** — `useColorScheme` is read in `App.tsx` but not wired into the theme yet
- **Extra content cards** (Fase 5 of the original roadmap) — Rarity & Spawn, Best PvP League +
  IV spread, Buddy & Candy distance, Legacy Moves — need new data sources, not just UI work
- **Raid boss rotation / PvP rankings** are curated mocks (documented in-code), not live-synced —
  Fase 2.6's scheduled sync job was never built
- **AsyncStorage persistence** (e.g. last IV Calculator result) — skipped to avoid adding a new
  native dependency this late in the beta; safe to add post-beta

### Last implemented features

> <time datetime="2026-07-15">2026-07-15</time>
>
> **In-app Companion widget + backend Companion AI endpoint:**
> - New `CompanionWidget` (mobile) — a Paimon-style floating buddy avatar rendered once at the
>   App root (persists across every screen), gentle idle bounce, tap opens a speech bubble
>   cycling through lore/tips, long-press opens a search picker to change the favorite species.
>   Entirely rule-based (reuses `lore-data.json` / `getLoreWithFallback`), no network call.
> - New backend `POST /api/companion/suggest` — takes `{ speciesId, context, extra? }`
>   (`context` is `raid`/`battle`/`capture`/`levelup`/`general`) and returns an AI-generated tip
>   from Gemini. `buildCompanionPrompt.ts` assembles the prompt from data the backend already
>   has (stats, types, evolution family, counters, PvP rankings) — no scraped knowledge base yet.
> - `geminiClient.ts` calls Gemini's REST API directly (no SDK dependency) and defaults to the
>   Flash-Lite model, which sits inside Gemini's free tier (1,500 requests/day, no credit card)
>   for normal personal use. Missing `GEMINI_API_KEY` degrades to a clean 503, not a crash.
> - Chosen explicitly over self-hosting an open-source LLM (would cost more in server/hosting
>   than the free tier ever would) and over Rasa (a chatbot-intent framework, not a generative
>   LLM — doesn't fit this use case at all)
> - 6 new backend tests (20/20 backend passing) covering prompt construction and the
>   not-configured error path without needing a real API call
> - Not yet done: wiring this endpoint into the mobile app (currently backend-only, no UI calls
>   it), and the Bulbapedia/PokeAPI-sourced knowledge base for richer answers
>
> **OCR pipeline: rule-based smart suggestions (no LLM):**
> - New `generateSmartSuggestions.ts` — turns a scanned Pokemon into actionable advice: evolve
>   for +X ATK (with candy cost), best PvP league + meta tier, which raid-boss types it counters,
>   whether it's gym-defender material — all derived from data the app already computes (type
>   chart, PvP scores, bulk percentile, evolution chain)
> - Explicitly chosen over a real LLM integration: no API key, no per-call cost, no network
>   request, no screen data leaving the device — keeps the app's offline-first design intact
> - Wired into `analyzeScreenshot.ts` and surfaced in `OverlayDemoScreen` under a new
>   "WHAT TO DO WITH IT" section
> - 6 new tests (58/58 mobile tests passing), verified the screen renders without crashing on
>   the Android emulator; full species-recognition verification needs a real Pokemon GO
>   screenshot, which requires the user's phone
> - The floating overlay (auto-capture instead of picking from gallery) is still native Android
>   work not yet started — see "Post-beta scope"
>
> **Local dev: Android emulator as default target:**
> - Documented and started using the `pokemon_trainer_companion` AVD that existed but was never
>   actually used — installs and runs the full app without needing a physical phone connected
>
> **v1.0 Beta cut — final bug pass:**
> - Fixed a real bug in the IV Calculator: level range inputs rejected every decimal (`25.5`),
>   even though Pokemon levels legitimately go in 0.5 increments — `Number.isInteger` was too
>   strict. New `parseLevel()` accepts positive multiples of 0.5; CP/HP fields are unaffected
>   (those are always whole numbers). Switched the level fields to a `decimal-pad` keyboard.
> - Verified `cpMultiplier.ts`'s table (levels 1-45) is actually complete, not an unfinished gap:
>   fetched the cited source (PoGo API) directly and confirmed it doesn't publish 45.5-50 either —
>   `findIndividualValueCombinations` already bounds its search to known levels, so this was
>   never a crash risk, just a documentation clarification.
> - Backend + mobile: **66/66 tests passing** (14 backend, 52 mobile), zero TypeScript errors.
> - Declared this the v1.0 Beta cut — see "Post-beta scope" above for what's deliberately deferred.
>
> **Design: PTC rebrand + Pokedex chrome polish:**
> - New in-app logo wordmark "PTC" (gold, thick outline shadow) replaces "Professor Dex"
>   everywhere: header logo, Pokedex screen title, Android launcher label, More screen footer.
>   Full name "Pokemon Trainer Companion" kept for docs/store copy (`APP_FULL_NAME` in
>   `theme/Logo.tsx`)
> - Tightened the header-to-search-bar gap and shrunk the Gen/Type filter chips further
>   (smaller padding/font/height) so more fit per row and the edge-peek cutoff is less jarring
> - Softened the bottom tab bar to a translucent glass panel (was solid white) and gave the
>   Pokedex list generous extra bottom padding, so the last row scrolling near the tab bar
>   doesn't look hard-clipped by an opaque bar anymore
>
> **Design: app-wide glassmorphism restyle:**
> - Fixed the real bug behind "cards disappear while barely scrolling" on the Pokedex screen:
>   the scroll-fade math used a hardcoded row-height guess (88px) that didn't match the actual
>   rendered row height, so items were treated as scrolled-past far too early. Now measured live
>   via `onLayout` on the first row; no fade applied until the real height is known.
> - Replaced the thick black ink-outline + hard offset "sticker" shadow look with a translucent
>   glass style everywhere: the shared `Card` and `TypeBadge` components, and every screen's
>   buttons/inputs/chips/rows (`PokemonDetailScreen`, `IvCalculatorScreen`, `ComparisonScreen`,
>   `TypeChartScreen`, `TopRankingsScreen`, `QuizScreen`, `RaidCountersScreen`,
>   `EvolutionChainScreen`, the bottom tab bar) — translucent `glassSurface` fill, thin
>   `glassBorder`, soft diffuse `SHADOW.{sm,md,lg}` instead of a 1px-offset hard shadow twin
> - Verified on the physical device across 5 screens after the restyle (Pokedex scroll-fade,
>   Top Rankings, Tools hub, Raid Counters, Pokemon detail) — no regressions, 52/52 tests still
>   passing, zero TypeScript errors
>
> **Design: Pokémon GO-style Quick Actions HUD + spring bottom sheet:**
> - New `QuickActionsFab` — a floating circular Poke Ball button (thumb-zone, bottom-right) with
>   a continuous "breathing" pulse (`Animated.loop`, scale 1 → 1.08 → 1) and a press scale-down
>   that composes with the pulse via `Animated.multiply`, so pressing doesn't interrupt the loop
> - New `BottomSheetMenu` — reusable, generic (title + item list) slide-up sheet: `Animated.spring`
>   on `translateY` gives a slight overshoot-and-settle bounce on open, a plain `Animated.timing`
>   slide-down on close (no bounce needed on the way out), backdrop fades independently. Each menu
>   item fades + slides in with a per-index delay (staggered entrance)
> - Wired into `PokedexListScreen` (the app's Home) as a "Quick Actions" launcher — IV Calculator,
>   Compare, Type Chart, Raid Counters, Rankings, Quiz — hidden in picker mode
> - New theme tokens: `mint`/`turquoise` energetic accents, `glassSurface`/`glassBorder` (a
>   translucent white for the sheet), `scrimBackdrop`; `Card` already supported pill/rounded
>   shapes and soft shadows, reused as-is
> - **Deliberately built on RN core `Animated`, not Reanimated** — user confirmed via
>   `AskUserQuestion` to keep it that way, since Reanimated needs a native rebuild and this app's
>   Android build has a fragile history this session (see `docs/dev-setup.md`). Both animated
>   values still run on the native thread (`useNativeDriver: true`), so this isn't a JS-thread
>   fallback — just no third-party animation library.
> - Mobile suite still 52/52 passing, zero TypeScript errors app-wide (no new tests — these are
>   pure animation/presentation components with no extractable logic to unit test)
>
> **Mobile: Raid Counters and Evolution Chain viewer (Fase 3.4-3.5):**
> - New `RaidCountersScreen` — pick a boss (grouped by tier: 1★/3★/5★) and an optional weather
>   condition, see the top 10 estimated counters. Reachable from the Tools hub.
> - New `EvolutionChainScreen` — full evolution chain (sprites, types, stats, heuristic candy
>   cost between stages), reachable from a new "Evolution Chain" button on the Pokémon detail
>   screen. Coverage is Gen 1-2 (same range the evolution family data has).
> - Both screens are offline-first, mirroring the existing Type Chart pattern: raid boss data,
>   weather boosts, and evolution families were ported into `mobile/src/data/` as separate
>   copies of the same backend data, not live API calls (see `docs/architecture.md`)
> - New pure use-cases `getRaidCounters.ts` and `getEvolutionChain.ts`, unit tested (4 + 2 tests)
> - Fixed two pre-existing, unrelated TS errors left over from an earlier lore-system merge:
>   `Card` now accepts a `backgroundColor` prop, and `COLORS.retroScreenGreen`/`retroScreenGreenDark`
>   are now defined; deleted the dead, broken `LoreSection.tsx` (unused, not imported anywhere)
> - Mobile suite: **52/52 tests passing**, zero TypeScript errors app-wide
>
> **Backend: Type Chart, PvP, and Raids modules (Fase 2.3-2.5 of the content roadmap):**
> - `GET /api/type-chart` — full 18×18 attacker→defender multiplier matrix
> - `GET /api/type-chart/:type` — weaknesses/resistances/immunities/strong-against for one type
>   (case-insensitive lookup, `BadRequestException` on an unknown type)
> - `GET /api/type-chart/weather/boosts` — which types each weather condition boosts
> - `GET /api/pvp/leagues`, `GET /api/pvp/top/:league?limit=N` — new `PvpModule`,
>   `SpeciesModule` now imports it instead of duplicating `PvpRankingsRepository` as a provider
> - **Bug fix:** `PvpRankingsRepository.findBySpeciesId` never actually filtered by species id
>   (the mock rankings had no `speciesId` field) — `GET /api/species/:id/pvp-rankings` was
>   silently returning all 60 mock rankings relabeled with the requested species' name. Added
>   `speciesId` to the `PvpRanking` domain type and fixed the filter.
> - `GET /api/raids/current`, `GET /api/raids/:id/counters?weather=Rain` — new `RaidsModule`
>   with a curated mock boss rotation (11 Gen 1 bosses across tiers 1/3/5) and a documented
>   *estimated* DPS ranking (`baseAttack × type-effectiveness × STAB`, over an assumed move
>   cycle) — explicitly not a full moveset simulation, since the app has no fast/charge move
>   power+energy+duration database yet
> - 13 new backend unit tests (`typeChartService`, `pvpService`, `raidsService`), full suite:
>   **14/14 passing**
> - Not yet done: wiring these into mobile screens (raid counters, evolution viewer are still
>   mobile-side gaps — see Fase 3 of the roadmap) and the scheduled data-sync job (Fase 2.6)
>
> **Navigation redesign — bottom tabs + scroll-fade Pokedex:**
> - Replaced the growing row of header buttons (Compare/Type Chart/Rankings/Quiz/Overlay Demo —
>   the thing that kept clipping at the screen edge) with a proper 5-tab bottom navigation bar:
>   Pokedex, Tools, Rankings, Quiz, More
> - New `ToolsHubScreen` and `MoreScreen` — card-based hubs (icon + title + one-line description)
>   grouping IV Calculator/Compare/Type Chart and Overlay Demo respectively, so no single screen
>   dumps every feature on the user at once (progressive disclosure over one flat button wall)
> - `PokedexListScreen`'s list now fades each card out as it scrolls past the top of the screen
>   (pure `Animated` API from React Native core — no new native dependency), instead of cards
>   abruptly vanishing under the header
> - Screen transitions use native-stack's `fade_from_bottom` animation for a softer, more modern
>   push than the platform default
> - Navigation types reworked into a root stack (`Tabs`, `PokemonDetail`, `IvCalculator`,
>   `Comparison`, `TypeChart`, `OverlayDemo`) wrapping a tab navigator (`Pokedex`, `Tools`,
>   `Rankings`, `Quiz`, `More`) — any tab can reach any detail/tool screen via React Navigation's
>   automatic bubbling, no prop drilling or manual deep-link wiring needed
>
> **Top rankings + Quiz mode:**
> - New `TopRankingsScreen` — 8 leaderboards (Attack, Defense, Stamina, Bulk, Max CP at level 40
>   with perfect IVs, and PvP score per league), tap any row to open that species' detail screen
> - `use-cases/rankTopPokemon.ts` — sorts/limits by category, unit tested (3 tests)
> - New `QuizScreen` — 10 random multiple-choice questions (type ID, type-effectiveness
>   matchups, generation), score tracking, "Play Again"
> - `use-cases/generateQuiz.ts` — pure question generator with an injectable RNG for
>   deterministic tests (3 tests)
> - Raid counters with DPS and the evolution chain viewer are still planned but blocked on data
>   the app doesn't have yet: a fast/charged move power+energy+duration database (for raid DPS)
>   and full evolution-family data beyond the ~150 species the backend currently has (for the
>   evolution chain viewer) — both need a new data source before implementation, not just UI work
>
> **Pokemon comparison tool:**
> - New `ComparisonScreen` — search-and-select two species inline (no cross-screen picker
>   needed), then see ATK/DEF/STA/Bulk side by side with the higher stat highlighted in green
> - `use-cases/comparePokemon.ts` — pure comparison logic, unit tested (3 tests)
> - Reachable from the Pokédex header ("Compare" button)
> - Verified on the physical device end-to-end (Charizard vs. Blastoise matches real base stats)
>
> **Type effectiveness chart:**
> - New `TypeChartScreen` — pick an attacking type from a chip row, see the full 18-type
>   matchup grouped into Super effective (×2), Not very effective (×0.5), No effect (×0)
> - `domain/type-effectiveness` + `data/type-effectiveness` — same attacker→defender
>   multiplier table as the backend's `TYPE_EFFECTIVENESS`, kept as a separate offline copy
>   (mobile doesn't call the backend — see `docs/architecture.md`)
> - Reachable from the Pokédex header ("Type Chart" button)
> - UI text is English-only for now; a translation/i18n layer is a planned follow-up
>   (tracked separately, not yet started)
> - Verified on the physical device end-to-end (all 3 effectiveness buckets checked against
>   the official chart for Normal and Fire)
>
> **Android install/debug fixes (Xiaomi/HyperOS):**
> - `INSTALL_FAILED_USER_RESTRICTED` fixed by enabling Developer Options → "USB debugging
>   (Security settings)" — see `docs/dev-setup.md` troubleshooting table
> - Documented the cold-start requirement (`am force-stop` + `am start`) needed to force the
>   app to re-fetch the JS bundle from Metro after a fresh install
>
> **Lore system overhaul:**
> - New `lore-data.json` with hand-written content for all 151 Generation 1 species
> - Each species has 8 structured fields: origin, GO relevance, battle tips, easter eggs,
>   GO vs main series differences, evolution costs, shiny rates
> - Intelligent `getLoreWithFallback()` — auto-generates lore from existing stats when
>   hand-written content isn't available
> - `PokemonDetailScreen` updated with categorized lore card and "auto-generated" label
> - All documentation updated (README, architecture, use-cases, flowcharts, dev-setup)
> - **33 tests passing** (all existing tests maintained)

## Getting started

See [docs/dev-setup.md](docs/dev-setup.md) for the full step-by-step local setup (dependencies,
Docker/Postgres, Prisma migrations, running the backend + Metro together, and connecting an
Android emulator or physical device). Quick version:

```bash
npm install
npm --prefix backend install
npm --prefix mobile install
cp .env.example .env
cp backend/.env.example backend/.env
docker compose up -d
cd backend && npx prisma migrate dev --name init && cd ..
npm run dev                        # backend + Metro, keep running
# in a second terminal:
cd mobile && npx react-native run-android   # build + install on emulator
```

## Repository layout

```
mobile/                    # React Native app (TypeScript, bare workflow)
  src/
    domain/                # Business rules — pure TypeScript, no RN deps
    use-cases/             # Application-specific orchestration
    data/                  # Repository implementations + bundled JSON
    presentation/          # UI components (screens, theme, navigation)
  App.tsx                  # Root component
  index.js                 # Entry point

backend/                   # NestJS API (Prisma + PostgreSQL)
  src/
    app.module.ts          # Root module
    app.controller.ts      # Root controller (GET /)
    app.service.ts         # Root service
    presentation/          # Interceptors, pipes
  prisma/
    schema.prisma          # Database schema (Trainer, Team, Species, Type)

docs/                      # Project documentation
  use-cases.md
  entity-relationship-diagram.md
  architecture.md
  dev-setup.md
  coding-standards.md
  legal-compliance.md
  flowcharts/
    overlay-flow.md
    pokedex-flow.md
```

## Documentation

- [Use cases](docs/use-cases.md)
- [Entity-relationship diagram](docs/entity-relationship-diagram.md)
- [Architecture](docs/architecture.md)
- [Overlay flow](docs/flowcharts/overlay-flow.md)
- [Partner Pokédex flow](docs/flowcharts/pokedex-flow.md)
- [Legal & compliance notes](docs/legal-compliance.md)
- [Coding standards](docs/coding-standards.md)
- [Development setup](docs/dev-setup.md)

## License

Source code is MIT-licensed (see [LICENSE](LICENSE)). Pokémon names, designs, and other IP remain
the property of their respective owners and are not covered by this license.
