# Entity-Relationship Diagram

Covers only the entities that need a backend (accounts, saved teams, cached static data).
Calculators that don't require persistence (IV math, counter lookups) work entirely offline in
the mobile app and are not modeled here.

```mermaid
erDiagram
    TRAINER ||--o{ SAVED_TEAM : owns
    TRAINER ||--o| SUBSCRIPTION : has
    SAVED_TEAM ||--|{ TEAM_MEMBER : contains
    TEAM_MEMBER }o--|| POKEMON_SPECIES : references
    POKEMON_SPECIES ||--o{ POKEMON_TYPE_MAP : has
    POKEMON_TYPE_MAP }o--|| POKEMON_TYPE : is

    TRAINER {
        uuid id PK
        string email UK
        string display_name
        timestamp created_at
        boolean lore_popups_enabled
    }

    SUBSCRIPTION {
        uuid id PK
        uuid trainer_id FK
        string tier "free | pro"
        string provider "stripe | revenuecat"
        string provider_reference
        timestamp started_at
        timestamp renews_at
        boolean active
    }

    SAVED_TEAM {
        uuid id PK
        uuid trainer_id FK
        string name
        string context "raid | pvp_great | pvp_ultra | pvp_master"
        timestamp created_at
        timestamp updated_at
    }

    TEAM_MEMBER {
        uuid id PK
        uuid saved_team_id FK
        int pokemon_species_id FK
        int cp
        int hp
        int iv_attack
        int iv_defense
        int iv_stamina
        string fast_move
        string charge_move
        int slot_order
    }

    POKEMON_SPECIES {
        int id PK
        string name
        int generation
        text flavor_text
        string sprite_url
    }

    POKEMON_TYPE {
        int id PK
        string name
    }

    POKEMON_TYPE_MAP {
        int pokemon_species_id FK
        int pokemon_type_id FK
    }
```

## Notes

- `POKEMON_SPECIES`, `POKEMON_TYPE`, and `POKEMON_TYPE_MAP` are a **read-only cache** populated by
  the sync job described in [use-cases.md](use-cases.md) (UC-06) from PokéAPI/PoGo API — the
  backend is the source of truth for the mobile app's local cache, not the other way around.
- `TRAINER` and `SAVED_TEAM` only exist for Pro accounts; a Trainer using the app without signing
  in never has a row here, which keeps the LGPD footprint minimal for the free tier
  (see [legal-compliance.md](legal-compliance.md)).
