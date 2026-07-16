# Debug Log

Registro de problemas reais encontrados ao rodar o projeto (não coisas óbvias de configuração inicial),
com a causa raiz e o que resolveu. Objetivo: reconhecer o padrão rápido da próxima vez.

---

## 2026-07-14 — Setup completo do zero no Windows

### 1. Prisma: `Cannot find module '../../generated/prisma'`

**Sintoma:** `nest start --watch` falhava com `TS2307: Cannot find module`.

**Causa:** o generator do Prisma 7 (`provider = "prisma-client"`) gera `client.ts` dentro da pasta,
não um `index.ts` de barril. Além disso o import original só subia dois níveis (`../../`) a partir de
`src/presentation/prisma/`, mas `generated/prisma` fica na raiz de `backend/`, fora de `src/` — faltava
um `../` a mais.

**Fix:** `backend/src/presentation/prisma/prismaService.ts` — import corrigido para
`'../../../generated/prisma/client'`.

---

### 2. Prisma: `ReferenceError: exports is not defined in ES module scope`

**Sintoma:** depois de corrigir o import acima, o backend buildava mas crashava no runtime ao carregar
`dist/generated/prisma/client.js`.

**Causa:** o Prisma 7 gera o client em formato ESM por padrão (usa `import.meta.url`), mas o `tsc` do
backend compila tudo para CommonJS (sem `"type": "module"` no `package.json`). O resultado era um
arquivo `.js` com sintaxe incompatível (CJS `exports` + `import.meta.url` de ESM).

**Fix:** `backend/prisma/schema.prisma` — adicionado `moduleFormat = "cjs"` no bloco `generator client`,
depois `npx prisma generate` de novo.

---

### 3. Prisma: `needs to be constructed with a non-empty, valid PrismaClientOptions`

**Sintoma:** app subia até instanciar `PrismaService`, depois `PrismaClientInitializationError`.

**Causa:** Prisma 7 tirou a URL de conexão do `schema.prisma` (agora só existe em
`prisma.config.ts`, usado só pelo CLI). Em runtime o client não sabe mais a URL sozinho — e além disso
Prisma 7 exige um **driver adapter** explícito (não aceita mais `datasourceUrl` direto como no Prisma 5/6).

**Fix:**
- Instalado `@prisma/adapter-pg` + `pg` (+ `@types/pg` dev).
- `PrismaService` agora recebe `new PrismaPg({ connectionString: process.env.DATABASE_URL })` no
  construtor, passado como `adapter` pro `super()`.
- `main.ts` — adicionado `import 'dotenv/config'` no topo (Nest não carrega `.env` sozinho) e `dotenv`
  adicionado como dependência direta (antes só vinha transitivo do Prisma).

---

### 4. Git Bash / execa não encontra `gradlew.bat`

**Sintoma:** `npx react-native run-android` falhava com
`'gradlew.bat' não é reconhecido como um comando interno ou externo` — tanto via Git Bash quanto via
PowerShell nativo.

**Causa:** o RN CLI usa `execa.sync('gradlew.bat', ...)` sem shell. Em paths com espaço (`Leonardo Build`),
o `cross-spawn`/`execa` não resolve corretamente o `.bat` sem um shell explícito.

**Fix (workaround):** pular o CLI e rodar o Gradle diretamente:
```
cd mobile/android
./gradlew.bat app:installDebug -x lint -PreactNativeDevServerPort=8081
```

---

### 5. CMake/ninja: `Filename longer than 260 characters`

**Sintoma:** build nativo (C++) falhava no `configureCMakeDebug`/`buildCMakeDebug` com ninja reclamando
de paths de objeto `.o` maiores que 260 caracteres.

**Causa:** Windows limita paths a 260 chars por padrão. O checkout mora em
`C:\Users\Leonardo Build\Documents\GitHub\pokemon-trainer-companion\...`, e combinado com os paths
profundos de `node_modules/react-native-*/android/.../CMakeFiles/...` estoura o limite.
`android.useNewLongPaths=true` (gradle.properties) só afeta o AGP, não o `ninja.exe` do CMake do Android
SDK — e mesmo habilitar `LongPathsEnabled=1` no registro do Windows não resolveu (o `ninja.exe`
empacotado é antigo e não respeita o flag sem reiniciar, ou não respeita de jeito nenhum).

