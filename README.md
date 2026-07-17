# Pokémon Trainer Companion

**The real-time, AI-powered overlay for Pokémon GO.**

Every trainer app on the store is another IV calculator with a different coat of paint. PTC's
actual goal is a floating overlay that reads your screen live and gives smart, contextual tips as
you play — capture advice, raid counters, PvP moves — grounded in a real knowledge base, not
generic pop-up ads. **That overlay is the project's flagship feature** — see below. Everything
else here (calculators, Pokédex, rankings) is the foundation it's built on.

> **Fan project.** Not affiliated with, endorsed by, or sponsored by Niantic, The Pokémon Company,
> Nintendo, or Game Freak. This project only reads what the trainer's device already displays on
> screen (via OCR) — it never logs in with a game account, reads game memory, or calls any
> Niantic server.

## 🏆 Flagship feature: real-time AI overlay

A floating window that reads your screen live via on-device OCR and gives contextual advice for
exactly the Pokémon and situation in front of you — no login, no game-memory access, no calls to
Niantic's servers (see [legal-compliance.md](docs/legal-compliance.md)).

**Working today:**
- **OCR pipeline** — screenshot (or live capture) → species/CP/HP extraction → full analysis (IV,
  PvP, bulk, evolution, rule-based tips)
- **Live floating window** — a real Android `TYPE_APPLICATION_OVERLAY` window, native
  `MediaProjection` capture, and a Kotlin-side ML Kit OCR polling loop that keeps reading the
  screen even while PTC itself is backgrounded — tap the overlay to jump into Professor Mode for
  more
- **AI companion** — Gemini-backed tips grounded in the *real* stats OCR just read (not a generic
  fact), plus **Professor Mode**, an open-ended multi-turn chat
- **Knowledge base (MVP)** — PokeAPI-sourced facts (genus, habitat, flavor text) for all 251 Gen
  1+2 species ground the AI's answers instead of relying purely on the model's training

**Next up:** feeding live analysis results *inside* the floating window itself (today it shows a
short live tip; deeper results still live in the in-app screen), and extending the knowledge base
past Gen 2 with richer, community-sourced facts. See "Post-beta scope" below.

## Why this exists

A portfolio project exercising the full stack: mobile app, backend API, data modeling, system
design, and the non-technical work (legal/compliance research, documentation) a real product needs
before it ships — with an actual product vision behind it, not just a feature checklist.

## Core features

**Battle & stats**
- IV calculator (brute-force 4096 combos), power-up cost simulator, PvP move rankings, bulk
  percentile ranking, meta tier classification
- Raid counters (11 Gen 1 bosses, tiers 1/3/5, weather-boost aware), evolution chain viewer
- Quick Actions HUD — floating action button opens a shortcut sheet to every tool

**Partner Pokédex**
- Detail screen with 8 lore categories (hand-written for all 151 Gen 1 species, intelligent
  fallback for the rest), top rankings, quiz mode

**AI overlay** — see "🏆 Flagship feature" above

**Planned:** catch-chance calculator, cross-device team sync

