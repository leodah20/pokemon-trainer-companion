# Pokémon Trainer Companion

**The real-time, AI-powered overlay for Pokémon GO.**

While every trainer app on the store is another IV calculator with a different coat of paint,
PTC's actual goal is a floating overlay that reads your screen live and gives smart, contextual
tips as you play — capture advice, raid counters, PvP moves — backed by a knowledge base built
from public Pokémon data and kept fresh by the community, not by a wall of generic pop-up ads. The
trainer shouldn't have to think or tab out to a website; they should just catch Pokémon, learn the
lore, and let the app do the thinking. **That overlay + AI knowledge base is the project's
flagship feature and is actively in development** — see "🏆 Flagship feature" section
below. Everything else in this README (calculators, Pokédex, rankings) is the solid foundation
it's built on top of.

> **Fan project.** Not affiliated with, endorsed by, or sponsored by Niantic, The Pokémon Company,
> Nintendo, or Game Freak. Pokémon and Pokémon GO are trademarks of their respective owners. This
> project only reads what the trainer's device already displays on screen (via OCR) — it never
> logs in with a game account, reads game memory, or calls any Niantic server.

## 🏆 Flagship feature (in development): real-time AI overlay

The differentiator, not a footnote. A floating on-screen overlay that reads your device's screen
live via on-device OCR and gives contextual, non-generic advice for exactly the Pokémon and
situation in front of you:
whether to catch or pass, what to run in this raid, what moveset wins this PvP matchup. No login,
no game-memory access, no calls to Niantic's servers — see
[docs/legal-compliance.md](docs/legal-compliance.md).

Five pieces already work today, ahead of the fully automatic always-on overlay:
- **OCR pipeline** — gallery screenshot → species/CP/HP extraction → full analysis (IV, PvP, bulk,
  evolution, rule-based tips), demoed in `OverlayDemoScreen`
- **AI companion** — an optional Gemini-backed layer, grounded in the *real* OCR-extracted stats
  from your screen (not a generic "here's a Charizard fact"), reachable via "Ask AI ✨"
- **Knowledge base (MVP)** — the AI's answers are now grounded in real PokeAPI-sourced Pokedex
  facts (genus, habitat, official Pokedex flavor text) for all 251 Gen 1+2 species, instead of
  purely the LLM's own training — `backend/src/data/knowledge/`
- **Native floating window** — a real Android Kotlin module
  (`android/.../overlay/OverlayModule.kt`) draws a `SYSTEM_ALERT_WINDOW` overlay that floats over
  *any* app, not just PTC — verified by showing it, backgrounding to the home screen, and
  confirming it's still on top.
- **Screen capture consent flow** — the same module also round-trips Android's real
  `MediaProjectionManager` "Share your screen with PTC?" system dialog, verified on both the
  accept and deny paths.
- **Live screen capture** — a foreground service (`ScreenCaptureService.kt`) opens the actual
  `MediaProjection` session the consent dialog grants, backed by a `VirtualDisplay` +
  `ImageReader`, and grabs a real single frame on demand. That frame is saved as a PNG and fed
  through the *exact same* `analyzeScreenshot(uri)` pipeline the gallery-picker flow already uses
  — verified end to end on the emulator: the raw OCR text came back as a live, verbatim
  transcription of whatever was on screen at the moment of capture (down to the running
  recording-indicator timer), proving it's a genuine live frame, not a stub.

What's left to reach the full vision: wiring live capture into the actual floating overlay window
(right now it's a manual "analyze current screen" button in `OverlayDemoScreen`, not yet triggered
automatically/continuously from the overlay itself), and extending the knowledge base past Gen 2
and past PokeAPI's structured fields toward deeper community-sourced Pokémon knowledge (Bulbapedia
and similar), so the AI's answers keep getting richer instead of the same handful of facts
repeating. See "Post-beta scope" below for where this stands.

## Why this exists

A portfolio project built to exercise the full stack: mobile app, backend API, data modeling,
system design, and the non-technical work (legal/compliance research, documentation) that a real
product needs before it ships to app stores — with an actual product vision behind it, not just a
feature checklist.

## Core features

**Battle & stats (implemented)**
- IV calculator — brute-force search over 4096 IV combinations per trainer level, using observed CP and HP
- CP evolution / power-up cost simulator — stardust, candy, and XL candy costs from level 1 to 50
- PvP move rankings — PvPoke-sourced moveset scores for Great / Ultra / Master League
- Bulk percentile ranking — tankiness comparison (DEF + STA heuristic) against all 965 species
- Meta tier classification — scores classified as Top / Viable / Niche
- Raid counters — top 10 estimated counters per boss (11 Gen 1 bosses, tiers 1/3/5), with
  optional weather-boost adjustment
- Evolution chain viewer — full chain with stats and heuristic candy costs (Gen 1-2 coverage)
- Quick Actions HUD — pulsing floating action button (Pokédex screen) opens a spring-physics
  bottom sheet with shortcuts to every tool, staggered fade-in per item

**Partner Pokédex (implemented)**
- Pokémon detail screen with 8 lore categories: origin & inspiration, GO relevance, battle tips, easter eggs, GO vs main series differences, evolution costs, shiny rates
- Hand-written lore for all 151 Generation 1 species
- Intelligent fallback — auto-generated lore for unseeded species using existing stats
- Top rankings (ATK, DEF, STA, bulk, CP, PvP by league) and Quiz / trivia mode

