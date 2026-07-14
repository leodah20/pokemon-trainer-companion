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

**Partner Pokédex (implemented)**
- Pokémon detail screen with 8 lore categories: origin & inspiration, GO relevance, battle tips, easter eggs, GO vs main series differences, evolution costs, shiny rates
- Hand-written lore for all 151 Generation 1 species
- Intelligent fallback — auto-generated lore for unseeded species using existing stats

**Planned features**
- OCR overlay (ML Kit) for automatic screenshot capture on Android
- Catch-chance calculator (throw type, curveball, berry)
- Raid / gym counter recommender with DPS estimates
- Pokémon comparison tool (side-by-side stat table)
- Top rankings (ATK, DEF, STA, bulk, CP, PvP by league)
- Type effectiveness chart (18×18 matrix)
- Evolution chain viewer with costs and stat changes
- Quiz / trivia mode
- Cross-device sync for saved teams and settings (Pro tier)

## How the "overlay" works (and why it's ToS-safe)

Screenshot capture + on-device OCR (Google ML Kit) feeds a floating overlay window — the same
approach used by established apps like Calcy IV and Poké Genie. No login, no memory reads, no
calls to Niantic's servers. See [docs/legal-compliance.md](docs/legal-compliance.md) for the full
reasoning.

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Mobile | React Native 0.86 (TypeScript, bare workflow) | Bare workflow because overlay + ML Kit OCR need a custom native module |
| Navigation | `@react-navigation/native-stack` | Stack navigator with 3+ routes |
| State | Local (useState/useMemo/useRef) | No global state library — static data loaded from bundled JSON |
| Backend | NestJS 11 (TypeScript) | Clean Architecture-friendly module/DI structure |
| ORM | Prisma 7 | Schema-first modeling, migrations, typed client |
| Database | PostgreSQL 16 | Saved teams, user accounts, Pro entitlements |
| Data sources | [PoGo API](https://pogoapi.net/) (stats, CP multipliers), [PvPoke](https://pvpoke.com/) (PvP movesets), [PokéAPI](https://pokeapi.co/) (sprites) | All free, unofficial/open-source, community-maintained |
| Payments | Stripe / RevenueCat | Schema prepared with plan flag; billing not implemented in MVP |

## Project status

<!-- ==================== PROGRESS OVERVIEW ==================== -->

Progress: 40% ████████░░░░░░░░░░░░ (8 / 20 features)

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
| | Species REST API (endpoints + Swagger) | 🔄 In progress | — |
| **Mobile** | Type effectiveness chart (18×18 matrix) | 🔄 Planned | — |
| | Pokémon comparison tool (side-by-side stats) | 🔄 Planned | — |
| | Top rankings (ATK/DEF/STA/Bulk/CP/PvP) | 🔄 Planned | — |
| | Raid counters with DPS estimates | 🔄 Planned | — |
| | Evolution chain viewer with costs | 🔄 Planned | — |
| | Quiz / trivia mode | 🔄 Planned | — |
| **Pro** | Overlay OCR (native Android module + ML Kit) | ❌ Not started | — |
| | Cross-device sync + authentication | ❌ Not started | — |
| | Subscription billing (Stripe/RevenueCat) | ❌ Not started | — |

### Last implemented features

> <time datetime="2026-07-14">2026-07-14</time>
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
