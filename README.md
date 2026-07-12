
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

## Core features (planned)

**Battle & stats**
- IV calculator (with estimated range before catching)
- CP evolution / power-up cost simulator
- Type-effectiveness raid & gym counter recommender
- PvP move rankings and damage "breakpoints" (Great/Ultra/Master league)
- Catch-chance calculator (throw type, curveball, berry)

**Partner Pokédex**
- Optional on-screen lore/trivia pop-up for the Pokémon currently in view (toggle on/off)
- Spoiler-light story summaries for trainers who don't want to play every mainline game
- Trivia/quiz mode

**Account (Pro tier, opt-in)**
- Cross-device sync for saved teams and settings
- Ad-free experience

## How the "overlay" works (and why it's ToS-safe)

Screenshot capture + on-device OCR (Google ML Kit) feeds a floating overlay window — the same
approach used by established apps like Calcy IV and Poké Genie. No login, no memory reads, no
calls to Niantic's servers. See [docs/legal-compliance.md](docs/legal-compliance.md) for the full
reasoning.

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Mobile | React Native (TypeScript, bare workflow) + a native Android Kotlin module | Bare workflow because the overlay window + ML Kit OCR need a custom native module; iOS does not allow persistent overlays, so iOS falls back to manual screenshot import |
| Backend | NestJS (TypeScript) | Clean Architecture-friendly module/DI structure |
| ORM | Prisma | Schema-first modeling, migrations, typed client |
| Database | PostgreSQL | Saved teams, user accounts, Pro entitlements |
| Cache | Redis (or on-device SQLite for the client) | Static Pokémon data (species, types, moves) cached locally; refreshed periodically from public data sources |
| Data sources | [PokéAPI](https://pokeapi.co/) (species/lore data), [PoGo API](https://pogoapi.net/) (GO-specific data: CP multipliers, raid bosses, events) | Both are free, unofficial, community-maintained — no official Niantic public API exists |
| Payments | Stripe / RevenueCat | Schema is prepared with a plan flag; billing itself is not implemented in the MVP |

## Project status

Early scaffolding stage: repo structure, documentation, and the backend/mobile skeletons are set
up. No feature (IV calculator, overlay, Pokédex) is implemented yet — see the task list in
[docs/use-cases.md](docs/use-cases.md) for what's planned first.

## Repository layout

```
mobile/    # React Native app (TypeScript, bare workflow)
backend/   # NestJS API (Prisma + PostgreSQL)
docs/
  use-cases.md
  entity-relationship-diagram.md
  architecture.md
  flowcharts/
    overlay-flow.md
    pokedex-flow.md
  legal-compliance.md
  coding-standards.md
```

## Documentation

- [Use cases](docs/use-cases.md)
- [Entity-relationship diagram](docs/entity-relationship-diagram.md)
- [Architecture](docs/architecture.md)
- [Overlay flow](docs/flowcharts/overlay-flow.md)
- [Partner Pokédex flow](docs/flowcharts/pokedex-flow.md)
- [Legal & compliance notes](docs/legal-compliance.md)
- [Coding standards](docs/coding-standards.md)

## License

Source code is MIT-licensed (see [LICENSE](LICENSE)). Pokémon names, designs, and other IP remain
the property of their respective owners and are not covered by this license.
