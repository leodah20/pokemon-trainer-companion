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
domain/       <- entities + business rules (IV math, type effectiveness, bulk calculation)
                plain TypeScript, no React Native imports, no NestJS decorators, no HTTP/SQL
use-cases/    <- application-specific orchestration of domain logic
data/         <- repository implementations (JSON file readers, Prisma service, API clients)
presentation/ <- UI components (React Native screens) or delivery (NestJS controllers)
```

Concretely:

- Domain code (e.g. the IV calculator) has zero imports from React Native, NestJS, or any specific
  database driver — it can be unit tested with plain values in and plain values out.
- Repository interfaces live in the domain/use-case layer; concrete implementations (JSON file
  readers, Prisma service, HTTP clients) live in the data layer and are injected, so swapping a
  data source never touches business logic.
- Controllers / screens only orchestrate: they call a use case and render its result, they don't
  contain business rules themselves.

## TypeScript specifics

- Use `readonly` on arrays and object properties that shouldn't be mutated.
- Prefer `interface` over `type` for object shapes; use `type` for unions and primitives.
- Use `as const` for literal constants (colors, spacing, enums).
- Avoid `any`. Use `unknown` when the type isn't known, then narrow it.

## File structure per feature

Keep files small and focused:

- One exported function or component per file (except barrel `index.ts` exports).
- Test files live next to their source file with a `.test.ts` suffix.
- Use barrel exports (`index.ts`) to simplify imports from each module.

## Formatting

- **Mobile (TypeScript/React Native):** Prettier + ESLint (see `.prettierrc.js` and `.eslintrc.js`)
- **Backend (TypeScript/NestJS):** Prettier + ESLint (see `backend/.prettierrc` and `backend/eslint.config.mjs`)
- No unformatted code is merged — formatting is automatic, not a review comment.

## Tests

- **Domain and use-case layers** require unit tests (they're pure functions, so this should be
  cheap).
- **Repository implementations** get integration tests against the real bundled JSON data (mobile)
  or a containerized database (backend).
- Test files use the pattern `*.test.ts` and are colocated with their source.
- Use `describe`/`it`/`expect` blocks following Jest conventions. Each test covers one scenario.
