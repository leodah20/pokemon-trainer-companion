# Overlay Flow (flagship feature)

Covers UC-01 (calculate IVs and get contextual tips from a screenshot) and UC-01a (AI tip grounded
in real on-screen data) from [../use-cases.md](../use-cases.md). This is the project's flagship
flow — see [../architecture.md](../architecture.md) and the README's "🏆 Flagship feature" section.

```mermaid
flowchart TD
    A[Trainer opens the overlay] --> B["Screen region captured\n(today: gallery screenshot pick;\nfloating window + capture consent dialog\nscaffolded - live frame capture still to build)"]
    B --> C[On-device OCR extracts text\nML Kit Text Recognition]
    C --> D{OCR confidence\nabove threshold?}
    D -- yes --> E[Parse species, CP, HP]
    D -- no --> F[Show "couldn't read this image"]
    E --> G[Look up species base stats\nfrom local cache]
    G --> H[Compute IV combinations, PvP rankings,\nbulk percentile, rule-based suggestions]
    H --> I[Render analysis card]
    I --> J{Trainer taps\n"Ask AI ✨"?}
    J -- yes --> K["Send species + real OCR-extracted\nCP/HP/IVs + chosen context to\nCompanion AI endpoint"]
    K --> L["Companion service builds a grounded\nprompt (backend species/type/PvP/raid data +\nPokeAPI-sourced knowledge base, 251 species;\nplanned: deeper Bulbapedia-style facts)"]
    L --> M[LLM generates a contextual tip]
    M --> N[Render tip in the analysis card]
    J -- no --> O{Trainer feeds another\nscreenshot?}
    N --> O
    O -- yes --> B
    O -- no --> P[Done]
```

## Why OCR runs on-device

Sending the screenshot to a backend for OCR would mean transmitting and storing a frame of the
Pokémon GO client — unnecessary data handling, and it also removes the "never touches Niantic's
data" guarantee documented in [../legal-compliance.md](../legal-compliance.md). Running ML Kit
on-device keeps the screenshot local and keeps the backend out of the request path entirely for
this step — only the *result* of OCR (species/CP/HP, not the image) leaves the device, and only
when the trainer explicitly taps "Ask AI".

## Why the knowledge base is the next milestone, not the LLM call itself

The Gemini call already works and is grounded in real, on-screen stats — that part isn't generic.
What's still generic is the *knowledge* behind the answer: today the LLM falls back on its own
general training whenever the backend's structured species/type/PvP/raid data doesn't cover the
question. Replacing that with a knowledge base built from Bulbapedia/PokéAPI/community sources —
so the AI is answering from real, structured Pokémon knowledge instead of a best guess — is the
single highest-value piece of work left in the project.