100% free and open source — no paid tier. See [LICENSE](LICENSE) (MIT).

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Mobile | React Native 0.86 (TypeScript, bare workflow) | Bare workflow — overlay + ML Kit OCR need custom native modules |
| Navigation | `@react-navigation/native-stack` + `bottom-tabs` | Bottom tabs (Pokedex/Tools/Rankings/Quiz/More) + a root stack for detail/tool screens |
| State | Local (useState/useMemo/useRef) | No global state library — static data loaded from bundled JSON |
| Backend | NestJS 11 (TypeScript) | Clean Architecture-friendly module/DI structure; hosted free on [Render](docs/deploy-backend-cloud.md) |
| ORM | Prisma 7 | Schema-first, migrations, typed client (optional — backend works without a DB) |
| Data sources | [PoGo API](https://pogoapi.net/), [PvPoke](https://pvpoke.com/), [PokéAPI](https://pokeapi.co/) | All free, unofficial/open-source, community-maintained |

## Project status

**v1.0 Beta**, closed testing with friends. Every calculator/PvP/reference screen is implemented,
tested, verified on a physical device, and fully translated (EN/PT-BR/ES). The app runs fully
standalone — release APK + free-tier cloud backend, no PC required. Native overlay live capture,
a deeper knowledge base, cross-device sync, and dark mode are intentionally past this beta — see
"Post-beta scope" below.

Progress: 94% ███████████████████░ (34 / 36 features)

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
| | Intelligent fallback for unseeded species (localized per language) | ✅ Done | ✅ |
| | Lore content translated EN/PT-BR/ES (Gemini batch translation) | ✅ Done | ✅ |
| **Backend** | Skeleton (NestJS + Prisma schema + logging) | ✅ Done | ✅ |
| | Species REST API (endpoints + Swagger) | ✅ Done | — |
| | Type Chart API (`/api/type-chart`, `/:type`, `/weather/boosts`) | ✅ Done | ✅ |
| | PvP API (`/api/pvp/leagues`, `/top/:league`) | ✅ Done | ✅ |
| | Raids API (`/api/raids/current`, `/:id/counters`) | ✅ Done | ✅ |
| | Companion AI API (`POST /api/companion/suggest`, `/chat`, Gemini-backed) | ✅ Done | ✅ |
| | Hosted on Render (free tier) — app is fully standalone | ✅ Done | — |
| **Mobile** | Type effectiveness chart (attacker vs. all 18 types) | ✅ Done | — |
| | Pokémon comparison tool (side-by-side stats) | ✅ Done | ✅ |
| | Top rankings (ATK/DEF/STA/Bulk/Max CP/PvP by league) | ✅ Done | ✅ |
| | Quiz / trivia mode | ✅ Done | ✅ |
| | Raid counters with DPS estimates | ✅ Done | ✅ |
| | Evolution chain viewer with costs | ✅ Done | ✅ |
| | In-app Companion widget (avatar + speech bubble, rule-based + optional AI) | ✅ Done | — |
| | Professor Mode — open-ended multi-turn AI chat | ✅ Done | ✅ |
| | i18n (English/Portuguese/Spanish) — every screen + lore content | ✅ Done | ✅ |
| | Accessibility labels (accessibilityRole/Label/State) | ✅ Done | — |
| | App-wide Error Boundary + AsyncStorage persistence | ✅ Done | ✅ |
| **🏆 Flagship** | OCR engine + rule-based smart suggestions | ✅ Done | ✅ |
| | Gemini-backed AI companion grounded in real on-screen stats | ✅ Done | ✅ |
| | Knowledge base grounding the AI (all 251 Gen 1+2 species) | ✅ MVP done | ✅ |
| | Floating overlay window + screen capture consent flow | ✅ Done | — |
| | Floating overlay live capture (native polling, survives backgrounding) | ✅ Done | — |
| | Knowledge base — expand past Gen 2 + deeper Bulbapedia-sourced facts | 🔄 Planned | — |
| **Future** | Cross-device sync + authentication | ❌ Not started | — |

### Post-beta scope

Deliberately deferred — not gaps, just not yet prioritized:

- **Overlay results inside the floating window itself** — the window currently shows a short
  live species/CP/tip line; a deeper result view (movesets, evolution, etc.) still lives in the
  in-app screen, one tap away via the overlay
- **Knowledge base** — expand past Gen 2 (re-run the ingestion script with a wider ID range) and
  pull in richer, community-sourced facts (Bulbapedia-style) beyond PokeAPI's structured fields
- **Cross-device sync + auth** — backend schema exists (`Trainer`, `SavedTeam`), no endpoints yet.
  Google Sign-In chosen over email/password (see [legal-compliance.md](docs/legal-compliance.md)
  §3) — blocked on OAuth client credentials the project owner needs to create in Google Cloud
  Console
- **Remaining i18n gaps (deliberate)** — quiz question content and Pokemon type names (Fire,
  Water, etc.) are left untranslated on purpose
- **Dark mode** — `useColorScheme` is read in `App.tsx` but not wired into the theme; `COLORS` is
  a static object imported by every screen's `StyleSheet.create()`, so real theming means
  refactoring every call site — too large/risky without a device to check every screen, left for
  a dedicated pass
- **Extra content cards** (Rarity & Spawn, Best PvP League + IV spread, Buddy & Candy distance,
  Legacy Moves) — need new data sources, not just UI work
- **Raid boss rotation / PvP rankings** are curated mocks, not live-synced — the scheduled sync
  job was never built
- **Backend on Render's free tier** sleeps after 15 min idle (first request after that takes
  ~30s to wake up) — migrating to Railway/Fly.io removes this, tracked as a follow-up

