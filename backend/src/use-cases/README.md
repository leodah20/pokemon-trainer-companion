# Use-cases layer

Application-specific orchestration of domain logic — e.g. `CalculateIvUseCase` takes raw input
(CP, HP, species id), calls into `domain/` for the math, and calls a repository interface (defined
here, implemented in `data/`) to fetch species base stats. Use cases don't know about HTTP,
NestJS decorators beyond `@Injectable()`, or Prisma.
