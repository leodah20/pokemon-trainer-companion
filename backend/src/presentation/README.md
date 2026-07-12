# Presentation layer

NestJS controllers and DTOs. Controllers only orchestrate: parse the request, call a use case,
shape the response. No business rules live here — if a controller method needs an `if` that isn't
about HTTP status codes or input shape, that logic belongs in `use-cases/` or `domain/` instead.
