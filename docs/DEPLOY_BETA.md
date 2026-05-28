# Desplegament beta (beta testers)

Guia pas a pas per penjar ArgueBetter i compartir-la amb amics que la provin i donin feedback.

## Visió general

```
Amics (navegador)
    ↓
[Vercel] Frontend (aquest repo)     ←→  [Supabase] auth + base de dades
    ↓
[Railway / Render] API FastAPI      ←→  Groq (IA)
    ↑
[Stripe] webhooks  →  POST /billing/webhook
```

| Peça | On | Repo / servei |
|------|-----|----------------|
| Frontend | Vercel | `arguebetter-frontend` |
| API | Railway, Render o Fly.io | `arguebetter-api` |
| Base de dades + auth | Supabase | Migracions a `supabase/migrations/` |
| Pagaments | Stripe (mode test per beta) | Webhooks cap a l’API |

---

## Abans de començar

- [ ] Codi a **GitHub** (frontend + API).
- [ ] `npm run build` passa al frontend.
- [ ] Compte **Stripe** en **Test mode** (`sk_test_...`, preus `price_...` de test).
- [ ] Clau **Groq** vàlida per a l’API.

---

## Pas 0 — Preparar repos

1. Puja `arguebetter-frontend` i `arguebetter-api` a GitHub si encara no hi són.
2. Comprova en local:
   - Frontend: `npm run build`
   - API: `pytest` (opcional)

---

## Pas 1 — Supabase (staging recomanat)

Crea un projecte nou (p. ex. **ArgueBetter Staging**) per no barrejar dades de proves amb desenvolupament.

