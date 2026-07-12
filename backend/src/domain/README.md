# Domain layer

Business rules and entities, with zero dependency on NestJS, Prisma, or HTTP. Plain TypeScript
classes/functions only, so they can be unit tested with plain values in and plain values out.

Examples of what belongs here: the IV calculation formula, the type-effectiveness lookup, the
catch-rate probability formula, the subscription tier rules.

See `../../../docs/coding-standards.md` in the repo root for the full reasoning.