### Last implemented features

> **Native overlay live capture loop + overlay tappable + release signing config:**
> - `ScreenCaptureService.kt` now runs its own native capture+OCR polling loop (ML Kit in Kotlin),
>   keeping the overlay updated even while PTC is backgrounded — a JS-side `setInterval` doing the
>   same thing reliably stalled once its Activity lost foreground.
> - Floating overlay is now tappable — brings PTC to foreground and opens Professor Mode.
> - Fixed a `CalledFromWrongThreadException`: all `WindowManager` ops now run on the main thread.
> - Release signing configured (`release.keystore`), version bumped to `1.0.0-beta.1` (versionCode 2).

> **Live screen capture — the overlay reads a real frame, not a static placeholder:**
> New `ScreenCaptureService.kt` opens the actual `MediaProjection` session and grabs a real frame
> via `VirtualDisplay` + `ImageReader`, fed through the same `analyzeScreenshot(uri)` pipeline the
> gallery-picker flow already uses. Verified end to end: OCR came back as a live, verbatim
> transcription of the screen at capture time — not a stub.

> **Professor Mode keyboard fix, take two:**
> The first fix (`behavior: 'height'`) tested clean but still failed on a physical device —
> `KeyboardAvoidingView` doesn't reliably pick up `adjustResize` inside a react-native-screens
> Fragment. Real fix: manually track keyboard height via `Keyboard.addListener` and apply it as
> `paddingBottom`. Verified working on-device this time, not just assumed.

> **Professor Mode — open-ended, multi-turn AI chat:**
> New `POST /api/companion/chat` forwards the full conversation to Gemini's `contents` array
> natively (real multi-turn context, not prompt-stuffed history). New `ProfessorChatScreen` chat
> UI, reachable from the Companion widget. Verified live: asked a real PvP question in Portuguese,
> got a detailed, well-formatted, conversational reply.

> **Screen capture consent flow:**
> `OverlayModule.kt` now triggers Android's real `MediaProjectionManager` "Share your screen?"
> system dialog, verified on both the accept and deny paths round-tripping correctly to JS.

**[→ Full changelog](docs/changelog.md)** — every implemented feature, oldest to newest.

## Building a release APK

```bash
cd mobile/android
./gradlew assembleRelease
# APK at: android/app/build/outputs/apk/release/app-release.apk
```

The release APK bundles the JS and points at the hosted backend — install and open, no dev server,
no PC. Everything except the AI features (Ask AI, Professor Mode) works fully offline; see
[deploy-backend-cloud.md](docs/deploy-backend-cloud.md) to host your own backend for those.

## Getting started

See [docs/dev-setup.md](docs/dev-setup.md) for the full local setup (dependencies, Docker/Postgres,
Prisma migrations, running backend + Metro together, emulator or physical device). Quick version:

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

backend/                   # NestJS API (Prisma + PostgreSQL)
  src/
    presentation/          # Controllers, interceptors, pipes
  prisma/
    schema.prisma          # Database schema (Trainer, Team, Species, Type)

docs/                      # Project documentation
```

## Documentation

- [Use cases](docs/use-cases.md) · [Entity-relationship diagram](docs/entity-relationship-diagram.md)
- [Architecture](docs/architecture.md) · [Coding standards](docs/coding-standards.md)
- [Overlay flow](docs/flowcharts/overlay-flow.md) · [Partner Pokédex flow](docs/flowcharts/pokedex-flow.md)
- [Legal & compliance notes](docs/legal-compliance.md)
- [Development setup](docs/dev-setup.md) · [Decisions & planning](docs/decisions-and-planning.md)
- [Deploy backend to cloud](docs/deploy-backend-cloud.md) — Render free setup, no credit card
- [Debug log](docs/debug-log.md) — real bugs hit + root causes, for pattern-matching next time
- [Full changelog](docs/changelog.md) — every implemented feature, oldest to newest

## License

Source code is MIT-licensed (see [LICENSE](LICENSE)). Pokémon names, designs, and other IP remain
the property of their respective owners and are not covered by this license.
