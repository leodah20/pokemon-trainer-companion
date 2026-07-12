# Use-cases layer

Orchestrates domain logic for a specific screen/flow — e.g. `CalculateIvFromOcrUseCase` takes OCR
output, calls `domain/` for the math, and reads cached species data via a repository interface
implemented in `data/`.