**AI overlay (in progress — see "🏆 Flagship feature" section)**
- OCR pipeline (gallery screenshot → species/CP/HP → full analysis) — done
- Gemini-backed AI companion grounded in real on-screen stats — done
- Knowledge base (PokeAPI-sourced Pokedex facts for all 251 Gen 1+2 species — genus, habitat, official
  Pokedex entries — grounding the AI's answers) — MVP done, expanding coverage is ongoing
- Native always-on floating overlay (auto-capture, no gallery picker) — planned

**Planned features**
- Catch-chance calculator (throw type, curveball, berry)
- Cross-device sync for saved teams and settings

The whole app is free and open source — every feature above ships free, with no paid/subscription
tier. See [LICENSE](LICENSE) (MIT).

## How the "overlay" works (and why it's ToS-safe)

Screenshot capture + on-device OCR (Google ML Kit) feeds a floating overlay window — the same
approach used by established apps like Calcy IV and Poké Genie. No login, no memory reads, no
calls to Niantic's servers. See [docs/legal-compliance.md](docs/legal-compliance.md) for the full
reasoning.

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Mobile | React Native 0.86 (TypeScript, bare workflow) | Bare workflow because overlay + ML Kit OCR need a custom native module |
| Navigation | `@react-navigation/native-stack` + `@react-navigation/bottom-tabs` | Bottom tab bar (Pokedex/Tools/Rankings/Quiz/More) for primary navigation; a root stack pushes detail/tool screens full-screen over the tab bar from any tab |
| State | Local (useState/useMemo/useRef) | No global state library — static data loaded from bundled JSON |
| Backend | NestJS 11 (TypeScript) | Clean Architecture-friendly module/DI structure |
| ORM | Prisma 7 | Schema-first modeling, migrations, typed client |
| Database | PostgreSQL 16 | Saved teams, user accounts (for future cross-device sync) |
| Data sources | [PoGo API](https://pogoapi.net/) (stats, CP multipliers), [PvPoke](https://pvpoke.com/) (PvP movesets), [PokéAPI](https://pokeapi.co/) (sprites) | All free, unofficial/open-source, community-maintained |

## Project status

**v1.0 Beta.** Every planned battle-stat calculator, PvP tool, and reference screen (type chart,
rankings, raid counters, evolution chain, quiz) is implemented, tested, and verified on a physical
device, fully translated (English/Portuguese/Spanish) including lore content, and has accessibility
labels on interactive elements. The native floating overlay, a deeper community-sourced knowledge
base, cross-device sync, and dark mode are intentionally out of scope for this beta — see
"Post-beta scope" below.

<!-- ==================== PROGRESS OVERVIEW ==================== -->

Progress: 94% ███████████████████░ (34 / 36 features)

| Category | Feature | Status | Tests |
|----------|---------|--------|-------|
| **Pokédex** | List with search + gen/type filters + animated background | ✅ Done | ✅ |
| | Detail screen (stats, PvP, battle role, power-up cost) | ✅ Done | — |
| **Calculator** | IV calculator (brute-force 4096 combos) | ✅ Done | ✅ |
| | Power-up cost simulator (stardust/candy/XL) | ✅ Done | ✅ |
| | Bulk percentile ranking (DEF+STA heuristic) | ✅ Done | ✅ |
| **PvP** | Move rankings by league (Great/Ultra/Master) | ✅ Done | ✅ |
| | Meta tier classification (Top/Viable/Niche) | ✅ Done | ✅ |
| **Lore** | Hand-written lore for 151 Gen 1 species (8 fields each) | ✅ Done | — |
| | Intelligent fallback for unseeded species (localized per language) | ✅ Done | ✅ |
| | Lore content translated EN/PT-BR/ES (Gemini batch translation) | ✅ Done | ✅ |
| **Backend** | Skeleton (NestJS + Prisma schema + logging) | ✅ Done | ✅ |
| | Species REST API (endpoints + Swagger) | ✅ Done | — |
| | Type Chart API (`/api/type-chart`, `/:type`, `/weather/boosts`) | ✅ Done | ✅ |
| | PvP API (`/api/pvp/leagues`, `/top/:league`) | ✅ Done | ✅ |
| | Raids API (`/api/raids/current`, `/:id/counters`) | ✅ Done | ✅ |
| | Companion AI API (`POST /api/companion/suggest`, Gemini-backed) | ✅ Done | ✅ |
| **Mobile** | Type effectiveness chart (attacker vs. all 18 types) | ✅ Done | — |
| | Pokémon comparison tool (side-by-side stats) | ✅ Done | ✅ |
| | Top rankings (ATK/DEF/STA/Bulk/Max CP/PvP by league) | ✅ Done | ✅ |
| | Quiz / trivia mode | ✅ Done | ✅ |
| | Raid counters with DPS estimates | ✅ Done | ✅ |
| | Evolution chain viewer with costs | ✅ Done | ✅ |
| | In-app Companion widget (avatar + speech bubble, rule-based + optional AI) | ✅ Done | — |
| | Professor Mode — open-ended multi-turn AI chat (`POST /api/companion/chat`) | ✅ Done | ✅ |
| | i18n (English/Portuguese/Spanish) — every screen + lore content | ✅ Done | ✅ |
| | Accessibility labels (accessibilityRole/Label/State on interactive elements) | ✅ Done | — |
| | App-wide Error Boundary (recoverable crash fallback, no blank white screen) | ✅ Done | ✅ |
| | AsyncStorage persistence (language choice, last IV Calculator search) | ✅ Done | ✅ |
| **🏆 Flagship** | OCR engine + rule-based smart suggestions (gallery screenshot → species/CP/HP → evolve/PvP/raid/gym advice) | ✅ Done | ✅ |
| | Gemini-backed AI companion grounded in real on-screen stats | ✅ Done | ✅ |
| | Knowledge base grounding the AI (PokeAPI-sourced, all 251 Gen 1+2 species) | ✅ MVP done | ✅ |
| | Floating overlay window (native Android module, permission + WindowManager) | ✅ Scaffolding done | — |
| | Screen capture consent flow (`MediaProjectionManager`, verified both accept/deny paths) | ✅ Scaffolding done | — |
| | Floating overlay live capture (foreground service + frame capture → OCR pipeline) | ✅ Done | — |
| | Knowledge base — expand past Gen 2 + deeper Bulbapedia-sourced facts | 🔄 Planned | — |
| **Future** | Cross-device sync + authentication | ❌ Not started | — |

### Post-beta scope

Deliberately deferred past this beta — not gaps, just not yet prioritized:

- **🏆 The flagship real-time AI overlay** — this is the project's actual differentiator (see
  "Flagship feature" above), not a nice-to-have, and it's split into two remaining pieces:
  - **Native floating overlay + live capture — done, wiring into the always-on overlay is next.**
    The OCR engine itself works today (gallery screenshot → species/CP/HP → full analysis). A real
    native Android Kotlin module (`android/.../overlay/OverlayModule.kt` + `OverlayPackage.kt`,
    registered in `MainApplication.kt`) requests the `SYSTEM_ALERT_WINDOW` permission and draws a
    genuine `TYPE_APPLICATION_OVERLAY` floating window — verified on-device: shown, backgrounded to
    the home screen, still floating on top, then hidden cleanly. The same module also round-trips
    Android's real `MediaProjectionManager` screen-capture consent dialog — verified on both the
    accept and deny paths, resolving correctly back to JS each time. A foreground service
    (`ScreenCaptureService.kt`) now opens the actual `MediaProjection` session from that consent and
    grabs a real frame via `VirtualDisplay` + `ImageReader` on demand, saving it as a PNG and feeding
    it through the same `analyzeScreenshot(uri)` pipeline the gallery-picker flow uses — verified
    end to end on the emulator (the OCR'd text came back as a live transcription of the actual
    on-screen UI, not a stub). `mobile/src/data/overlay/overlayBridge.ts` exposes all of this to JS,
    with a manual "Analyze current screen" test card in `OverlayDemoScreen`. What's still not built:
    triggering that capture automatically/continuously from the floating overlay window itself
    (right now it's a manual button in the demo screen, not a live loop feeding the overlay's own
    UI), and rendering real analysis results inside the floating window instead of the static
    placeholder label
  - **Knowledge base — MVP done, deepen next.** The free, rule-based path
    (`generateSmartSuggestions.ts` in the OCR flow, `buildDialogue` in the Companion widget) stays
    as the always-available default that needs no network. An optional real LLM layer
    (`POST /api/companion/suggest`, Gemini free tier, wired into "Ask AI ✨") sits on top for
    trainers who set up a `GEMINI_API_KEY`. It's now grounded in a real knowledge base
    (`backend/src/data/knowledge/`, ingested from PokeAPI via `backend/scripts/fetchKnowledgeBase.mjs`)
    covering genus, habitat, and official Pokedex flavor text for all 251 Gen 1+2 species — instead
    of relying purely on Gemini's own training. Still to do: extend past Gen 2 (re-run the
    ingestion script with a wider ID range, tracking the backend's species database as it grows)
    and pull in richer, community-sourced facts (Bulbapedia-style) beyond what PokeAPI's
    structured fields cover
- **Cross-device sync + auth** — backend schema exists (`Trainer`, `SavedTeam`), no endpoints yet.
  Auth method decided: **Google Sign-In**, not email/password (see
  [docs/legal-compliance.md](docs/legal-compliance.md) §3) — blocked on the project owner creating
  OAuth client credentials in Google Cloud Console before implementation can start
- **Remaining i18n gaps (deliberate)** — quiz question content (`generateQuiz.ts`) and Pokemon
  type names (Fire, Water, etc.) are left untranslated on purpose. Everything else — every screen's
  UI chrome and the full lore-data.json content (151 species × 7 fields) — is now translated across
  English/Portuguese/Spanish via a Gemini batch translation script
  (`mobile/scripts/translateLoreData.mjs`), resumable and incremental so a rate limit or parse
  hiccup mid-run doesn't lose progress.
- **Dark mode** — `useColorScheme` is read in `App.tsx` but not wired into the theme yet
- **Extra content cards** (Fase 5 of the original roadmap) — Rarity & Spawn, Best PvP League +
  IV spread, Buddy & Candy distance, Legacy Moves — need new data sources, not just UI work
- **Raid boss rotation / PvP rankings** are curated mocks (documented in-code), not live-synced —
  Fase 2.6's scheduled sync job was never built
- **Dark mode** deferred a second time — `useColorScheme` is still only read, not wired into a
  theme. Turns out to be a much bigger lift than it looks: `COLORS` is a static object imported
  directly by nearly every screen's module-scope `StyleSheet.create()`, so real runtime theme
  switching means refactoring every one of those call sites to a reactive theme hook — too large
  and too visually risky to do without a device to check every screen against, so left for a
  dedicated pass

### Last implemented features

> <time datetime="2026-07-16">2026-07-16</time>
>
> **Live screen capture — the overlay reads a real frame, not just a static placeholder:**
> - New `ScreenCaptureService.kt`, a foreground service (`android:foregroundServiceType="mediaProjection"`)
>   that opens the actual `MediaProjection` session using the consent token `OverlayModule.kt`'s
>   existing dialog already grants (previously discarded — now kept and passed through). A
>   `VirtualDisplay` backed by an `ImageReader` mirrors the screen; `captureLatestFrame()` pulls
>   whatever frame is currently available.
> - `OverlayModule.kt` gained `startLiveCapture()`, `captureLiveFrame()` (saves the frame as a PNG
>   in the app's cache dir and resolves a `file://` URI), and `stopLiveCapture()`.
> - Deliberately single-frame-on-demand, not continuous video streaming — the OCR pipeline only
>   ever needs one still frame at a time, so this avoids the extra complexity and battery cost of a
>   real-time video pipe across the RN bridge.
> - The returned URI is the same shape `analyzeScreenshot(uri)` already expects from the
>   gallery-picker flow, so zero changes were needed to the OCR/IV/PvP/bulk analysis pipeline
>   itself — only `OverlayDemoScreen` gained a small live-capture UI (start/analyze/stop) reusing
>   the existing result card.
> - Hit and fixed a real Android API requirement along the way: newer Android versions throw
>   `IllegalStateException: Must register a callback before starting capture` unless
>   `MediaProjection.registerCallback(...)` is called before `createVirtualDisplay()` — see
>   `docs/debug-log.md`.
> - Verified end-to-end on the emulator with "Share entire screen" consent: tapped "Analyze current
>   screen" while looking at the app itself, and the raw OCR text came back as a live, verbatim
>   transcription of the actual on-screen UI at that instant (down to the running recording-indicator
>   timer) — proof it's a genuine live frame, not a stub.
>
> <time datetime="2026-07-16">2026-07-16</time>
>
> **Professor Mode keyboard fix, take two — the first fix wasn't actually enough:**
> - The `behavior: 'height'` fix documented below tested clean on typecheck/tests but the keyboard
>   *still* covered the chat input when verified on a physical device — `KeyboardAvoidingView`
>   inside a React Navigation native-stack screen (react-native-screens renders each screen in its
>   own native Fragment) doesn't reliably pick up `android:windowSoftInputMode="adjustResize"` the
>   way it would in a plain Activity.
> - Real fix: dropped `KeyboardAvoidingView` on Android entirely in favor of manually tracking
>   keyboard height via `Keyboard.addListener('keyboardDidShow'/'keyboardDidHide', ...)` and
>   applying it as `paddingBottom` on the screen's container. iOS keeps using
>   `KeyboardAvoidingView` (no evidence it has the same issue there).
> - **Verified live on a physical device** — confirmed working after this change, not just
>   assumed from the first (insufficient) fix. `docs/debug-log.md` updated to reflect what
>   actually worked, not just what was tried first.
>
> **Professor Mode — open-ended, multi-turn AI chat:**
> - New `POST /api/companion/chat` endpoint: unlike `/companion/suggest` (a one-shot suggestion
>   tied to a specific species), this accepts the full conversation history (oldest first, ending
>   with the newest user message) and forwards it to Gemini's `contents` array natively, so the
>   model has real multi-turn context — not prompt-stuffed history, an actual back-and-forth
>   conversation. `buildChatSystemPrompt.ts` frames the assistant as a friendly Pokemon GO expert
>   that can discuss anything Pokemon-related, not just deliver canned suggestions.
>   `geminiClient.ts` was refactored to share its HTTP/error-handling logic between the existing
>   one-shot `generateCompanionSuggestion` and the new multi-turn `generateChatReply`.
> - New `ProfessorChatScreen` — a real chat UI (message bubbles, text input, send button, loading
>   state) reachable via a new "🎓 Professor Mode" button inside the Companion widget's speech
>   bubble, alongside the existing "Ask AI ✨" one-shot suggestion. The product framing (the
>   user's own words): "Companion Mode" is the existing rule-based/one-shot tips, "Professor Mode"
>   is the full chat session.
> - `CompanionWidget` needed `useNavigation()` to open the chat screen, which meant moving it
>   inside `<NavigationContainer>` in `App.tsx` (it was a sibling before) — and the widget's own
>   floating avatar/bubble is now hidden while `ProfessorChat` is the active screen, since it was
>   confusingly floating on top of the chat transcript otherwise (a real bug found testing on a
>   physical device, fixed the same session).
> - Two more real bugs found via physical-device testing, both fixed the same session: the
>   keyboard covered the chat input on Android (`KeyboardAvoidingView`'s `behavior` was `undefined`
>   on Android — changed to `'height'`), and Gemini's `**bold**` Markdown rendered as literal
>   asterisks (added `react-native-markdown-display` — pure JS, no native code, so no rebuild
>   needed — and a `markdownStyles` object matching the app's theme).
> - Verified live end-to-end on a physical device: asked the Professor a real PvP question in
>   Portuguese, got a detailed, well-formatted, conversational reply that asked a natural follow-up
>   question back — not a canned response.
> - `jest.config.js` needed `react-native-markdown-display` and its `react-native-fit-image`
>   dependency added to `transformIgnorePatterns`' exception list (same recurring pattern as
>   `@react-native-async-storage` earlier — see docs/debug-log.md).
>
> **Screen capture consent flow — the next brick after the floating window:**
> - Extended `OverlayModule.kt` with `requestScreenCapturePermission()`, which launches Android's
>   real `MediaProjectionManager.createScreenCaptureIntent()` — the actual "Share your screen with
>   PTC?" system dialog every screen-recording app has to get through. Implemented via
>   `ActivityEventListener` (registered in the module's `init` block) so the result of that
>   system dialog round-trips back to a JS `Promise` correctly.
> - **Verified live on-device, both paths**: requested the permission, hit "Cancel" on the real
>   system dialog, confirmed the JS side resolved to "denied"; requested again, went through
>   "Share one app" → picked an app → confirmed the JS side resolved to "granted". Neither path
>   actually opens a capture session yet — the `Intent` data Android hands back on approval is
>   deliberately discarded for now, this only proves the consent round-trip works.
> - Manifest gained `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_MEDIA_PROJECTION` permissions ahead
>   of the foreground service that will actually run the capture session — declared now so that
>   piece doesn't need its own manifest change later.
> - New "Request screen capture consent" button in the same `OverlayDemoScreen` experimental card.
> - 23/23 mobile test suites passing, Kotlin compiled clean after two small signature fixes
>   (`ActivityEventListener`'s callback params are non-null, not nullable).
>
> **Native overlay window scaffolding — the flagship feature's biggest remaining piece, started:**
> - A real native Android Kotlin module: `android/.../overlay/OverlayModule.kt` requests the
>   `SYSTEM_ALERT_WINDOW` permission (via `Settings.ACTION_MANAGE_OVERLAY_PERMISSION`, since
>   Android requires a user-driven grant, not a normal runtime prompt) and draws a genuine
>   `TYPE_APPLICATION_OVERLAY` floating window via `WindowManager`. `OverlayPackage.kt` registers
>   it as a NativeModule; `mobile/src/data/overlay/overlayBridge.ts` exposes
>   `hasOverlayPermission()`/`requestOverlayPermission()`/`showTestOverlay()`/`hideTestOverlay()`
>   to JS, safely no-op on iOS or if the module isn't linked.
> - Deliberately scoped down: this only proves the permission flow and a floating window work —
>   it draws a static placeholder label, not live screen content. `MediaProjection` capture (its
>   own foreground service + capture lifecycle) is separate, larger, real remaining work.
> - **Verified live on-device, not just typecheck**: granted the permission, showed the test
>   overlay, pressed the home button to background the app entirely, confirmed the overlay was
>   still floating on top of the Android home screen, then returned to the app and hid it cleanly.
>   This is the actual "floats over any app, not just PTC" behavior the flagship feature needs.
> - A new "Native overlay (experimental)" card in `OverlayDemoScreen` exercises this — grant
>   permission, show/hide the test window — gated behind `isOverlaySupported()` so it's invisible
>   on iOS.
> - 23/23 mobile test suites still passing; native module changes required a full Gradle rebuild
>   (Kotlin compiled clean on the first attempt) and reinstall to pick up the new permission and
>   registered package.
>
> **Companion avatar position bug fix + AsyncStorage persistence:**
> - Fixed a real bug reported by the user via a screen recording on a physical device: closing the
>   Companion widget's speech bubble made the floating avatar jump to align with where the
>   bubble's top edge used to be (and could push it off-screen if dragged near the bottom). Root
>   cause: the bubble was a normal-flow sibling stacked *above* the avatar in a column, so its
>   presence/absence changed the column's total height — and since a single `Animated.ValueXY`
>   translates the whole column's position, toggling the bubble effectively moved the avatar too.
>   Fixed by making the bubble `position: 'absolute'`, anchored above the avatar instead of pushing
>   it — the avatar's position no longer depends on the bubble's visibility at all.
> - Added `@react-native-async-storage/async-storage` (official RN community package) to persist
>   the trainer's language choice and their last IV Calculator search (species + CP/HP/level
>   range), both previously reset to defaults on every app restart. `mobile/src/data/storage/appStorage.ts`
>   wraps every read/write as best-effort (a storage failure falls back to in-memory defaults
>   rather than crashing or blocking a screen).
> - Verified end-to-end on a fresh emulator install: switched language to Portuguese, force-stopped
>   the app process, relaunched, and the language was still Portuguese — confirming the persistence
>   round-trip actually works, not just that it typechecks.
> - 23/23 mobile test suites passing (82 tests, 2 new test files for the storage layer and its
>   `LanguageContext` integration), zero TypeScript errors.
>
> **Full lore content translation (EN/PT-BR/ES) + accessibility labels across the app:**
> - `lore-data.json` (151 Gen 1 species × 7 fields, previously Portuguese-only regardless of
>   selected language) is now translated into English and Spanish via
>   `mobile/scripts/translateLoreData.mjs` — a resumable, incremental Gemini batch-translation
>   script (writes progress after every species, so a rate limit or a malformed JSON response
>   mid-run never loses completed work; a balanced-brace JSON parser was needed after the naive
>   first-`{`-to-last-`}` approach broke on responses where the model echoed a second object).
>   `loreRepository.ts` now keys lookups by language (`getLoreForSpecies`/`getLoreWithFallback`
>   both take a `SupportedLanguage`), and the procedural fallback lore generator — which was still
>   hardcoded Portuguese even in English/Spanish mode, a real gap found while doing this work — now
>   has hand-translated templates per language too.
> - Fixed a second, related gap: the Companion widget's speech-bubble dialogue labels ("About",
>   "In GO", "Battle tip", "Fun fact", "✨ AI Tip") and the Pokedex's Quick Actions sheet
>   (title + 6 item labels) were still hardcoded English — both now use `t()`.
> - **Accessibility pass** — added `accessibilityRole`/`accessibilityLabel`/`accessibilityState` to
>   every interactive `Pressable` across all 15 screens/components that have one (buttons, list
>   rows, filter chips, toggle groups, text inputs), reusing existing translated strings as labels
>   so the two efforts reinforce each other instead of duplicating text.
> - **App-wide Error Boundary** — a class-component `ErrorBoundary` now wraps the whole app in
>   `App.tsx` (outside `LanguageProvider`, so a crash in the translation context itself still
>   recovers), showing a "Try again" fallback screen instead of a blank white crash. Fallback copy
>   is deliberately plain English, not run through `t()` — the crash UI can't depend on the same
>   context tree that might be the thing crashing.
> - 21/21 mobile test suites passing (74 tests total: 1 new `loreRepository.test.ts` covering
>   per-language lookups and localized fallback text, 1 new `ErrorBoundary.test.tsx`), zero
>   TypeScript errors.
> - **Knowledge base extended to all 251 Gen 1+2 species** — re-ran
>   `backend/scripts/fetchKnowledgeBase.mjs` with its ID range tracking the backend's own species
>   database (`speciesDatabase.ts` covers Gen 1+2) instead of the mobile lore's Gen-1-only scope,
>   since the knowledge base only needs a species to exist in the backend's data to ground the AI.
>   Verified live against the running backend (`POST /api/companion/suggest` for Cyndaquil #155,
>   a Gen 2 species, returns a real grounded Gemini response). 24/24 backend tests still passing.
>
> **Knowledge base MVP — the flagship AI overlay's first real grounding source:**
> - New `backend/src/data/knowledge/` — a PokeAPI-sourced knowledge base (genus/species
>   classification, habitat, capture rate, growth rate, egg groups, legendary/mythical flags, and
>   up to 3 deduplicated official Pokedex flavor-text entries per species) covering the 151 Gen 1
>   species, matching the existing lore scope.
> - `backend/scripts/fetchKnowledgeBase.mjs` — a one-off ingestion script (plain Node + native
>   `fetch`, no new dependency) that pulls this from PokeAPI's public, unauthenticated API and
>   writes a committed `.ts` data module — re-run it to refresh or extend the ID range to later
>   generations. Not called at runtime, so the backend stays offline-safe for every other request.
> - `KnowledgeRepository` (same in-memory `Map`-over-static-data pattern as `SpeciesRepository`)
>   and `buildCompanionPrompt.ts` now accepts an optional `KnowledgeEntry`, folding a short
>   "Knowledge base" fact line and one official Pokedex quote into the Gemini prompt when
>   available — closing the exact gap flagged in the doc rewrite from earlier tonight ("today it's
>   a thin pass-through to a general-purpose model, not yet backed by a knowledge base").
> - Verified end-to-end against the running backend: `POST /api/companion/suggest` for Bulbasaur
>   returns a real Gemini response built from the grounded prompt, not just a typecheck pass.
> - 26/26 backend tests passing (2 new spec files), zero TypeScript errors.
> - **Still not done:** extending past Gen 1 (script supports it, just needs a wider ID range run)
>   and going beyond PokeAPI's structured fields into deeper, community-sourced facts
>   (Bulbapedia-style trivia) — see "Post-beta scope".
>
> **Full i18n coverage — every remaining screen translated (EN/PT-BR/ES):**
> - Finished the i18n pass across the whole app: IV Calculator, Comparison, Type Chart, Top
>   Rankings, Raid Counters (including a weather-label bug fix — "PartlyCloudy" was rendering with
>   no space), Evolution Chain, Quiz, and Overlay Demo are now all fully translated — every
>   hardcoded string replaced with `t()` calls across ~100 new i18n keys.
> - `PVP_LEAGUE_LABELS` / `META_TIER_LABELS` / `BULK_TIER_LABELS` usage in Overlay Demo switched
>   from the hardcoded English domain constants to the same `pvpLeague.*`/`metaTier.*`/`bulkTier.*`
>   i18n keys already used by PokemonDetailScreen, so the AI-scan result card translates too.
> - **Still not translated (deliberately out of scope for this pass):** the lore CONTENT itself
>   (`lore-data.json`, ~150 species × 7 fields of hand-written Portuguese text), quiz question
>   content (`generateQuiz.ts`), and Pokemon type names (Fire, Water, etc.) — see "Post-beta scope".
> - 63/63 mobile tests passing, zero TypeScript errors.
>
> **PokemonDetailScreen fully translated (EN/PT-BR/ES):**
> - Fixed the exact gap a user found: the "Lore & Trivia" card's category labels (Origem &
>   Inspiração, Dica de Batalha, etc.) were hardcoded Portuguese no matter the selected language.
>   Now every string on the screen is translated — stats, PvP moveset, battle role toggle,
>   power-up cost, all 7 lore categories, both buttons — via 30+ new i18n keys.
> - `PVP_LEAGUE_LABELS` / `META_TIER_LABELS` / `BULK_TIER_LABELS` moved out of hardcoded domain
>   constants into the i18n dictionaries (`pvpLeague.*`, `metaTier.*`, `bulkTier.*`), so they
>   translate too instead of always showing English.
> - `t()` now supports basic `{{param}}` interpolation (level numbers, percentages, scores).
> - **Still not translated:** the lore CONTENT itself (`lore-data.json`, ~150 species × 7 fields
>   of hand-written Portuguese text) and the remaining screens (IV Calculator, Comparison, Type
>   Chart, Rankings, Raid Counters, Evolution Chain, Quiz, Overlay Demo). Both are the next i18n
>   step — see "Post-beta scope".
> - 63/63 mobile tests passing, zero TypeScript errors.
>
> **i18n infrastructure — English, Portuguese, Spanish:**
> - New lightweight system in `mobile/src/i18n/` — a typed dictionary + React Context, not a new
>   dependency like i18next. `TranslationKeys` is a compile-time-enforced interface, so a missing
>   key in any of the 3 language files fails the build instead of silently falling back at runtime.
> - Translated: bottom tab labels, Pokedex (title, search, filter chips, empty state), Tools hub
>   (all 4 tool cards), More (title, Overlay Demo card, footer + new language switcher), and the
>   Companion widget (Ask AI states, species picker).
> - No device-locale auto-detection (would need a new native dependency); defaults to English,
>   remembered for the session only.
> - Deliberately not in this pass: the remaining screens and the lore content itself — see
>   "Post-beta scope".
>
> **Fixed a real bug: OCR never matched CP/HP on an actual Pokemon GO screen:**
> - Found via a real device screenshot's OCR debug output. Two separate bugs: (1) CP regex only
>   recognized the English label "CP" — Portuguese Pokemon GO shows `PC3975` ("Poder de Combate"),
>   no English text anywhere; (2) HP regex assumed `HP: 111` (label before the number), but the
>   game actually renders `175 / 175 HP` — a current/max pair with the label *after*, in English
>   and Portuguese alike (`175 / 175 PS`, "Pontos de Saúde"). The original pattern likely never
>   matched on a real screen regardless of language.
> - Both label sets are now tried, prioritizing the real "number/number label" layout. 3 new
>   tests built from actual OCR text off a real screenshot (63/63 mobile passing).
>
> **Companion AI grounded in real screen data (not a generic default):**
> - Until now, "Ask AI" only lived on the Companion widget and talked about whichever species the
>   trainer manually picked as their buddy, with a hardcoded `general` context — completely
>   disconnected from anything actually on screen.
> - `OverlayDemoScreen` now has its own "Ask AI" flow: after OCR reads a screenshot, the trainer
>   picks a context (raid/battle/capture/levelup/general) and the AI call uses the **species and
>   stats that screenshot actually extracted** (CP/HP/best IV match, via new
>   `buildCompanionExtraContext.ts`) — so the answer is about the real scanned Pokémon, grounded
>   in real numbers, not generic or disconnected advice.
> - 3 new tests (61/61 mobile passing).
>
> **Fixed a real bug: every backend route was double-prefixed (`/api/api/...`):**
> - Every controller declared `@Controller('api/xxx')` on top of `main.ts`'s global `api` prefix
>   — the actual served path was `/api/api/species`, `/api/api/companion/suggest`, etc. Went
>   unnoticed because manual `curl` testing happened to type the (wrong) double path correctly;
>   surfaced as a real 404 once the mobile Companion AI client (which assumed the correct
>   single-prefixed path) hit it from the physical device.
> - Fixed all five controllers (species, type-chart, pvp, raids, companion) to declare just their
>   own segment. Verified with a real Gemini API key: `POST /api/companion/suggest` now returns
>   sensible, context-varying advice (raid vs. battle vs. capture), and the old
>   `/api/api/species/1` correctly 404s while `/api/species/1` returns 200.
> - `mobile/src/config.ts` now reaches the backend via `localhost` + `adb reverse tcp:3000
>   tcp:3000` (same pattern as Metro's port 8081) instead of the emulator-only `10.0.2.2` alias.
>
> **Companion widget: draggable avatar:**
> - The floating avatar can now be dragged anywhere on screen (RN core `PanResponder`, no new
>   dependency — same "avoid Reanimated/gesture-handler unless needed" call as the rest of the
>   redesign). Starts bottom-left, clamped to stay fully on-screen on release, with a small
>   spring settle.
> - A plain tap still opens the speech bubble normally — `onMoveShouldSetPanResponder` only
>   claims the gesture once the touch moves past a small threshold, so short taps pass through
>   to the avatar's `Pressable` untouched. Verified on the physical device: both tap-to-open and
>   drag-to-reposition work correctly (a synthetic `adb shell input swipe` test was inconclusive
>   — too few intermediate touch samples for RN's responder system — real-finger testing confirmed it).
>
> **Mobile ↔ Companion AI wiring:**
> - `CompanionWidget`'s speech bubble now has an "Ask AI ✨" button — calls the backend's
>   `POST /api/companion/suggest` and appends the result as a new page in the dialogue cycle
> - New `mobile/src/data/companion/companionApiClient.ts` and `mobile/src/config.ts` — this is
>   the **first and only** network call anywhere in the mobile app (everything else is offline);
>   `config.ts` documents how to point it at the emulator (`10.0.2.2`) vs. a physical device
>   (dev machine's LAN IP)
> - Fails gracefully: no backend running, no `GEMINI_API_KEY`, or no network all surface as a
>   small inline error with a "Retry" button — the rest of the companion (and the whole app)
>   keeps working normally either way
> - `docs/architecture.md` and `docs/dev-setup.md` updated to reflect this as the one deliberate
>   exception to offline-first
>
> **In-app Companion widget + backend Companion AI endpoint:**
> - New `CompanionWidget` (mobile) — a Paimon-style floating buddy avatar rendered once at the
>   App root (persists across every screen), gentle idle bounce, tap opens a speech bubble
>   cycling through lore/tips, long-press opens a search picker to change the favorite species.
>   Entirely rule-based (reuses `lore-data.json` / `getLoreWithFallback`), no network call.
> - New backend `POST /api/companion/suggest` — takes `{ speciesId, context, extra? }`
>   (`context` is `raid`/`battle`/`capture`/`levelup`/`general`) and returns an AI-generated tip
>   from Gemini. `buildCompanionPrompt.ts` assembles the prompt from data the backend already
>   has (stats, types, evolution family, counters, PvP rankings) — no scraped knowledge base yet.
> - `geminiClient.ts` calls Gemini's REST API directly (no SDK dependency) and defaults to the
>   Flash-Lite model, which sits inside Gemini's free tier (1,500 requests/day, no credit card)
>   for normal personal use. Missing `GEMINI_API_KEY` degrades to a clean 503, not a crash.
> - Chosen explicitly over self-hosting an open-source LLM (would cost more in server/hosting
>   than the free tier ever would) and over Rasa (a chatbot-intent framework, not a generative
>   LLM — doesn't fit this use case at all)
> - 6 new backend tests (20/20 backend passing) covering prompt construction and the
>   not-configured error path without needing a real API call
> - Not yet done: wiring this endpoint into the mobile app (currently backend-only, no UI calls
>   it), and the Bulbapedia/PokeAPI-sourced knowledge base for richer answers
>
> **OCR pipeline: rule-based smart suggestions (no LLM):**
> - New `generateSmartSuggestions.ts` — turns a scanned Pokemon into actionable advice: evolve
>   for +X ATK (with candy cost), best PvP league + meta tier, which raid-boss types it counters,
>   whether it's gym-defender material — all derived from data the app already computes (type
>   chart, PvP scores, bulk percentile, evolution chain)
> - Explicitly chosen over a real LLM integration: no API key, no per-call cost, no network
>   request, no screen data leaving the device — keeps the app's offline-first design intact
> - Wired into `analyzeScreenshot.ts` and surfaced in `OverlayDemoScreen` under a new
>   "WHAT TO DO WITH IT" section
> - 6 new tests (58/58 mobile tests passing), verified the screen renders without crashing on
>   the Android emulator; full species-recognition verification needs a real Pokemon GO
>   screenshot, which requires the user's phone
> - The floating overlay (auto-capture instead of picking from gallery) is still native Android
>   work not yet started — see "Post-beta scope"
>
> **Local dev: Android emulator as default target:**
> - Documented and started using the `pokemon_trainer_companion` AVD that existed but was never
>   actually used — installs and runs the full app without needing a physical phone connected
>
> **v1.0 Beta cut — final bug pass:**
> - Fixed a real bug in the IV Calculator: level range inputs rejected every decimal (`25.5`),
>   even though Pokemon levels legitimately go in 0.5 increments — `Number.isInteger` was too
>   strict. New `parseLevel()` accepts positive multiples of 0.5; CP/HP fields are unaffected
>   (those are always whole numbers). Switched the level fields to a `decimal-pad` keyboard.
> - Verified `cpMultiplier.ts`'s table (levels 1-45) is actually complete, not an unfinished gap:
>   fetched the cited source (PoGo API) directly and confirmed it doesn't publish 45.5-50 either —
>   `findIndividualValueCombinations` already bounds its search to known levels, so this was
>   never a crash risk, just a documentation clarification.
> - Backend + mobile: **66/66 tests passing** (14 backend, 52 mobile), zero TypeScript errors.
> - Declared this the v1.0 Beta cut — see "Post-beta scope" above for what's deliberately deferred.
>
> **Design: PTC rebrand + Pokedex chrome polish:**
> - New in-app logo wordmark "PTC" (gold, thick outline shadow) replaces "Professor Dex"
>   everywhere: header logo, Pokedex screen title, Android launcher label, More screen footer.
>   Full name "Pokemon Trainer Companion" kept for docs/store copy (`APP_FULL_NAME` in
>   `theme/Logo.tsx`)
> - Tightened the header-to-search-bar gap and shrunk the Gen/Type filter chips further
>   (smaller padding/font/height) so more fit per row and the edge-peek cutoff is less jarring
> - Softened the bottom tab bar to a translucent glass panel (was solid white) and gave the
>   Pokedex list generous extra bottom padding, so the last row scrolling near the tab bar
>   doesn't look hard-clipped by an opaque bar anymore
>
> **Design: app-wide glassmorphism restyle:**
> - Fixed the real bug behind "cards disappear while barely scrolling" on the Pokedex screen:
>   the scroll-fade math used a hardcoded row-height guess (88px) that didn't match the actual
>   rendered row height, so items were treated as scrolled-past far too early. Now measured live
>   via `onLayout` on the first row; no fade applied until the real height is known.
> - Replaced the thick black ink-outline + hard offset "sticker" shadow look with a translucent
>   glass style everywhere: the shared `Card` and `TypeBadge` components, and every screen's
>   buttons/inputs/chips/rows (`PokemonDetailScreen`, `IvCalculatorScreen`, `ComparisonScreen`,
>   `TypeChartScreen`, `TopRankingsScreen`, `QuizScreen`, `RaidCountersScreen`,
>   `EvolutionChainScreen`, the bottom tab bar) — translucent `glassSurface` fill, thin
>   `glassBorder`, soft diffuse `SHADOW.{sm,md,lg}` instead of a 1px-offset hard shadow twin
> - Verified on the physical device across 5 screens after the restyle (Pokedex scroll-fade,
>   Top Rankings, Tools hub, Raid Counters, Pokemon detail) — no regressions, 52/52 tests still
>   passing, zero TypeScript errors
>
> **Design: Pokémon GO-style Quick Actions HUD + spring bottom sheet:**
> - New `QuickActionsFab` — a floating circular Poke Ball button (thumb-zone, bottom-right) with
>   a continuous "breathing" pulse (`Animated.loop`, scale 1 → 1.08 → 1) and a press scale-down
>   that composes with the pulse via `Animated.multiply`, so pressing doesn't interrupt the loop
> - New `BottomSheetMenu` — reusable, generic (title + item list) slide-up sheet: `Animated.spring`
>   on `translateY` gives a slight overshoot-and-settle bounce on open, a plain `Animated.timing`
>   slide-down on close (no bounce needed on the way out), backdrop fades independently. Each menu
>   item fades + slides in with a per-index delay (staggered entrance)
> - Wired into `PokedexListScreen` (the app's Home) as a "Quick Actions" launcher — IV Calculator,
>   Compare, Type Chart, Raid Counters, Rankings, Quiz — hidden in picker mode
> - New theme tokens: `mint`/`turquoise` energetic accents, `glassSurface`/`glassBorder` (a
>   translucent white for the sheet), `scrimBackdrop`; `Card` already supported pill/rounded
>   shapes and soft shadows, reused as-is
> - **Deliberately built on RN core `Animated`, not Reanimated** — user confirmed via
>   `AskUserQuestion` to keep it that way, since Reanimated needs a native rebuild and this app's
>   Android build has a fragile history this session (see `docs/dev-setup.md`). Both animated
>   values still run on the native thread (`useNativeDriver: true`), so this isn't a JS-thread
>   fallback — just no third-party animation library.
> - Mobile suite still 52/52 passing, zero TypeScript errors app-wide (no new tests — these are
>   pure animation/presentation components with no extractable logic to unit test)
>
> **Mobile: Raid Counters and Evolution Chain viewer (Fase 3.4-3.5):**
> - New `RaidCountersScreen` — pick a boss (grouped by tier: 1★/3★/5★) and an optional weather
>   condition, see the top 10 estimated counters. Reachable from the Tools hub.
> - New `EvolutionChainScreen` — full evolution chain (sprites, types, stats, heuristic candy
>   cost between stages), reachable from a new "Evolution Chain" button on the Pokémon detail
>   screen. Coverage is Gen 1-2 (same range the evolution family data has).
> - Both screens are offline-first, mirroring the existing Type Chart pattern: raid boss data,
>   weather boosts, and evolution families were ported into `mobile/src/data/` as separate
>   copies of the same backend data, not live API calls (see `docs/architecture.md`)
> - New pure use-cases `getRaidCounters.ts` and `getEvolutionChain.ts`, unit tested (4 + 2 tests)
> - Fixed two pre-existing, unrelated TS errors left over from an earlier lore-system merge:
>   `Card` now accepts a `backgroundColor` prop, and `COLORS.retroScreenGreen`/`retroScreenGreenDark`
>   are now defined; deleted the dead, broken `LoreSection.tsx` (unused, not imported anywhere)
> - Mobile suite: **52/52 tests passing**, zero TypeScript errors app-wide
>
> **Backend: Type Chart, PvP, and Raids modules (Fase 2.3-2.5 of the content roadmap):**
> - `GET /api/type-chart` — full 18×18 attacker→defender multiplier matrix
> - `GET /api/type-chart/:type` — weaknesses/resistances/immunities/strong-against for one type
>   (case-insensitive lookup, `BadRequestException` on an unknown type)
> - `GET /api/type-chart/weather/boosts` — which types each weather condition boosts
> - `GET /api/pvp/leagues`, `GET /api/pvp/top/:league?limit=N` — new `PvpModule`,
>   `SpeciesModule` now imports it instead of duplicating `PvpRankingsRepository` as a provider
> - **Bug fix:** `PvpRankingsRepository.findBySpeciesId` never actually filtered by species id
>   (the mock rankings had no `speciesId` field) — `GET /api/species/:id/pvp-rankings` was
>   silently returning all 60 mock rankings relabeled with the requested species' name. Added
>   `speciesId` to the `PvpRanking` domain type and fixed the filter.
> - `GET /api/raids/current`, `GET /api/raids/:id/counters?weather=Rain` — new `RaidsModule`
>   with a curated mock boss rotation (11 Gen 1 bosses across tiers 1/3/5) and a documented
>   *estimated* DPS ranking (`baseAttack × type-effectiveness × STAB`, over an assumed move
>   cycle) — explicitly not a full moveset simulation, since the app has no fast/charge move
>   power+energy+duration database yet
> - 13 new backend unit tests (`typeChartService`, `pvpService`, `raidsService`), full suite:
>   **14/14 passing**
> - Not yet done: wiring these into mobile screens (raid counters, evolution viewer are still
>   mobile-side gaps — see Fase 3 of the roadmap) and the scheduled data-sync job (Fase 2.6)
>
> **Navigation redesign — bottom tabs + scroll-fade Pokedex:**
> - Replaced the growing row of header buttons (Compare/Type Chart/Rankings/Quiz/Overlay Demo —
>   the thing that kept clipping at the screen edge) with a proper 5-tab bottom navigation bar:
>   Pokedex, Tools, Rankings, Quiz, More
> - New `ToolsHubScreen` and `MoreScreen` — card-based hubs (icon + title + one-line description)
>   grouping IV Calculator/Compare/Type Chart and Overlay Demo respectively, so no single screen
>   dumps every feature on the user at once (progressive disclosure over one flat button wall)
> - `PokedexListScreen`'s list now fades each card out as it scrolls past the top of the screen
>   (pure `Animated` API from React Native core — no new native dependency), instead of cards
>   abruptly vanishing under the header
> - Screen transitions use native-stack's `fade_from_bottom` animation for a softer, more modern
>   push than the platform default
> - Navigation types reworked into a root stack (`Tabs`, `PokemonDetail`, `IvCalculator`,
>   `Comparison`, `TypeChart`, `OverlayDemo`) wrapping a tab navigator (`Pokedex`, `Tools`,
>   `Rankings`, `Quiz`, `More`) — any tab can reach any detail/tool screen via React Navigation's
>   automatic bubbling, no prop drilling or manual deep-link wiring needed
>
> **Top rankings + Quiz mode:**
> - New `TopRankingsScreen` — 8 leaderboards (Attack, Defense, Stamina, Bulk, Max CP at level 40
>   with perfect IVs, and PvP score per league), tap any row to open that species' detail screen
> - `use-cases/rankTopPokemon.ts` — sorts/limits by category, unit tested (3 tests)
> - New `QuizScreen` — 10 random multiple-choice questions (type ID, type-effectiveness
>   matchups, generation), score tracking, "Play Again"
> - `use-cases/generateQuiz.ts` — pure question generator with an injectable RNG for
>   deterministic tests (3 tests)
> - Raid counters with DPS and the evolution chain viewer are still planned but blocked on data
>   the app doesn't have yet: a fast/charged move power+energy+duration database (for raid DPS)
>   and full evolution-family data beyond the ~150 species the backend currently has (for the
>   evolution chain viewer) — both need a new data source before implementation, not just UI work
>
> **Pokemon comparison tool:**
> - New `ComparisonScreen` — search-and-select two species inline (no cross-screen picker
>   needed), then see ATK/DEF/STA/Bulk side by side with the higher stat highlighted in green
> - `use-cases/comparePokemon.ts` — pure comparison logic, unit tested (3 tests)
> - Reachable from the Pokédex header ("Compare" button)
> - Verified on the physical device end-to-end (Charizard vs. Blastoise matches real base stats)
>
> **Type effectiveness chart:**
> - New `TypeChartScreen` — pick an attacking type from a chip row, see the full 18-type
>   matchup grouped into Super effective (×2), Not very effective (×0.5), No effect (×0)
> - `domain/type-effectiveness` + `data/type-effectiveness` — same attacker→defender
>   multiplier table as the backend's `TYPE_EFFECTIVENESS`, kept as a separate offline copy
>   (mobile doesn't call the backend — see `docs/architecture.md`)
> - Reachable from the Pokédex header ("Type Chart" button)
> - UI text is English-only for now; a translation/i18n layer is a planned follow-up
>   (tracked separately, not yet started)
> - Verified on the physical device end-to-end (all 3 effectiveness buckets checked against
>   the official chart for Normal and Fire)
>
> **Android install/debug fixes (Xiaomi/HyperOS):**
> - `INSTALL_FAILED_USER_RESTRICTED` fixed by enabling Developer Options → "USB debugging
>   (Security settings)" — see `docs/dev-setup.md` troubleshooting table
> - Documented the cold-start requirement (`am force-stop` + `am start`) needed to force the
>   app to re-fetch the JS bundle from Metro after a fresh install
>
> **Lore system overhaul:**
> - New `lore-data.json` with hand-written content for all 151 Generation 1 species
> - Each species has 8 structured fields: origin, GO relevance, battle tips, easter eggs,
>   GO vs main series differences, evolution costs, shiny rates
> - Intelligent `getLoreWithFallback()` — auto-generates lore from existing stats when
>   hand-written content isn't available
> - `PokemonDetailScreen` updated with categorized lore card and "auto-generated" label
> - All documentation updated (README, architecture, use-cases, flowcharts, dev-setup)
> - **33 tests passing** (all existing tests maintained)

## Getting started

See [docs/dev-setup.md](docs/dev-setup.md) for the full step-by-step local setup (dependencies,
Docker/Postgres, Prisma migrations, running the backend + Metro together, and connecting an
Android emulator or physical device). Quick version:

```bash
npm install
npm --prefix backend install
npm --prefix mobile install
cp .env.example .env
cp backend/.env.example backend/.env
docker compose up -d
cd backend && npx prisma migrate dev --name init && cd ..
npm run dev                        # backend + Metro, keep running
# in a second terminal:
cd mobile && npx react-native run-android   # build + install on emulator
```

## Repository layout

```
mobile/                    # React Native app (TypeScript, bare workflow)
  src/
    domain/                # Business rules — pure TypeScript, no RN deps
    use-cases/             # Application-specific orchestration
    data/                  # Repository implementations + bundled JSON
    presentation/          # UI components (screens, theme, navigation)
  App.tsx                  # Root component
  index.js                 # Entry point

backend/                   # NestJS API (Prisma + PostgreSQL)
  src/
    app.module.ts          # Root module
    app.controller.ts      # Root controller (GET /)
    app.service.ts         # Root service
    presentation/          # Interceptors, pipes
  prisma/
    schema.prisma          # Database schema (Trainer, Team, Species, Type)

docs/                      # Project documentation
  use-cases.md
  entity-relationship-diagram.md
  architecture.md
  dev-setup.md
  coding-standards.md
  legal-compliance.md
  flowcharts/
    overlay-flow.md
    pokedex-flow.md
```

## Documentation

- [Use cases](docs/use-cases.md)
- [Entity-relationship diagram](docs/entity-relationship-diagram.md)
- [Architecture](docs/architecture.md)
- [Overlay flow](docs/flowcharts/overlay-flow.md)
- [Partner Pokédex flow](docs/flowcharts/pokedex-flow.md)
- [Legal & compliance notes](docs/legal-compliance.md)
- [Coding standards](docs/coding-standards.md)
- [Development setup](docs/dev-setup.md)

## License

Source code is MIT-licensed (see [LICENSE](LICENSE)). Pokémon names, designs, and other IP remain
the property of their respective owners and are not covered by this license.
