# Coding Standards

All source code, identifiers, and comments are written in **English**, regardless of the spoken
language used in commit discussions or project planning. Principles below are summarized in our
own words from Robert C. Martin's *Clean Code* and *Clean Architecture*; no text is reproduced from
either book.

## Naming and functions

- Names say what something is or does; no abbreviations that need a mental decoder ring
  (`calculateIndividualValues`, not `calcIVs`).
- A function does one thing, at one level of abstraction. If describing it needs "and", split it.
- Prefer small, composable functions over long ones with internal section comments — the section
  comment is a signal the function should be split.

## Comments

- Code should read clearly enough that most lines need no comment.
- Write a comment only when it captures something the code itself can't: a non-obvious constraint,
  the reason for an unusual workaround, or a warning about a subtle edge case.
- Never leave a comment describing *what* the next line does if the line already says so.

## Architecture (Clean Architecture layering)

Both the mobile app and backend follow the same dependency rule: **inner layers never depend on
outer layers.**

```
domain/       <- entities + business rules (IV math, type effectiveness, subscription rules)
              plain Dart/TypeScript, no Flutter widgets, no NestJS decorators, no HTTP/SQL
use-cases/    <- application-specific orchestration of domain logic
data/         <- repository implementations (PokeAPI client, Postgres access, local DB access)
presentation/ <- UI (Flutter widgets) or delivery (NestJS controllers)
```

Concretely:

- Domain code (e.g. the IV calculator) has zero imports from Flutter, NestJS, or any specific
  database driver — it can be unit tested with plain values in and plain values out.
- Repository interfaces live in the domain/use-case layer; concrete implementations (PokeAPI HTTP
  client, Postgres repository) live in the data layer and are injected, so swapping a data source
  never touches business logic.
- Controllers/widgets only orchestrate: they call a use case and render its result, they don't
  contain business rules themselves.

## Formatting

- Mobile (Dart): `dart format`, enforced via `flutter analyze` in CI.
- Backend (TypeScript): Prettier + ESLint, enforced via a pre-commit hook and CI.
- No unformatted code is merged — formatting is automatic, not a review comment.

## Tests

- Domain and use-case layers require unit tests (they're pure functions, so this should be cheap).
- Repository implementations get integration tests against a real (containerized) database, not
  mocks, for anything involving data migrations or query correctness.
