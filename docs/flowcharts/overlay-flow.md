# Overlay Flow

Covers UC-01 (calculate IVs from a screenshot) from [../use-cases.md](../use-cases.md).

```mermaid
flowchart TD
    A[Trainer opens the overlay] --> B[Screen region captured\nAndroid: floating overlay / iOS: shared screenshot]
    B --> C[On-device OCR extracts text\nML Kit Text Recognition]
    C --> D{OCR confidence\nabove threshold?}
    D -- yes --> E[Parse CP, HP, stardust cost]
    D -- no --> F[Prompt trainer for manual entry]
    E --> G[Look up species base stats\nfrom local cache]
    F --> G
    G --> H[Compute possible IV combinations]
    H --> I[Rank combinations by likelihood]
    I --> J[Render top result in the floating overlay]
    J --> K{Trainer feeds another\nscreenshot?}
    K -- yes --> B
    K -- no --> L[Dismiss overlay]
```

## Why OCR runs on-device

Sending the screenshot to a backend for OCR would mean transmitting and storing a frame of the
Pokémon GO client — unnecessary data handling, and it also removes the "never touches Niantic's
data" guarantee documented in [../legal-compliance.md](../legal-compliance.md). Running ML Kit
on-device keeps the screenshot local and keeps the backend out of the request path entirely for
this feature.
