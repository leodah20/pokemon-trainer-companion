# Domain layer

Business rules with zero dependency on React Native components. Plain TypeScript only — e.g. the
IV calculation formula, type-effectiveness lookup, catch-rate formula. Shared conceptually with
`backend/src/domain` (same rules, same language, kept as separate copies for now since there's no
shared package set up yet — see `docs/coding-standards.md` for the layering rationale).