1. [Supabase Dashboard](https://supabase.com/dashboard) → **New project**.
2. **SQL Editor** → executa les migracions **en ordre**:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_practice_sessions.sql`
   - `supabase/migrations/003_simulation_v2.sql`
   - `supabase/migrations/004_stripe_billing.sql`
3. **Settings → API** — guarda:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` (frontend) i `SUPABASE_URL` (API)
   - **anon public** → només frontend
   - **service_role** → només API (mai al frontend)

Les URLs d’auth es configuren al **Pas 5**, quan tinguis la URL de Vercel.

---

## Pas 2 — Desplegar l’API (Railway o Render)

L’API gestiona converses amb IA, crèdits i **webhooks de Stripe**.

### Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → `arguebetter-api`.
2. **Start command** (si cal definir-lo):

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

3. **Variables d’entorn** (veure `arguebetter-api/.env.example`):

   | Variable | Descripció |
   |----------|------------|
   | `SUPABASE_URL` | URL del projecte Supabase staging |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role (secret) |
   | `GROQ_API_KEY` | Clau Groq |
   | `CORS_ORIGINS` | URL del frontend Vercel (Pas 4) |
   | `FRONTEND_URL` | Mateixa URL Vercel (redirects Stripe) |
   | `STRIPE_SECRET_KEY` | `sk_test_...` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` (Pas 3) |
   | `STRIPE_PRICE_PREMIUM_MONTHLY` | `price_...` |
   | `STRIPE_PRICE_PREMIUM_YEARLY` | `price_...` |

4. Copia la URL pública (p. ex. `https://arguebetter-api-production.up.railway.app`).
5. Prova: `GET https://LA-TEVA-URL-API/health` → resposta OK.

### Render

Mateix concepte: Web Service des de GitHub, mateixes variables i comanda `uvicorn`.

**Nota:** Si encara no tens la URL de Vercel, posa un placeholder a `CORS_ORIGINS` i `FRONTEND_URL` i actualitza després del Pas 4.

---

## Pas 3 — Stripe webhooks

Els canvis de pla (`free` → `premium`, crèdits, renovacions) s’apliquen **només via webhooks**, no en obrir Checkout.

### Endpoint

```
POST https://LA-TEVA-URL-API/billing/webhook
```

(A l’API, **no** a Vercel.)

### Configuració al Dashboard

1. [Stripe Dashboard](https://dashboard.stripe.com) → **Test mode** activat.
2. **Developers → Webhooks → Add endpoint**.
3. **Endpoint URL:** `https://LA-TEVA-URL-API/billing/webhook`
4. **Events** (els que processa el backend):

   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

5. Crea l’endpoint → **Signing secret** → copia `whsec_...`.
6. Posa’l a Railway/Render com a `STRIPE_WEBHOOK_SECRET` i **redeploy** l’API.

### Flux

1. L’usuari completa Stripe Checkout.
2. Stripe envia l’event a `/billing/webhook`.
3. L’API verifica la signatura amb `STRIPE_WEBHOOK_SECRET`.
4. L’API actualitza `profiles` a Supabase (pla, crèdits, etc.).

### Provar

1. Stripe → el teu endpoint → **Send test webhook** → `checkout.session.completed` → ha de respondre **200**.
2. Prova real: registre → Pricing → checkout amb targeta `4242 4242 4242 4242` → comprova premium + crèdits.

### Local (desenvolupament)

```bash
stripe listen --forward-to localhost:8000/billing/webhook
```

En producció **no** cal `stripe listen`; Stripe crida la URL pública de l’API.

Més detalls: [`arguebetter-api/README.md`](../../arguebetter-api/README.md) (secció Billing).

---

## Pas 4 — Desplegar el frontend (Vercel)

1. [vercel.com](https://vercel.com) → **Add New Project** → importa `arguebetter-frontend`.
2. Framework: **Next.js** (auto).
3. **Environment variables** (`.env.example`):

   | Variable | Valor |
   |----------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase staging |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
   | `NEXT_PUBLIC_API_URL` | URL pública de l’API (Pas 2) |

4. **Deploy** → obtens p. ex. `https://arguebetter-frontend.vercel.app`.

### Actualitzar l’API

A Railway/Render:

```
CORS_ORIGINS=https://arguebetter-frontend.vercel.app
FRONTEND_URL=https://arguebetter-frontend.vercel.app
```

Redeploy l’API. Això permet:

- Crides des del navegador sense errors CORS (`src/lib/api.ts` crida l’API directament en producció).
- Redirects de Stripe a `/pricing?checkout=success` i `?checkout=cancelled`.

---

## Pas 5 — Auth a Supabase

1. **Authentication → URL Configuration**:
   - **Site URL:** `https://arguebetter-frontend.vercel.app`
   - **Redirect URLs:**
     - `https://arguebetter-frontend.vercel.app/auth/callback`
2. Si uses **Google / GitHub**:
   - Al proveïdor OAuth, mateix redirect URI.
   - Supabase → **Providers** → activat i credencials correctes.

El frontend usa `window.location.origin` per als redirects (`LoginForm`, `RegisterForm`).

---

## Pas 6 — Checklist abans d’enviar l’enllaç

| # | Prova | Resultat esperat |
|---|--------|------------------|
| 1 | Obrir URL Vercel | Landing carrega |
| 2 | Registrar compte | Login / confirmació email |
| 3 | Dashboard | 2 crèdits gratuïts (signup) |
| 4 | Nova pràctica + missatges | Resposta IA (Groq) |
| 5 | Acabar sessió + feedback | OK |
| 6 | Pricing → subscriure’s | Stripe Checkout |
| 7 | Pagar `4242 4242 4242 4242` | Redirect a `/pricing?checkout=success` |
| 8 | Després de pocs segons | Premium + 20 crèdits |
| 9 | Stripe → Webhooks | Events amb ✓ 200 |

**Pagament OK però pla sense canviar** → revisa webhook (URL, `whsec`, logs API).

**Error de xarxa / CORS** → `CORS_ORIGINS` ha de coincidir exactament amb la URL de Vercel.

---

## Pas 7 — Compartir amb beta testers

1. Envia: `https://arguebetter-frontend.vercel.app`
2. Indica:
   - És una **beta**; poden trobar errors.
   - Pagaments en **mode test** (no es cobra de veritat).
   - Com enviar feedback (formulari, WhatsApp, etc.).
3. Opcional: enllaç “Envia feedback” al footer.

---

## Ordre recomanat (resum)

```
1. Supabase staging + migracions 001→004
2. API a Railway/Render (health OK)
3. Vercel frontend → URL pública
4. API: CORS_ORIGINS + FRONTEND_URL = URL Vercel
5. Stripe webhook → STRIPE_WEBHOOK_SECRET → redeploy API
6. Supabase auth URLs
7. Checklist Pas 6
8. Enllaç als amics
```

---

## Cost aproximat (beta)

| Servei | Cost |
|--------|------|
| Vercel (Hobby) | Gratuït |
| Railway / Render | Gratuït o ~5 €/mes |
| Supabase (free) | Gratuït |
| Groq | Segons ús |
| Stripe test | Gratuït |

---

## Errors habituals

| Símptoma | Causa probable | Solució |
|----------|----------------|---------|
| “Cannot reach the practice API” | API caiguda o `NEXT_PUBLIC_API_URL` incorrecta | `/health` de l’API + variable Vercel |
| CORS al xat | `CORS_ORIGINS` sense URL Vercel | Actualitza i redeploy API |
| Login no torna a l’app | Redirect URLs Supabase | Pas 5 |
| Checkout OK, segueix `free` | Webhook falla | Stripe logs + `STRIPE_WEBHOOK_SECRET` |
| OAuth falla | Redirect del proveïdor | Mateixa URL que `/auth/callback` |

---

## Referències

- Frontend env: [`.env.example`](../.env.example)
- API env: [`arguebetter-api/.env.example`](../../arguebetter-api/.env.example)
- API billing / webhooks: [`arguebetter-api/README.md`](../../arguebetter-api/README.md)
- Proxy local (només dev): [`src/app/api/backend/[...path]/route.ts`](../src/app/api/backend/[...path]/route.ts), [`src/lib/api.ts`](../src/lib/api.ts)