**Fix:** existe um diretório `C:\ptc` **que deveria ser** um atalho de path curto pro repo. **Atenção:**
numa sessão anterior ele foi criado como uma **cópia real do projeto** (tem seu próprio `.git`), não um
junction de verdade (`mklink /J`). Isso significa que builds rodados a partir de `C:\ptc` usam um
snapshot desatualizado do código — qualquer mudança feita no checkout original (`node_modules`,
`gradle.properties`, `package.json` etc.) **não aparece automaticamente lá**. Antes de buildar por lá,
sincronizar manualmente os arquivos relevantes, ou (melhor, ainda não feito) apagar `C:\ptc` e recriar
como junction de verdade:
```
mklink /J C:\ptc "C:\Users\Leonardo Build\Documents\GitHub\pokemon-trainer-companion"
```
`C:\ptc` também tem edições não commitadas em `README.md` e `docs/architecture.md` (status da Species
API) e dois arquivos de notas (`PROMPT-PARA-CLAUDE.md`, `UPDATE-PARA-CLAUDE.md`) de uma sessão de debug
anterior sobre esse mesmo problema — vale revisar e trazer pro repo principal antes de descartar a pasta.

---

### 6. `INSTALL_FAILED_USER_RESTRICTED: Install canceled by user`

**Sintoma:** `adb install` / `gradlew installDebug` falhava instantaneamente com esse erro, sem diálogo
visível no celular.

**Causa:** aparelho é um Xiaomi (MIUI/HyperOS). MIUI tem um toggle extra nas Opções do desenvolvedor —
**"Depuração USB (Configurações de segurança)"** — separado do "Depuração USB" normal. Sem ele, MIUI
bloqueia qualquer instalação via ADB.

**Fix:** ativar essa opção específica (pode pedir login numa conta Mi e verificação por SMS na primeira
vez). Depois disso `adb install` funcionou de primeira.

---

### 7. `Invariant Violation: View config not found for component 'BVLinearGradient'`

**Sintoma:** app abria e crashava ao renderizar `PokedexListScreen` (fundo animado com `LinearGradient`).

**Causa:** `react-native-linear-gradient@2.8.3` não tem suporte à Nova Arquitetura (Fabric). O projeto
tem `newArchEnabled=true` — e a partir do RN 0.76+ a Nova Arquitetura é obrigatória (setar
`newArchEnabled=false` não tem efeito nenhum, o app roda em Fabric do mesmo jeito; confirmado no log
`"fabric":true` mesmo com o flag em `false`). Sem view config Fabric, o componente nativo nunca é
registrado.

**Fix:** upgrade pra `react-native-linear-gradient@3.0.0-beta.2`, que tem `codegenConfig` (suporte a
Fabric/codegen). Depois do upgrade, lembrar do problema #5 — o build precisa rodar com o `node_modules`
sincronizado em `C:\ptc` (ou direto no path curto), senão o binário antigo continua sendo usado mesmo
depois do `npm install`.

---

## 2026-07-16 — Persistência, base de conhecimento e overlay nativo

### 1. Jest: `Cannot use import statement outside a module` ao adicionar `@react-native-async-storage/async-storage`

**Sintoma:** todos os testes que importavam (direta ou indiretamente) o novo módulo de storage
falhavam com `SyntaxError: Cannot use import statement outside a module`, apontando pro próprio
pacote em `node_modules`.

**Causa:** `mobile/jest.config.js` já tinha uma lista de exceções em `transformIgnorePatterns` pra
pacotes RN que distribuem ESM não transpilado (`@react-native-ml-kit`, `@react-navigation`, etc.),
mas `@react-native-async-storage` não estava nela. Por padrão o Jest ignora tudo em `node_modules`
pro transform, então o pacote nunca era convertido pra CommonJS.

**Fix:** adicionar `@react-native-async-storage` na mesma lista de exceções em `jest.config.js`.
Padrão a lembrar: **toda vez que uma nova dependência nativa da comunidade RN for instalada, checar
se ela precisa entrar nessa lista** — o sintoma só aparece rodando os testes, não no `tsc` nem no
build nativo.

---

### 2. Script de tradução em lote (Gemini): `Unexpected non-whitespace character after JSON`

**Sintoma:** `mobile/scripts/translateLoreData.mjs` falhava intermitentemente ao fazer parse da
resposta do Gemini pra várias espécies, mesmo pedindo `responseMimeType: 'application/json'` no
`generationConfig`.

**Causa:** o modelo ocasionalmente ecoava um **segundo objeto JSON** (ou texto extra) depois do
objeto válido — a estratégia inicial de "primeiro `{` até o último `}`" concatenava os dois objetos
numa string inválida.

