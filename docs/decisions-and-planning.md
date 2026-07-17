# Architecture Decisions & Planning

> Documento para o Claude se atualizar sobre o que foi decidido e implementado.

## Estado Atual (Jul 2026)

### O que funciona HOJE no celular (APK release build 1.0.0-beta.1, versionCode=2)

**✅ Tudo offline (dados embarcados no JSON):**
- Pokédex com 965 espécies, busca, filtros, fundo animado
- Detail screen (stats, PvP, battle role, power-up cost)
- IV Calculator (brute-force 4096 combos)
- PvP move rankings por liga
- Bulk percentile ranking
- Lore System (Gen 1 escrito à mão + fallback automático)
- Type effectiveness chart (18×18)
- Pokémon comparison tool
- Top rankings (ATK/DEF/STA/Bulk/CP/PvP)
- Quiz / trivia mode
- Raid counters com DPS estimates
- Evolution chain viewer
- Companion widget (bolha flutuante com diálogo baseado em lore, sem backend)

**✅ Precisa de backend (Companion AI + Gemini):**
- "Ask AI ✨" no widget do companion
- Professor Mode (chat multi-turno)
- **Backend HOSTEADO na nuvem:** `https://pokemon-trainer-companion.onrender.com/api` (Render free tier)
- **Todas as APIs no ar:** Species (/api/species), PvP (/api/pvp), TypeChart (/api/type-chart), Raids (/api/raids), Companion AI (/api/companion/suggest, /api/companion/chat)
- **App 100% standalone:** sem USB, sem WiFi local, sem PC — só instalar o APK e usar

**⚠️ Render free tier:** Dorme após 15 min sem uso. Primeira requisição leva ~30s pra acordar.

**✅ Overlay nativo (Android):**
- Galeria de screenshots → OCR → análise completa
- Live overlay flutuante (MediaProjection + foreground service)
- Polling loop nativo (ML Kit OCR em Kotlin) — funciona mesmo com app em background
- Overlay clicável — abre o app + emite evento `PTCOverlayTapped`
- `updateOverlayText()` — atualiza o texto do overlay sem recriar a janela

### Decisões de Arquitetura

#### 1. Backend é OPCIONAL para o usuário final
- **Decisão:** O app core funciona 100% offline. O backend só é necessário para os recursos de AI (Companion AI, Professor Mode).
- **Motivo:** Usuários que não quiserem configurar backend podem usar todas as ferramentas de cálculo, Pokédex e lore sem depender de nada.
- **Impacto:** O APK release é auto-suficiente. O backend pode ser hosted separadamente ou rodado localmente por quem quiser a AI.

#### 2. Knowledge Base (MVP)
- **Decisão:** Dados do PokeAPI (gênero, habitat, flavor text) para 251 espécies Gen 1+2 importados via script `backend/scripts/fetchKnowledgeBase.mjs`.
- **Motivo:** A IA do Gemini precisa de grounding em fatos reais, não só no treinamento geral do modelo.
- **Próximo passo:** Expandir para além de Gen 2 + fontes mais ricas (Bulbapedia).

#### 3. Chave Gemini API
- **Decisão:** A chave `GEMINI_API_KEY` está no `.env` do backend (gitignorado). O modelo usado é `gemini-flash-lite-latest` (free tier: 1.500 req/dia, sem cartão de crédito).
- **Endpoint suggest:** `POST /api/companion/suggest` → retorna dica contextual sobre uma espécie
- **Endpoint chat:** `POST /api/companion/chat` → conversa multi-turno com histórico
- **Endpoint health:** `POST /api/companion` → health check
- **Ambos funcionando** — testados e respondendo.

#### 4. Build Android
- **Problema resolvido:** MAX_PATH (260 chars) no Windows quebrava CMake/ninja.
- **Solução:** Repositório clonado em `C:\ptc\` (caminho curto de 13 chars).
- **Release signing:** Keystore próprio criado (`release.keystore`, alias `release`, senha `professorDex2024`), configurado no `build.gradle`.
- **Versionamento:** `versionCode=2`, `versionName=1.0.0-beta.1`
- **Debug vs Release:** Debug APK precisa de Metro rodando. Release APK tem JS bundle embutido — instala e abre direto.
- **Ícones:** Pokéball-style gerados via `sharp` (`mobile/scripts/generate-icons.mjs`) nas 5 densidades (mdpi→xxxhdpi)
- **APK release final:** `android/app/build/outputs/apk/release/app-release.apk` (~110 MB)

#### 5. Deploy do Backend (Render — free, sem cartão de crédito)
- **Provedor escolhido:** Render.com (Web Service free tier)
- **Configuração:**
  - Root Directory: `backend`
  - Build Command: `npm install && npm run build`
  - Start Command: `node dist/src/main`
  - `Procfile`: `web: node dist/src/main`
  - `postinstall` no package.json: `prisma generate` (o `generated/` é gitignorado)
- **PrismaService tratado para ambientes sem DATABASE_URL:** Loga warning e não crasha. JSON-backed features (species, PvP, companion) funcionam sem banco.
- **Deploy guide:** `docs/deploy-backend-cloud.md` — passo a passo para subir em 5 min
- **Status:** LIVE ✅ em `https://pokemon-trainer-companion.onrender.com`

