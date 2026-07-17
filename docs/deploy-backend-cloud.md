# Deploy do Backend na Nuvem (Render)

> Para o app ficar 100% independente do PC — o celular do usuário se conecta direto ao backend na nuvem, sem USB, sem WiFi local, sem nada.

## Pré-requisito

- Conta no GitHub com o repositório `pokemon-trainer-companion` sincronizado
- Chave da API Gemini (já está no `.env` do backend)

## Passo a passo (5 minutos)

### 1. Criar conta no Render

1. Acesse https://render.com
2. Clique em **"Get Started"** → **"Sign up with GitHub"**
3. Autorize o Render a acessar seus repositórios públicos
4. **Não precisa de cartão de crédito** — o plano free de Web Services não exige

### 2. Criar o Web Service

1. No dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Conecte o repositório `pokemon-trainer-companion`
3. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `pokemon-trainer-companion` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node dist/main` |
| **Plan** | **Free** ✅ |

### 3. Adicionar variáveis de ambiente

Em **"Environment Variables"**, adicione:

| Chave | Valor |
|-------|-------|
| `GEMINI_API_KEY` | (sua chave do Google AI Studio) |
| `PORT` | `10000` |

### 4. Deploy

1. Clique em **"Deploy Web Service"**
2. Render vai puxar o código, buildar e subir o backend
3. Aguarde uns 2-3 minutos até o status ficar **"Live"** ✅

### 5. Pegar a URL

Assim que o deploy terminar, o Render mostra uma URL tipo:

```
https://pokemon-trainer-companion.onrender.com
```

Teste se funcionou:
```bash
# Substitua pela sua URL
curl https://pokemon-trainer-companion.onrender.com/api/species/1
```

### 6. Atualizar o APK

1. No arquivo `mobile/src/config.ts`, troque a URL pelo seu Render URL:
   ```ts
   export const BACKEND_BASE_URL = 'https://pokemon-trainer-companion.onrender.com/api';
   ```
2. Build o release APK de novo:
   ```bash
   cd mobile/android
   ./gradlew assembleRelease
   ```
3. Instale o APK no celular — agora ele funciona de QUALQUER LUGAR, sem depender do PC

## Limitações do plano Free

- **Sleep após 15 min de inatividade** — se ninguém usar o app por 15 min, o backend "dorme". A primeira requisição depois disso leva ~30s pra acordar.
- **100 GB de transferência/mês** — mais que suficiente pra testes/beta
- **PostgreSQL não incluso no free** — mas o backend trabalha sem banco (dados em JSON)

## Alternativas pagas (quando quiser)

- **Railway** (~$5/mês) — não dorme, PostgreSQL incluso, mais rápido
- **Fly.io** (free tier com 3 VMs) — também não dorme