**Fix:** trocar por um parser que escaneia a partir do primeiro `{` e conta chaves balanceadas
(respeitando strings/escapes), parando exatamente no fechamento do primeiro objeto completo e
ignorando qualquer coisa depois. Padrão a lembrar: **ao pedir JSON estruturado de um LLM, nunca
confiar em "do primeiro colchete ao último"** — sempre validar profundidade de chaves.

---

### 3. `adb shell input tap` — coordenadas erradas de forma consistente (não é o widget animado)

**Sintoma:** toques sintéticos via `adb shell input tap X Y`, calculados a partir de um screenshot
(multiplicando as coordenadas exibidas pelo fator de escala indicado), caíam sistematicamente em
elementos **abaixo** do alvo pretendido — inclusive em elementos estáticos como a bottom tab bar,
não só no avatar do Companion que fica balançando.

**Causa:** estimativa visual manual de "onde um elemento está" na imagem tem margem de erro maior
do que a distância entre elementos vizinhos na tela (linhas de lista, tabs). O fator de escala em
si (`wm size` vs. imagem exibida) estava correto — o erro era só na leitura visual da posição.

**Fix:** quando o alvo é a bottom tab bar ou qualquer elemento fixo perto de uma borda, mirar bem
perto da borda real da tela (ex: `y` próximo do total da altura do device) em vez de estimar a
posição miolo. Pra alvos incertos, tirar o screenshot, tocar, tirar outro screenshot e comparar —
não assumir que o primeiro toque acertou. Documentado também em `dev-setup.md`.

---

### 4. Emulador: `screencap` retorna imagem em branco/corrompida depois de sessão longa

**Sintoma:** `adb shell screencap` passou a retornar um PNG sólido branco (ou com ruído tipo
"static" de TV) mesmo com o app em foreground e sem crash no `logcat`.

**Causa:** parece ser um glitch do pipeline gráfico do emulador (SwiftShader) depois de várias
horas de sessão contínua com builds/instalações repetidas — não é um bug do app (confirmado via
`dumpsys window` mostrando o app corretamente em foco, e `logcat` sem `FATAL`/`Exception`).

**Fix:** `adb -s <serial> emu kill` e reiniciar o emulador do zero resolveu. Padrão a lembrar: se um
screenshot parecer errado mas o app não crashou nos logs, suspeitar do emulador antes de suspeitar
do código.

---

## Padrões pra lembrar

- **Prisma 7 mudou bastante** em relação a versões anteriores: sem `index.ts` de barril, formato de
  módulo (`moduleFormat`) importa pro ambiente CJS do Nest, e client exige **driver adapter** em vez de
  URL direta.
- **Builds Android neste projeto sempre rodam via `C:\ptc`** por causa do limite de path do Windows —
  mas essa pasta não é sincronizada automaticamente. Depois de qualquer `npm install` ou mudança em
  `mobile/`, sincronizar manualmente (ou consertar o junction de verdade) antes de buildar.
- **Xiaomi/MIUI exige o toggle extra de "Depuração USB (Configurações de segurança)"** — sem isso,
  qualquer install via ADB falha com `INSTALL_FAILED_USER_RESTRICTED`, mesmo com "Depuração USB" normal
  ativado.
- **Bibliotecas nativas antigas (pre-Fabric) quebram silenciosamente** com `newArchEnabled=true` — o
  erro só aparece em runtime (`View config not found`), não em build time. Verificar se a lib tem
  `codegenConfig` no `package.json` antes de usar.
- **Nova dependência RN da comunidade → checar `jest.config.js`** — se ela ship ESM não transpilado
  (a maioria dos pacotes `@react-native-*` recentes), precisa entrar na exceção de
  `transformIgnorePatterns`, senão os testes quebram mesmo com `tsc`/build nativo passando limpo.
- **JSON estruturado de LLM: sempre parsear com contagem de chaves balanceadas**, nunca "do primeiro
  `{` ao último `}`" — o modelo pode ecoar conteúdo extra depois do objeto válido.
- **Toques sintéticos via `adb shell input tap` erram com frequência**, mesmo em elementos estáticos
  — não é exclusivo de widgets animados. Screenshot → toque → novo screenshot pra confirmar, sempre;
  nunca assumir que o toque acertou. Pra alvos perto de uma borda (tab bar, FAB), mirar perto da
  borda real em vez do meio estimado.
- **`screencap` do emulador pode "vidrar" (branco/corrompido) depois de sessão longa** sem que seja
  um bug do app — checar `logcat` por `FATAL`/`Exception` antes de suspeitar do código; se estiver
  limpo, reiniciar o emulador resolve.