#### 6. Instalação em dispositivo físico (Xiaomi Redmi Note, Android 16)
- **Problemas enfrentados:**
  - `adb` tinha emulador + físico conectados → usar `adb -s <serial>` sempre
  - `INSTALL_FAILED_UPDATE_INCOMPATIBLE` entre debug e release (keystore diferente) → desinstalar primeiro
  - `INSTALL_FAILED_USER_RESTRICTED` no Xiaomi → usuário precisa tocar em "Install" na tela
- **adb reverse necessário (só para dev local via WiFi):** `adb -s <serial> reverse tcp:3000 tcp:3000` + `tcp:8081 tcp:8081`
- **Release APK:** Instala direto, sem Metro, sem adb reverse, sem PC

### Plano de Ação

#### ✅ Concluído
- [x] **Build release APK** — `./gradlew assembleRelease` bem-sucedido (múltiplas vezes, ~1min)
- [x] **Instalar APK release no celular** — APK gerado em `app-release.apk` (110 MB)
- [x] **Hostear backend em nuvem** — Render free tier, todas as APIs funcionando
- [x] **App 100% standalone** — APK com `BACKEND_BASE_URL` apontando para Render
- [x] **Ícones do launcher** — Pokéball-style em todas as densidades
- [x] **Documentação** — `docs/deploy-backend-cloud.md`, `docs/decisions-and-planning.md` atualizado
- [x] **PrismaService sem DATABASE_URL** — não crasha, loga warning

#### 🔵 Beta fechado (pre-release)
- [x] **APK release instalado no Xiaomi** — standalone, sem PC
- [x] **Backend na nuvem (Render)** — todas as APIs da nuvem
- [x] **Testar Companion AI via 4G/5G** — sem USB, sem WiFi local
- [ ] **Coletar feedback dos amigos testers** — bugs, sugestões, usabilidade
- [ ] **Abrir pra mais testers** após rodar o feedback loop

#### Curto prazo
- [ ] Type effectiveness chart finalizado no mobile (já tem API, falta UI polida)
- [ ] Testar todas as espécies no Species API (965 espécies via JSON repository)
- [ ] Swagger docs da API (já configurado em `/api/docs`)

#### Médio prazo
- [ ] Expandir knowledge base (Gen 3+)
- [ ] Melhorar overlay (captura contínua sem botão manual)
- [ ] Migrar backend para Railway (~$5/mês) ou Fly.io — sem sleep de 15 min
- [ ] Testar em mais dispositivos (Samsung, Motorola, Pixel)

#### Longo prazo
- [ ] Overlay OCR automático + resultados dentro da janela flutuante
- [ ] Cross-device sync + auth (Google Sign-In)
- [ ] Subscription billing (Stripe/RevenueCat)

### Sistema de Versionamento de Dados (Data Freshness)

Criado para garantir rastreabilidade da atualidade dos dados:

- **Backend:** `backend/src/data/dataVersion.ts` — exposto via `GET /api/system/version`
- **Mobile:** `mobile/src/data/dataVersion.ts` — embarcado no APK
- **Estrutura:** `{ lastUpdated, version, notes, sources: { ... } }` — cada fonte de dados tem sua própria entrada
- **Timestamp atual:** `2026-07-17T14:12:00Z`
- **IA (Gemini):** usa a data atual via `new Date().toISOString()` nas prompts — as respostas são sempre cientes do tempo presente
- **Dados estáticos (species, PvP, raids):** snapshot fixo; atualizar requer re-extração das fontes (PokeAPI, PvPoke) e rebuild do APK + redeploy do backend

### Comandos Úteis (para o Claude)

```bash
# Build release APK
cd C:\ptc\mobile\android
./gradlew assembleRelease

# Instalar no Xiaomi (dispositivo físico)
adb -s 7D7L5POBUGXWR8XO install -r app/build/outputs/apk/release/app-release.apk

# Instalar no emulador
adb -s emulator-5554 install -r app/build/outputs/apk/release/app-release.apk

# Backend: build local
cd C:\ptc\backend
npx nest build

# Deploy manual no Render (após push)
# → Dashboard Render → Manual Deploy → Deploy latest commit

# Git
git add -A
git commit -m "mensagem"
git push origin master
```

### Notas sobre o Projeto

- **Framework:** React Native 0.86 (bare workflow) + NestJS 11
- **Linguagem:** TypeScript ~100% (Kotlin só no módulo nativo overlay)
- **Database:** PostgreSQL 16 + Prisma 7 (schema pronto, migrations não rodadas ainda; backend funciona sem DB)
- **Licença:** MIT — 100% gratuito e open source
- **Propósito:** Portfólio + ferramenta real para treinadores de Pokémon GO
- **Dados:** Todas as fontes são públicas e gratuitas (PoGo API, PvPoke, PokéAPI)
- **ToS-safe:** Sem login na Niantic, sem leitura de memória, sem scraping do jogo
