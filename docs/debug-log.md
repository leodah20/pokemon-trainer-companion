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

### 5. Kotlin: `Class 'OverlayModule' is not abstract and does not implement abstract members`

**Sintoma:** ao implementar `ActivityEventListener` em `OverlayModule.kt`, o `compileDebugKotlin`
falhava com esse erro, mais `Unresolved reference 'currentActivity'` e
`'onActivityResult' overrides nothing`.

**Causa:** duas coisas ao mesmo tempo — (1) a assinatura real da interface
`ActivityEventListener` do RN usa parâmetros **não-nuláveis**
(`onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?)` e
`onNewIntent(intent: Intent)`), não `Activity?`/`Intent?` como parecia razoável assumir vindo do
Java clássico; (2) `currentActivity` não é uma propriedade direta em `ReactContextBaseJavaModule`
nesta versão — precisa ser `reactApplicationContext.currentActivity`.

**Fix:** ajustar as assinaturas dos overrides pra bater exatamente com a interface (sem `?` nos
parâmetros que a interface não tem) e usar `reactApplicationContext.currentActivity` em vez de
`currentActivity` sozinho. Padrão a lembrar: **ao implementar uma interface de listener do RN
(Java) em Kotlin, checar a assinatura exata na fonte** — o compilador Kotlin não avisa "assinatura
incompatível", ele simplesmente diz que o override "overrides nothing", o que pode confundir com
um erro de import.

---

### 6. `KeyboardAvoidingView` não move o input pra cima no Android

**Sintoma:** na tela de chat (`ProfessorChatScreen`), ao abrir o teclado, a caixa de texto ficava
escondida atrás dele — no iOS o `behavior="padding"` funciona, mas o código tinha
`behavior={Platform.OS === 'ios' ? 'padding' : undefined}`, ou seja, **nenhum comportamento** no
Android.

**Causa:** `undefined` é um valor válido pra essa prop (significa "não faça nada"), então no
Android o `KeyboardAvoidingView` literalmente não reagia ao teclado abrir — mesmo com
`android:windowSoftInputMode="adjustResize"` já declarado no `AndroidManifest.xml`.

**Primeira tentativa (não resolveu sozinha):** trocar pra
`behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`. Testado num device físico depois — o
teclado *ainda* cobria o input. Causa provável: a tela vive dentro de um Fragment nativo do
react-native-screens (native-stack), e o `adjustResize` do manifest não parece se propagar pra
dentro desse Fragment do mesmo jeito que propagaria numa Activity simples — então mesmo com
`behavior="height"` corretamente setado, o `KeyboardAvoidingView` não tinha uma mudança de layout
confiável pra reagir.

**Fix que realmente funcionou (verificado em device físico):** abandonar o `KeyboardAvoidingView`
no Android e rastrear a altura do teclado manualmente via `Keyboard.addListener('keyboardDidShow'
/ 'keyboardDidHide', ...)`, aplicando esse valor como `paddingBottom` no container da tela. iOS
continua usando `KeyboardAvoidingView` normalmente (não teve o mesmo problema). Padrão a lembrar:
**dentro do React Navigation native-stack + react-native-screens no Android, não confiar que
`KeyboardAvoidingView` + `adjustResize` do manifest sejam suficientes — testar em device físico
antes de considerar resolvido, e ter o listener manual de `Keyboard` como plano B confiável.**

---

### 7. Markdown do Gemini aparecendo como asteriscos literais no chat

**Sintoma:** respostas do Professor Mode com `**negrito**` ou listas apareciam com os asteriscos
literais na tela (`**Hydrocanhão**` em vez de **Hydrocanhão** em negrito), já que o texto era
renderizado direto num `<Text>` sem nenhum parser de Markdown.

**Causa:** Gemini formata respostas em Markdown por padrão (é assim que ele "sabe" formatar
naturalmente), mas React Native não tem suporte nativo a Markdown — só texto plano.

