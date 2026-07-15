# Data layer

Concrete implementations of the repository interfaces declared in `use-cases/`: the Prisma-backed
repositories, the PokeAPI/PoGo API HTTP clients, and the scheduled sync job that refreshes the
local cache. This is the only layer allowed to import `@prisma/client` or make outbound HTTP calls.
cl