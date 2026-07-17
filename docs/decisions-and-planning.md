# Architecture Decisions & Planning

> Documento para o Claude se atualizar sobre o que foi decidido e implementado.

## Estado Atual (Jul 2026)

### O que funciona HOJE no celular (APK release build 1.0.0-beta.1)

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

**✅ Precisa de backend rodando (Companion AI + Gemini):**
- "Ask AI ✨" no widget do companion
- Professor Mode (chat multi-turno)
- Backend roda em `localhost:3000` — precisa de `adb reverse tcp:3000 tcp:3000` em dev, ou hosted em produção

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

#### 3. Chave Gemini API já configurada
- **Decisão:** A chave `GEMINI_API_KEY` está no `.env` do backend. O modelo usado é `gemini-flash-lite-latest` (free tier: 1.500 req/dia, sem cartão de crédito).
- **Endpoint suggest:** `POST /api/companion/suggest` → retorna dica contextual sobre uma espécie
- **Endpoint chat:** `POST /api/companion/chat` → conversa multi-turno com histórico
- **Ambos funcionando** — testados e respondendo.

#### 4. Build Android
- **Problema resolvido:** MAX_PATH (260 chars) no Windows quebrava CMake/ninja.
- **Solução:** Repositório clonado em `C:\ptc\` (caminho curto de 13 chars).
- **Release signing:** Keystore próprio criado (`release.keystore`, alias `release`), configurado no `build.gradle`.
- **Versionamento:** `versionCode=2`, `versionName=1.0.0-beta.1`
- **Debug vs Release:** Debug APK precisa de Metro rodando. Release APK tem JS bundle embutido — instala e abre direto.

#### 5. Instalação em dispositivo físico (Xiaomi Redmi Note, Android 16)
- **Problema resolvido:** `adb` não sabia em qual dispositivo instalar (havia emulador + físico conectados).
- **Solução:** Sempre usar `adb -s <serial>` para especificar o dispositivo.
- **adb reverse necessário:** `adb -s <serial> reverse tcp:3000 tcp:3000` + `tcp:8081 tcp:8081`

### Plano de Ação

#### Imediato (beta release)
- [ ] **Completar build release APK** — `./gradlew assembleRelease` (última tentativa não finalizou por timeout)
- [ ] **Instalar APK release no celular** — testar se tudo funciona sem Metro
- [ ] **Hostear backend em algum lugar** (Railway? Render? Fly.io?) para AI funcionar no beta
- [ ] OU: deixar AI como "recurso avançado" que precisa de backend próprio

#### Curto prazo
- [ ] Type effectiveness chart finalizado no mobile (já tem API, falta UI polida)
- [ ] Testar todas as espécies no Species API (965 espécies via JSON repository)
- [ ] Swagger docs da API (já configurado em `/api/docs`)

#### Médio prazo
- [ ] Expandir knowledge base (Gen 3+)
- [ ] Melhorar overlay automático (captura contínua sem botão manual)
- [ ] Escolher plataforma de hosting do backend (Railway? Render?)
- [ ] Testar em mais dispositivos (Samsung, Motorola, Pixel)

#### Longo prazo
- [ ] Overlay OCR automático + resultados dentro da janela flutuante
- [ ] Cross-device sync + auth (Google Sign-In)
- [ ] Subscription billing (Stripe/RevenueCat)

### Notas sobre o Projeto

- **Framework:** React Native 0.86 (bare workflow) + NestJS 11
- **Linguagem:** TypeScript ~100% (Kotlin só no módulo nativo overlay)
- **Database:** PostgreSQL 16 + Prisma 7 (schema pronto, migrations não rodadas ainda)
- **Licença:** MIT — 100% gratuito e open source
- **Propósito:** Portfólio + ferramenta real para treinadores de Pokémon GO
- **Dados:** Todas as fontes são públicas e gratuitas (PoGo API, PvPoke, PokéAPI)
- **ToS-safe:** Sem login na Niantic, sem leitura de memória, sem scraping do jogo