**Fix:** `react-native-markdown-display` — biblioteca 100% JS (parser `markdown-it` + componentes
React puros, sem código nativo), então **não precisou de rebuild Gradle**, só recarregar o bundle
do Metro. Precisou entrar em `transformIgnorePatterns` do `jest.config.js` (junto com sua
dependência `react-native-fit-image`), mesmo padrão do item de `@react-native-async-storage`
acima — ver "Padrões pra lembrar".

---

### 8. `IllegalStateException: Must register a callback before starting capture` ao abrir a sessão real de `MediaProjection`

**Sintoma:** implementando a captura de tela ao vivo de verdade (`ScreenCaptureService.kt`), o app
crashava assim que `startLiveCapture()` era chamado, com `FATAL EXCEPTION` no logcat vindo de dentro
de `MediaProjection.createVirtualDisplay()`.

**Causa:** versões recentes do Android (visto no emulador rodando API 36) passaram a exigir que a
app registre um `MediaProjection.Callback` via `registerCallback(...)` **antes** de chamar
`createVirtualDisplay()` — é assim que o sistema avisa a app quando o usuário para o
compartilhamento (ex: pela notificação "Parar compartilhamento"), pra ela liberar
`VirtualDisplay`/`ImageReader` em vez de vazar recursos. Sem o callback registrado, a chamada lança
imediatamente em vez de simplesmente não notificar depois.

**Fix:** registrar o callback logo após `getMediaProjection(...)` e antes de `createVirtualDisplay(...)`:
```kotlin
projection.registerCallback(object : MediaProjection.Callback() {
  override fun onStop() { stopProjection() }
}, Handler(Looper.getMainLooper()))
```

---

### 9. Testar "share one app" no emulador: nenhum frame chega no `ImageReader`

**Sintoma:** com o consentimento de `MediaProjectionManager` no modo "Share one app" (ex: Chrome) e
o serviço rodando sem crash, `captureLatestFrame()` sempre voltava `null` ("No frame ready yet").

**Causa:** no modo "compartilhar um app", o Android só produz frames pro `VirtualDisplay` enquanto
esse app específico está em primeiro plano — como o app escolhido (Chrome) fica em background assim
que se volta pro PTC pra tocar em "Analyze current screen", nenhum frame chega a ser desenhado no
`ImageReader` depois disso. Esse é exatamente o comportamento esperado no uso real (o trainer
escolheria o Pokémon GO como app compartilhado, que ficaria em primeiro plano enquanto o overlay do
PTC flutua por cima via `TYPE_APPLICATION_OVERLAY`), mas atrapalha testar a partir da própria UI de
teste do PTC.

**Fix (só pra testar):** usar "Share entire screen" em vez de "Share one app" — captura o que
estiver fisicamente na tela a qualquer momento, incluindo a própria UI do PTC, sem depender de qual
app está em primeiro plano. Verificado assim: o texto OCR retornado bateu, palavra por palavra, com
o conteúdo real da tela do `OverlayDemoScreen` no instante da captura (inclusive o timer do
indicador de gravação do Android) — prova de que é um frame ao vivo de verdade, não um stub.

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
- **`KeyboardAvoidingView.behavior={undefined}` no Android = nenhum comportamento**, não um padrão
  razoável — mas mesmo setando `'height'` explicitamente, não confiar cegamente nisso dentro de
  React Navigation native-stack + react-native-screens: testar em device físico, e ter o listener
  manual de `Keyboard.addListener` como plano B se o `KeyboardAvoidingView` não reagir de verdade.
- **Texto de LLM (Gemini, etc.) vem formatado em Markdown por padrão** — sempre renderizar respostas
  de IA com um parser de Markdown (`react-native-markdown-display` aqui, JS puro, sem rebuild),
  nunca assumir que vai ser texto plano.
- **`MediaProjection` em Android recente exige `registerCallback(...)` antes de
  `createVirtualDisplay(...)`**, senão lança `IllegalStateException` em runtime — não tem como saber
  isso sem testar de verdade (o compilador não acusa nada).
- **Testar captura "share one app" a partir da própria UI do app que pede a captura é furada** — o
  app compartilhado só produz frames enquanto está em primeiro plano, e a UI de controle geralmente
  é o próprio app que pediu a captura. Pra validar rápido, usar "share entire screen" em vez de
  escolher um app específico.
